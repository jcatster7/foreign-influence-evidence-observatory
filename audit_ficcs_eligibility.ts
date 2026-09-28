import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const candidates = readFileSync('ficcs/source_candidates_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const decisions = readFileSync('ficcs/source_eligibility_v1.jsonl', 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const validConstructs = new Set(['O', 'P', 'A', 'C', 'D', 'E', 'R', 'I']);

assert.equal(decisions.length, candidates.length, 'eligibility log must cover every candidate');
assert.equal(new Set(decisions.map((record) => record.document_id)).size, decisions.length, 'duplicate eligibility record');
const byId = new Map(decisions.map((record) => [record.document_id, record]));
for (const candidate of candidates) {
  const decision = byId.get(candidate.document_id);
  assert(decision, `missing eligibility decision: ${candidate.document_id}`);
  assert.equal(decision.decision, candidate.eligibility_status, `decision mismatch: ${candidate.document_id}`);
  assert.equal(decision.claim_coding_performed, false, `screening contaminated by claim coding: ${candidate.document_id}`);
  assert(decision.basis_summary && decision.verification_method && decision.reviewer && decision.reviewed_on,
    `incomplete eligibility audit trail: ${candidate.document_id}`);
  assert(Array.isArray(decision.screening_construct_cues), `missing screening cues: ${candidate.document_id}`);
  for (const cue of decision.screening_construct_cues) assert(validConstructs.has(cue), `invalid cue ${cue}: ${candidate.document_id}`);
  if (candidate.eligibility_status === 'eligible') assert(decision.screening_construct_cues.length > 0, `eligible without cue: ${candidate.document_id}`);
  if (candidate.eligibility_status === 'excluded') assert.equal(decision.screening_construct_cues.length, 0, `excluded with cue: ${candidate.document_id}`);
}

const eligible = candidates.filter((record) => record.eligibility_status === 'eligible');
const counts = Object.fromEntries(['research', 'platform', 'government', 'journalism']
  .map((type) => [type, eligible.filter((record) => record.source_type === type).length]));
assert(eligible.length >= 60, 'registered 60-document minimum not met');
console.log(JSON.stringify({ status: 'passed', decisions: decisions.length, eligible: eligible.length,
  excluded: candidates.length - eligible.length, eligible_by_source_type: counts, claim_coding_performed: 0 }, null, 2));
