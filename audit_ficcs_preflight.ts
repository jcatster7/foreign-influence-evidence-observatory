import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const candidates = readFileSync('ficcs/source_candidates_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const checks = readFileSync('ficcs/source_preflight_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));

assert.equal(checks.length, candidates.length, 'preflight must cover every candidate exactly once');
assert.equal(new Set(checks.map((record) => record.document_id)).size, checks.length, 'duplicate preflight document ID');
const byId = new Map(checks.map((record) => [record.document_id, record]));
for (const candidate of candidates) {
  const check = byId.get(candidate.document_id);
  assert(check, `missing preflight: ${candidate.document_id}`);
  assert.equal(check.requested_url, candidate.canonical_url, `stale preflight URL: ${candidate.document_id}`);
  assert(['retrieved', 'http_error', 'network_error'].includes(check.access_result), `invalid result: ${candidate.document_id}`);
  assert(/^\d{4}-\d{2}-\d{2}T/.test(check.retrieved_at), `invalid timestamp: ${candidate.document_id}`);
  if (check.access_result === 'retrieved') {
    assert(check.http_status >= 200 && check.http_status < 300, `retrieved with non-success status: ${candidate.document_id}`);
    assert(check.byte_count > 0, `empty response: ${candidate.document_id}`);
    assert(/^[a-f0-9]{64}$/.test(check.source_sha256), `missing response digest: ${candidate.document_id}`);
  }
}

const counts = Object.fromEntries(['retrieved', 'http_error', 'network_error']
  .map((status) => [status, checks.filter((record) => record.access_result === status).length]));
console.log(JSON.stringify({ status: 'passed', candidate_records: candidates.length, counts }, null, 2));
