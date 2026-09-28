import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SEED = 'FICCS-v0.6.1-source-frame-order-2026-09-27';
const SOURCE_TYPES = new Set(['research', 'platform', 'government', 'journalism']);
const TRACKING = /^(utm_.+|gclid|fbclid)$/i;
const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex');

function canonicalizeUrl(input: string): string {
  const url = new URL(input.normalize('NFC'));
  assert.equal(url.protocol, 'https:', `source URL must use HTTPS: ${input}`);
  url.hash = '';
  const retained = [...url.searchParams.entries()]
    .filter(([name]) => !TRACKING.test(name))
    .sort(([nameA, valueA], [nameB, valueB]) => nameA === nameB ? valueA.localeCompare(valueB) : nameA.localeCompare(nameB));
  url.search = '';
  for (const [name, value] of retained) url.searchParams.append(name, value);
  if (url.pathname !== '/' && url.pathname.endsWith('/')) url.pathname = url.pathname.slice(0, -1);
  return url.toString().normalize('NFC');
}

function orderKey(sourceType: string, canonicalUrl: string): string {
  return sha256(Buffer.from(`${SEED}\n${sourceType}\n${canonicalUrl}`, 'utf8'));
}

const inputArg = process.argv.find((value) => value.startsWith('--input='));
const outputArg = process.argv.find((value) => value.startsWith('--output='));
assert(inputArg && outputArg, 'usage: node --experimental-strip-types build_ficcs_source_frame.ts --input=candidates.jsonl --output=source_frame.jsonl');
const inputPath = resolve(inputArg.slice('--input='.length));
const outputPath = resolve(outputArg.slice('--output='.length));
const records = readFileSync(inputPath, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
assert(records.length > 0, 'candidate frame is empty');

const seenIds = new Set<string>();
const seenUrls = new Set<string>();
for (const record of records) {
  assert(/^ficcs_doc_[a-z0-9_]+$/.test(record.document_id), `invalid document_id: ${record.document_id}`);
  assert(!seenIds.has(record.document_id), `duplicate document_id: ${record.document_id}`);
  seenIds.add(record.document_id);
  assert(SOURCE_TYPES.has(record.source_type), `invalid source_type: ${record.document_id}`);
  assert(['pending', 'eligible', 'excluded', 'inaccessible'].includes(record.eligibility_status), `invalid eligibility_status: ${record.document_id}`);
  assert(record.title && record.author_or_institution && record.published_date && record.discovered_by && record.duplicate_family_id,
    `missing required metadata: ${record.document_id}`);
  record.canonical_url = canonicalizeUrl(record.canonical_url);
  assert(!seenUrls.has(record.canonical_url), `duplicate canonical_url: ${record.canonical_url}`);
  seenUrls.add(record.canonical_url);
  record.frozen_order_key = orderKey(record.source_type, record.canonical_url);
}

records.sort((a, b) => a.source_type.localeCompare(b.source_type)
  || a.frozen_order_key.localeCompare(b.frozen_order_key)
  || a.canonical_url.localeCompare(b.canonical_url));
const serialized = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`;
writeFileSync(outputPath, serialized);

const counts = Object.fromEntries([...SOURCE_TYPES].sort().map((type) => [type, records.filter((record) => record.source_type === type).length]));
console.log(JSON.stringify({
  status: 'passed',
  seed: SEED,
  records: records.length,
  counts,
  output_sha256: sha256(serialized),
  output: outputPath,
}, null, 2));
