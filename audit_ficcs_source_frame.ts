import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const seed = 'FICCS-v0.6.1-source-frame-order-2026-09-27';
const bytes = readFileSync('ficcs/source_frame_v1.jsonl');
const frame = bytes.toString('utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const candidates = readFileSync('ficcs/source_candidates_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
assert.equal(frame.length, candidates.length, 'frozen frame must preserve every disposition');
assert.equal(new Set(frame.map((record) => record.document_id)).size, frame.length, 'duplicate frame document ID');

for (const record of frame) {
  assert(['eligible', 'excluded'].includes(record.eligibility_status), `unresolved disposition: ${record.document_id}`);
  const expected = createHash('sha256').update(Buffer.from(`${seed}\n${record.source_type}\n${record.canonical_url}`, 'utf8')).digest('hex');
  assert.equal(record.frozen_order_key, expected, `incorrect order key: ${record.document_id}`);
}
const sorted = [...frame].sort((a, b) => a.source_type.localeCompare(b.source_type)
  || a.frozen_order_key.localeCompare(b.frozen_order_key)
  || a.canonical_url.localeCompare(b.canonical_url));
assert.deepEqual(frame.map((record) => record.document_id), sorted.map((record) => record.document_id), 'frame order is not deterministic');

const eligible = frame.filter((record) => record.eligibility_status === 'eligible');
const eligibleCounts = Object.fromEntries(['research', 'platform', 'government', 'journalism']
  .map((type) => [type, eligible.filter((record) => record.source_type === type).length]));
assert.equal(eligible.length, 60, 'registered source-document minimum not met');
assert.deepEqual(eligibleCounts, { research: 16, platform: 13, government: 13, journalism: 18 });

console.log(JSON.stringify({
  status: 'passed',
  records: frame.length,
  eligible_records: eligible.length,
  excluded_records: frame.length - eligible.length,
  eligible_by_source_type: eligibleCounts,
  seed,
  source_frame_sha256: createHash('sha256').update(bytes).digest('hex'),
  primary_claims_extracted: 0,
}, null, 2));
