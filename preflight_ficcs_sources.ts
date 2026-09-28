import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const inputArg = process.argv.find((value) => value.startsWith('--input='));
const outputArg = process.argv.find((value) => value.startsWith('--output='));
assert(inputArg && outputArg,
  'usage: node --experimental-strip-types preflight_ficcs_sources.ts --input=candidates.jsonl --output=preflight.jsonl');

const inputPath = resolve(inputArg.slice('--input='.length));
const outputPath = resolve(outputArg.slice('--output='.length));
const candidates = readFileSync(inputPath, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const retrievedAt = new Date().toISOString();
const timeoutMs = 25_000;
const concurrency = 6;

type Result = {
  document_id: string;
  requested_url: string;
  resolved_url: string | null;
  http_status: number | null;
  content_type: string | null;
  retrieved_at: string;
  byte_count: number;
  source_sha256: string | null;
  access_result: 'retrieved' | 'http_error' | 'network_error';
  error: string | null;
};

async function inspect(candidate: Record<string, unknown>): Promise<Result> {
  const documentId = String(candidate.document_id);
  const requestedUrl = String(candidate.canonical_url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(requestedUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'FICCS-source-preflight/0.1 (+https://github.com/jcatster7/foreign-influence-evidence-observatory)' },
    });
    const digest = createHash('sha256');
    let byteCount = 0;
    if (response.body) {
      for await (const chunk of response.body) {
        const bytes = Buffer.from(chunk);
        byteCount += bytes.length;
        digest.update(bytes);
      }
    }
    return {
      document_id: documentId,
      requested_url: requestedUrl,
      resolved_url: response.url || null,
      http_status: response.status,
      content_type: response.headers.get('content-type'),
      retrieved_at: retrievedAt,
      byte_count: byteCount,
      source_sha256: digest.digest('hex'),
      access_result: response.ok ? 'retrieved' : 'http_error',
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      document_id: documentId,
      requested_url: requestedUrl,
      resolved_url: null,
      http_status: null,
      content_type: null,
      retrieved_at: retrievedAt,
      byte_count: 0,
      source_sha256: null,
      access_result: 'network_error',
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

const results: Result[] = new Array(candidates.length);
let nextIndex = 0;
async function worker(): Promise<void> {
  while (nextIndex < candidates.length) {
    const index = nextIndex++;
    results[index] = await inspect(candidates[index]);
  }
}
await Promise.all(Array.from({ length: Math.min(concurrency, candidates.length) }, () => worker()));

writeFileSync(outputPath, `${results.map((record) => JSON.stringify(record)).join('\n')}\n`);
const counts = Object.fromEntries(['retrieved', 'http_error', 'network_error']
  .map((status) => [status, results.filter((result) => result.access_result === status).length]));
console.log(JSON.stringify({ status: 'completed', records: results.length, counts, output: outputPath }, null, 2));
