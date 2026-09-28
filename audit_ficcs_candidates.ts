import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const path = resolve(folder, 'ficcs', 'source_candidates_v1.jsonl');
const bytes = readFileSync(path);
const records = bytes.toString('utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const types = ['research', 'platform', 'government', 'journalism'];

assert.equal(records.length, 60);
assert.equal(new Set(records.map((record) => record.document_id)).size, records.length, 'duplicate document ID');
assert.equal(new Set(records.map((record) => record.canonical_url)).size, records.length, 'duplicate canonical URL');
for (const record of records) {
  assert(/^ficcs_doc_[a-z0-9_]+$/.test(record.document_id), `invalid ID: ${record.document_id}`);
  assert(types.includes(record.source_type), `invalid source type: ${record.document_id}`);
  assert(record.canonical_url.startsWith('https://'), `non-HTTPS URL: ${record.document_id}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(record.published_date), `invalid date: ${record.document_id}`);
  assert.equal(record.eligibility_status, 'pending', `premature eligibility decision: ${record.document_id}`);
  assert.equal(record.frozen_order_key, null, `order key calculated before frame completion: ${record.document_id}`);
  assert(record.duplicate_family_id, `duplicate family missing: ${record.document_id}`);
}

const counts = Object.fromEntries(types.map((type) => [type, records.filter((record) => record.source_type === type).length]));
assert.deepEqual(counts, { research: 16, platform: 13, government: 13, journalism: 18 });

console.log(JSON.stringify({
  status: 'passed',
  candidate_records: records.length,
  counts,
  eligibility_decisions: 0,
  source_frame_frozen: false,
  sha256: createHash('sha256').update(bytes).digest('hex'),
}, null, 2));
