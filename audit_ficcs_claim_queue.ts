import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sourceTypes = ['research', 'platform', 'government', 'journalism'];
const frame = readFileSync('ficcs/source_frame_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const slots = readFileSync('ficcs/claim_selection_queue_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
assert.equal(new Set(slots.map((slot) => slot.selection_slot_id)).size, slots.length, 'duplicate selection slot');

let expectedTotal = 0;
for (const sourceType of sourceTypes) {
  const documents = frame.filter((record) => record.source_type === sourceType && record.eligibility_status === 'eligible');
  const stratum = slots.filter((slot) => slot.source_type === sourceType);
  expectedTotal += documents.length * 5;
  assert.equal(stratum.length, documents.length * 5, `incorrect slot count: ${sourceType}`);
  for (let round = 1; round <= 5; round++) {
    const cycle = stratum.filter((slot) => slot.claim_round === round);
    assert.deepEqual(cycle.map((slot) => slot.document_id), documents.map((record) => record.document_id),
      `source-frame order changed in ${sourceType} round ${round}`);
  }
}
assert.equal(slots.length, expectedTotal);
for (const slot of slots) {
  assert(['pending', 'selected', 'exhausted'].includes(slot.status), `invalid slot disposition: ${slot.selection_slot_id}`);
  assert.equal(slot.status === 'selected', Boolean(slot.claim_id), `claim-link mismatch: ${slot.selection_slot_id}`);
  assert.equal(slot.status !== 'pending', Boolean(slot.disposition_reason), `disposition-reason mismatch: ${slot.selection_slot_id}`);
}
const selected = slots.filter((slot) => slot.status === 'selected');
for (const sourceType of sourceTypes) {
  const traversal = slots.filter((slot) => slot.source_type === sourceType)
    .sort((a, b) => a.traversal_position - b.traversal_position);
  let reachedPending = false;
  for (const slot of traversal) {
    if (slot.status === 'pending') reachedPending = true;
    else assert.equal(reachedPending, false, `processed slot after pending frontier: ${slot.selection_slot_id}`);
  }
  assert(selected.filter((slot) => slot.source_type === sourceType).length <= 25, `stratum quota exceeded: ${sourceType}`);
}

console.log(JSON.stringify({ status: 'passed', slots: slots.length, rounds_per_document: 5,
  selected_claims: selected.length,
  selected_by_source_type: Object.fromEntries(sourceTypes.map((type) => [type, selected.filter((slot) => slot.source_type === type).length])),
  target_claims: 100, target_per_source_type: 25 }, null, 2));
