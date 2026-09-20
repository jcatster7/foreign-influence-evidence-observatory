import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type Claim = 'origin' | 'operation_attribution' | 'automation' | 'coordination' | 'deception' | 'exposure' | 'recommendation' | 'impact';
type Label = 'supported' | 'contradicted' | 'unknown';
type Case = { case_id: string; dataset_id: string; source: string; source_sha256: string | null; source_locator: string; labels: Record<Claim, Label> };
type Prediction = { case_id: string; claims: Partial<Record<Claim, Label>> };

const claims: Claim[] = ['origin', 'operation_attribution', 'automation', 'coordination', 'deception', 'exposure', 'recommendation', 'impact'];
const folder = dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(readFileSync(resolve(folder, 'benchmark_cases.json'), 'utf8')) as Case[];

function validateCases(): void {
  const ids = new Set<string>();
  for (const item of cases) {
    assert(!ids.has(item.case_id), `duplicate case: ${item.case_id}`);
    ids.add(item.case_id);
    assert(item.dataset_id && item.source && item.source_locator);
    if (item.source_sha256) assert(/^[a-f0-9]{64}$/.test(item.source_sha256), `invalid source hash: ${item.case_id}`);
    if (item.source.startsWith('https://')) new URL(item.source);
    else {
      const sourcePath = resolve(folder, item.source);
      assert(existsSync(sourcePath), `missing local source: ${item.source}`);
      const digest = createHash('sha256').update(readFileSync(sourcePath)).digest('hex');
      assert.equal(digest, item.source_sha256, `local source changed: ${item.case_id}`);
    }
    for (const claim of claims) assert(['supported', 'contradicted', 'unknown'].includes(item.labels[claim]));
  }
}

function score(predictions: Prediction[]) {
  const byId = new Map(predictions.map((item) => [item.case_id, item]));
  assert.equal(byId.size, predictions.length, 'duplicate prediction');
  let unsupportedAssertions = 0;
  let assertedClaims = 0;
  let supportedHits = 0;
  let supportedAvailable = 0;
  let contradictedAvailable = 0;
  let contradictedHits = 0;
  let falsePositiveAssertions = 0;
  let unknownAssertions = 0;
  const errors: string[] = [];
  for (const item of cases) {
    const prediction = byId.get(item.case_id);
    assert(prediction, `missing prediction: ${item.case_id}`);
    for (const claim of claims) {
      const actual = item.labels[claim];
      const predicted = prediction.claims[claim] ?? 'unknown';
      assert(['supported', 'contradicted', 'unknown'].includes(predicted));
      if (actual === 'supported') supportedAvailable++;
      if (actual === 'contradicted') contradictedAvailable++;
      if (predicted !== 'unknown') assertedClaims++;
      if (predicted === 'supported' && actual === 'supported') supportedHits++;
      if (predicted === 'contradicted' && actual === 'contradicted') contradictedHits++;
      if (predicted !== 'unknown' && predicted !== actual) {
        unsupportedAssertions++;
        if (predicted === 'supported' && actual === 'contradicted') falsePositiveAssertions++;
        if (actual === 'unknown') unknownAssertions++;
        errors.push(`${item.case_id}:${claim}`);
      }
    }
  }
  assert.equal(byId.size, cases.length, 'unknown prediction case');
  return { cases: cases.length, claimSlots: cases.length * claims.length, assertedClaims,
    unsupportedAssertions, unsupportedAssertionRate: assertedClaims ? unsupportedAssertions / assertedClaims : null,
    falsePositiveAssertions, contradictedAvailable,
    contradictedClaimAssertionRate: contradictedAvailable ? falsePositiveAssertions / contradictedAvailable : null,
    contradictedHits, contradictedCoverage: contradictedAvailable ? contradictedHits / contradictedAvailable : null,
    unknownAssertions,
    supportedHits, supportedAvailable, supportedCoverage: supportedAvailable ? supportedHits / supportedAvailable : null,
    errors };
}

validateCases();
const safe: Prediction[] = cases.map((item) => ({ case_id: item.case_id, claims: item.labels }));
const safeResult = score(safe);
assert.equal(safeResult.unsupportedAssertions, 0);
assert.equal(safeResult.falsePositiveAssertions, 0);
assert.equal(safeResult.supportedCoverage, 1);

const overclaim: Prediction[] = cases.map((item) => ({ case_id: item.case_id,
  claims: { ...item.labels, origin: 'supported', operation_attribution: 'supported', automation: 'supported', coordination: 'supported',
    deception: 'supported', exposure: 'supported', recommendation: 'supported', impact: 'supported' } }));
const overclaimResult = score(overclaim);
assert(overclaimResult.unsupportedAssertions > 0, 'overclaim fixture must fail the boundary');
assert(overclaimResult.falsePositiveAssertions > 0, 'overclaim fixture must falsely assert the contradicted case');
assert(overclaimResult.errors.includes('ira_potential_exposure:exposure'), 'potential exposure must not score as observed delivery');

const targeted: Prediction[] = cases.map((item) => ({ case_id: item.case_id, claims: { ...item.labels } }));
const targetedById = new Map(targeted.map((item) => [item.case_id, item]));
targetedById.get('displayed_origin_only')!.claims.origin = 'supported';
targetedById.get('facebook_media_coordination')!.claims.deception = 'supported';
targetedById.get('ira_potential_exposure')!.claims.exposure = 'supported';
targetedById.get('youtube_engagement_not_recommendation')!.claims.recommendation = 'supported';
targetedById.get('botometer_reviewed_false_positive_group')!.claims.automation = 'supported';
const targetedResult = score(targeted);
assert.equal(targetedResult.unsupportedAssertions, 5, 'five distinct claim-boundary errors expected');
assert.equal(targetedResult.unknownAssertions, 4, 'four proxy-to-fact promotions expected');
assert.equal(targetedResult.falsePositiveAssertions, 1, 'one contradicted group claim expected');
assert.deepEqual(targetedResult.errors, [
  'displayed_origin_only:origin',
  'facebook_media_coordination:deception',
  'ira_potential_exposure:exposure',
  'botometer_reviewed_false_positive_group:automation',
  'youtube_engagement_not_recommendation:recommendation',
]);

if (process.argv[2]) {
  const submitted = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8')) as Prediction[];
  console.log(JSON.stringify(score(submitted), null, 2));
} else {
  console.log(JSON.stringify({ evaluatorSelfCheck: 'passed', safe: safeResult, targeted: targetedResult, overclaim: overclaimResult }, null, 2));
}
