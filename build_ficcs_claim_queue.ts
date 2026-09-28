import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const sourceTypes = ['research', 'platform', 'government', 'journalism'];
const frame = readFileSync('ficcs/source_frame_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const slots: Record<string, unknown>[] = [];

for (const sourceType of sourceTypes) {
  const documents = frame.filter((record) => record.source_type === sourceType && record.eligibility_status === 'eligible');
  assert(documents.length > 0, `empty eligible stratum: ${sourceType}`);
  let traversalPosition = 0;
  for (let round = 1; round <= 5; round++) {
    for (let sourceOrder = 1; sourceOrder <= documents.length; sourceOrder++) {
      const document = documents[sourceOrder - 1];
      traversalPosition++;
      slots.push({
        selection_slot_id: `ficcs_slot_${sourceType}_${String(traversalPosition).padStart(3, '0')}`,
        source_type: sourceType,
        document_id: document.document_id,
        source_order: sourceOrder,
        claim_round: round,
        traversal_position: traversalPosition,
        status: 'pending',
        claim_id: null,
        disposition_reason: null,
      });
    }
  }
}

writeFileSync('ficcs/claim_selection_queue_v1.jsonl', `${slots.map((slot) => JSON.stringify(slot)).join('\n')}\n`);
console.log(JSON.stringify({ status: 'passed', slots: slots.length,
  by_source_type: Object.fromEntries(sourceTypes.map((type) => [type, slots.filter((slot) => slot.source_type === type).length])),
  selected_claims: 0 }, null, 2));
