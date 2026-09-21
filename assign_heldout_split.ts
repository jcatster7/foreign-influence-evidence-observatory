import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CLAIMS = ['origin', 'operation_attribution', 'automation', 'coordination', 'deception', 'exposure', 'recommendation', 'impact'] as const;
const SALT = 'foreign-influence-observatory-heldout-v0.4.0';
const HASH = /^[a-f0-9]{64}$/;

type Claim = typeof CLAIMS[number];
type Candidate = {
  case_id: string;
  group_id: string;
  dataset_id: string;
  time_block: string;
  platform: string;
  primary_claim: Claim;
  evidence_bundle_sha256: string;
  reference_commitment_sha256: string;
  independent_consensus_complete: true;
  rights_reviewed: true;
  prior_known_overlap: false;
};

function argument(name: string): string {
  const prefix = `--${name}=`;
  const value = process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length);
  assert(value, `missing --${name}=...`);
  return resolve(value);
}

function digest(value: string): string {
  return createHash('sha256').update(`${SALT}\u0000${value}`).digest('hex');
}

const candidatePath = argument('candidates');
const outputPath = argument('out');
const summaryPath = argument('summary');
const candidateBytes = readFileSync(candidatePath);
const candidates = candidateBytes.toString('utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line) as Candidate & Record<string, unknown>);
assert(candidates.length > 0, 'candidate file is empty');

const allowedFields = new Set([
  'case_id', 'group_id', 'dataset_id', 'time_block', 'platform', 'primary_claim',
  'evidence_bundle_sha256', 'reference_commitment_sha256',
  'independent_consensus_complete', 'rights_reviewed', 'prior_known_overlap',
]);
const caseIds = new Set<string>();
const groupMap = new Map<string, Candidate[]>();
for (const item of candidates) {
  assert.deepEqual(Object.keys(item).sort(), [...allowedFields].sort(), `candidate schema mismatch: ${item.case_id ?? 'unknown'}`);
  assert(item.case_id && item.group_id && item.dataset_id && item.time_block && item.platform, 'blank candidate identifier');
  assert(CLAIMS.includes(item.primary_claim), `invalid primary claim: ${item.case_id}`);
  assert(HASH.test(item.evidence_bundle_sha256), `invalid evidence hash: ${item.case_id}`);
  assert(HASH.test(item.reference_commitment_sha256), `invalid reference commitment: ${item.case_id}`);
  assert.equal(item.independent_consensus_complete, true, `consensus incomplete: ${item.case_id}`);
  assert.equal(item.rights_reviewed, true, `rights review incomplete: ${item.case_id}`);
  assert.equal(item.prior_known_overlap, false, `prior-known overlap: ${item.case_id}`);
  assert(!caseIds.has(item.case_id), `duplicate case: ${item.case_id}`);
  caseIds.add(item.case_id);
  groupMap.set(item.group_id, [...(groupMap.get(item.group_id) ?? []), item]);
}

type Group = { group_id: string; dataset_id: string; time_block: string; platform: string; claims: Set<Claim>; hash: string };
const groups: Group[] = [];
for (const [groupId, rows] of groupMap) {
  const first = rows[0];
  for (const item of rows) {
    assert.equal(item.dataset_id, first.dataset_id, `dataset differs within group: ${groupId}`);
    assert.equal(item.time_block, first.time_block, `time block differs within group: ${groupId}`);
    assert.equal(item.platform, first.platform, `platform differs within group: ${groupId}`);
  }
  groups.push({ group_id: groupId, dataset_id: first.dataset_id, time_block: first.time_block,
    platform: first.platform, claims: new Set(rows.map((item) => item.primary_claim)), hash: digest(groupId) });
}

const poolPlatforms = new Set(groups.map((item) => item.platform));
const poolClaims = new Set(candidates.map((item) => item.primary_claim));
assert(groups.length >= 24, `need at least 24 dataset/time groups; found ${groups.length}`);
assert(poolPlatforms.size >= 4, `need at least four platforms; found ${poolPlatforms.size}`);
assert(poolClaims.size >= 4, `need at least four primary claims; found ${poolClaims.size}`);

const target = Math.ceil(groups.length * 0.25);
assert(target >= 6, 'held-out target must include at least six groups');
const selected = new Map<string, Group>();
const platformOrder = [...poolPlatforms].sort((a, b) => digest(`platform:${a}`).localeCompare(digest(`platform:${b}`))).slice(0, 3);
for (const platform of platformOrder) {
  const choice = groups.filter((item) => item.platform === platform).sort((a, b) => a.hash.localeCompare(b.hash))[0];
  selected.set(choice.group_id, choice);
}

function selectedClaims(): Set<Claim> {
  return new Set([...selected.values()].flatMap((item) => [...item.claims]));
}
while (selectedClaims().size < 3) {
  const current = selectedClaims();
  const options = groups.filter((item) => !selected.has(item.group_id)).map((item) => ({ item,
    gain: [...item.claims].filter((claim) => !current.has(claim)).length })).filter((item) => item.gain > 0)
    .sort((a, b) => b.gain - a.gain || a.item.hash.localeCompare(b.item.hash));
  assert(options.length > 0, 'unable to cover three held-out claims');
  selected.set(options[0].item.group_id, options[0].item);
}
for (const item of [...groups].sort((a, b) => a.hash.localeCompare(b.hash))) {
  if (selected.size >= target) break;
  selected.set(item.group_id, item);
}
assert.equal(selected.size, target, 'held-out selection size mismatch');

const assignments = candidates.map((item) => ({
  case_id: item.case_id,
  group_id: item.group_id,
  partition: selected.has(item.group_id) ? 'held_out' : 'development',
  evidence_bundle_sha256: item.evidence_bundle_sha256,
  reference_commitment_sha256: item.reference_commitment_sha256,
})).sort((a, b) => a.case_id.localeCompare(b.case_id));
const output = assignments.map((item) => JSON.stringify(item)).join('\n') + '\n';
writeFileSync(outputPath, output);

const heldout = [...selected.values()].sort((a, b) => a.hash.localeCompare(b.hash));
const summary = {
  protocol: 'v0.4.0-heldout-amendment',
  salt: SALT,
  candidate_file_sha256: createHash('sha256').update(candidateBytes).digest('hex'),
  assignment_file_sha256: createHash('sha256').update(output).digest('hex'),
  cases: candidates.length,
  dataset_time_groups: groups.length,
  held_out_groups: heldout.length,
  development_groups: groups.length - heldout.length,
  pool_platforms: [...poolPlatforms].sort(),
  pool_primary_claims: [...poolClaims].sort(),
  held_out_platforms: [...new Set(heldout.map((item) => item.platform))].sort(),
  held_out_primary_claims: [...new Set(heldout.flatMap((item) => [...item.claims]))].sort(),
  held_out_group_ids: heldout.map((item) => item.group_id),
  group_leakage_check: 'passed',
  labels_revealed: false,
  predictions_scored: false,
  split_established: true,
};
assert(summary.held_out_platforms.length >= 3, 'held-out split lacks three platforms');
assert(summary.held_out_primary_claims.length >= 3, 'held-out split lacks three primary claims');
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
