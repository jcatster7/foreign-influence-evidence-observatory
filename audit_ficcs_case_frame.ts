import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const extractions = readFileSync('ficcs/claim_extractions_v1.jsonl','utf8').trim().split('\n').map(JSON.parse);
const byId = new Map(extractions.map(x => [x.claim_id,x]));
const frameBytes = readFileSync('ficcs/case_study_frame_v1.json');
const frame = JSON.parse(frameBytes.toString('utf8'));
assert.equal(frame.status,'boundaries_frozen_coding_pending');
assert.equal(frame.empirical_findings,false);
assert.equal(frame.cases.length,3);
const used = new Set<string>();
for (const item of frame.cases) {
  assert(item.claim_ids.length >= 2, `${item.case_id} has too few corpus claims`);
  assert(item.audit_focus.length > 0);
  for (const id of item.claim_ids) {
    assert(!used.has(id), `claim reused across cases: ${id}`); used.add(id);
    const claim = byId.get(id); assert(claim, `unknown claim: ${id}`);
    assert.equal(claim.corpus_role,'primary'); assert.equal(claim.extraction_status.claim_coding_started,false);
  }
}
assert(frame.cases.some((x:any)=>x.case_id.includes('ira')));
assert(frame.cases.some((x:any)=>x.case_id.includes('doppelganger')));
assert(frame.cases.some((x:any)=>x.case_id.includes('spamouflage')));
console.log(JSON.stringify({status:'passed',cases:frame.cases.length,primary_claims:used.size,case_frame_sha256:createHash('sha256').update(frameBytes).digest('hex'),coding_started:false,empirical_findings:false},null,2));
