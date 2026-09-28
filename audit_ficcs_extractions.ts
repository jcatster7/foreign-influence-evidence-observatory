import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const constructs = new Set(['O', 'P', 'A', 'C', 'D', 'E', 'R', 'I']);
const frame = readFileSync('ficcs/source_frame_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const queue = readFileSync('ficcs/claim_selection_queue_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const extractions = readFileSync('ficcs/claim_extractions_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const frameById = new Map(frame.map((record) => [record.document_id, record]));
const slotById = new Map(queue.map((record) => [record.selection_slot_id, record]));

assert.equal(new Set(extractions.map((record) => record.claim_id)).size, extractions.length, 'duplicate claim ID');
assert.equal(new Set(extractions.map((record) => record.selection_slot_id)).size, extractions.length, 'duplicate selected slot');
for (const record of extractions) {
  assert(/^ficcs_claim_[a-z0-9_]+$/.test(record.claim_id), `invalid claim ID: ${record.claim_id}`);
  assert.equal(record.corpus_role, 'primary', `invalid corpus role: ${record.claim_id}`);
  const document = frameById.get(record.source.document_id);
  assert(document && document.eligibility_status === 'eligible', `claim source is not eligible: ${record.claim_id}`);
  for (const field of ['source_type', 'title', 'author_or_institution', 'published_date', 'canonical_url'])
    assert.equal(record.source[field], document[field], `source metadata mismatch (${field}): ${record.claim_id}`);
  const slot = slotById.get(record.selection_slot_id);
  assert(slot, `selection slot missing: ${record.claim_id}`);
  assert.equal(slot.status, 'selected', `slot not selected: ${record.claim_id}`);
  assert.equal(slot.claim_id, record.claim_id, `slot claim mismatch: ${record.claim_id}`);
  assert.equal(slot.document_id, record.source.document_id, `slot document mismatch: ${record.claim_id}`);
  const wordCount = record.claim.verbatim_excerpt.trim().split(/\s+/u).length;
  assert.equal(record.source.quote_word_count, wordCount, `quote count mismatch: ${record.claim_id}`);
  assert(wordCount <= 25, `quotation exceeds 25 words: ${record.claim_id}`);
  assert(record.claim.asserted_constructs.length > 0, `no asserted construct: ${record.claim_id}`);
  for (const code of record.claim.asserted_constructs) assert(constructs.has(code), `invalid construct ${code}: ${record.claim_id}`);
  assert.equal(record.extraction_status.claim_coding_started, false, `coding contaminated selection: ${record.claim_id}`);
}
assert.equal(queue.filter((slot) => slot.status === 'selected').length, extractions.length, 'selected queue/extraction count mismatch');

const sourceTypes = ['research', 'platform', 'government', 'journalism'];
console.log(JSON.stringify({ status: 'passed', extracted_claims: extractions.length,
  by_source_type: Object.fromEntries(sourceTypes.map((type) => [type, extractions.filter((record) => record.source.source_type === type).length])),
  claim_coding_started: 0, quotation_limit_passed: true }, null, 2));
