import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLAIMS = ['origin', 'operation_attribution', 'automation', 'coordination', 'deception', 'exposure', 'recommendation', 'impact'] as const;
const LABELS = ['supported', 'contradicted', 'unknown'] as const;
const folder = dirname(fileURLToPath(import.meta.url));

type Label = typeof LABELS[number];
type BenchmarkCase = {
  case_id: string;
  dataset_id: string;
  source: string;
  source_sha256: string | null;
  source_locator: string;
  source_hash_scope: string;
  retrieved_at_utc: string | null;
  unit: string;
  claim_subject: string;
  platform: string;
  collection_period: string;
  labels: Record<typeof CLAIMS[number], Label>;
  label_provenance: { basis: string; review_status: string; independent_adjudication: string };
  split_group: { dataset_id: string; time_block: string };
};

type Card = {
  status: string;
  case_file: string;
  case_file_sha256: string;
  counts: Record<string, number>;
  scope: { platforms: string[]; labels: string[] };
  provenance: { review: string; sources: string; rights: string };
  evaluation: Record<string, unknown>;
  prohibited_uses: string[];
  release_gates: Record<string, boolean>;
};

type RightsReview = {
  reviewed_at_utc: string;
  sources: Array<{
    source: string;
    case_ids: string[];
    source_kind: string;
    rights_evidence: string;
    license_id: string | null;
    full_text_in_repository: boolean;
    redistribution_decision: string;
    limitations: string;
  }>;
  review_result: {
    distinct_sources_reviewed: number;
    cases_covered: number;
    external_full_text_files_redistributed: number;
    approved_for_current_repository_use: boolean;
  };
};

function argument(name: string, fallback: string): string {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

const casesPath = resolve(argument('cases', resolve(folder, 'benchmark_cases.json')));
const cardPath = resolve(argument('card', resolve(folder, 'BENCHMARK_CARD_PROVISIONAL.json')));
const rightsPath = resolve(argument('rights', resolve(folder, 'BENCHMARK_SOURCE_RIGHTS.json')));
const adjudicationDir = resolve(argument('adjudication-dir', resolve(folder, 'benchmark_adjudication')));
const outputPath = resolve(argument('output', resolve(folder, 'BENCHMARK_AUDIT_PROVISIONAL.json')));
const caseBytes = readFileSync(casesPath);
const cases = JSON.parse(caseBytes.toString('utf8')) as BenchmarkCase[];
const card = JSON.parse(readFileSync(cardPath, 'utf8')) as Card;
const rights = JSON.parse(readFileSync(rightsPath, 'utf8')) as RightsReview;
const registrationStatus = JSON.parse(readFileSync(resolve(folder, 'registration', 'REGISTRATION_STATUS.json'), 'utf8')) as Record<string, any>;

const ids = new Set<string>();
const labelCounts: Record<Label, number> = { supported: 0, contradicted: 0, unknown: 0 };
const groups = new Set<string>();
const platforms = new Set<string>();
let sourceHashPresent = 0;
let sourceHashMissing = 0;

for (const item of cases) {
  assert(!ids.has(item.case_id), `duplicate case: ${item.case_id}`);
  ids.add(item.case_id);
  for (const field of ['dataset_id', 'source', 'source_locator', 'source_hash_scope', 'unit', 'claim_subject', 'platform', 'collection_period'] as const) {
    assert(item[field], `missing ${field}: ${item.case_id}`);
  }
  assert.equal(item.split_group?.dataset_id, item.dataset_id, `split dataset mismatch: ${item.case_id}`);
  assert.equal(item.split_group?.time_block, item.collection_period, `split period mismatch: ${item.case_id}`);
  assert.equal(item.label_provenance?.review_status, 'single_reviewer_provisional', `review status mismatch: ${item.case_id}`);
  assert.equal(item.label_provenance?.independent_adjudication, 'pending', `adjudication status mismatch: ${item.case_id}`);
  assert(item.label_provenance?.basis, `missing label basis: ${item.case_id}`);
  assert.deepEqual(Object.keys(item.labels).sort(), [...CLAIMS].sort(), `claim schema mismatch: ${item.case_id}`);
  for (const claim of CLAIMS) {
    assert(LABELS.includes(item.labels[claim]), `invalid label: ${item.case_id}:${claim}`);
    labelCounts[item.labels[claim]]++;
  }
  if (item.source_sha256 === null) sourceHashMissing++;
  else {
    assert(/^[a-f0-9]{64}$/.test(item.source_sha256), `invalid source hash: ${item.case_id}`);
    sourceHashPresent++;
  }
  if (item.source.startsWith('https://')) {
    new URL(item.source);
    assert(item.retrieved_at_utc, `external source lacks retrieval time: ${item.case_id}`);
  } else {
    const localPath = resolve(dirname(casesPath), item.source);
    assert(existsSync(localPath), `missing local source: ${item.source}`);
    const localDigest = createHash('sha256').update(readFileSync(localPath)).digest('hex');
    assert.equal(localDigest, item.source_sha256, `local source changed: ${item.case_id}`);
  }
  groups.add(`${item.dataset_id}\u0000${item.collection_period}`);
  platforms.add(item.platform);
}

const caseFileSha256 = createHash('sha256').update(caseBytes).digest('hex');
const computedCounts = {
  cases: cases.length,
  claim_slots: cases.length * CLAIMS.length,
  supported: labelCounts.supported,
  contradicted: labelCounts.contradicted,
  unknown: labelCounts.unknown,
  dataset_time_split_groups: groups.size,
  source_hash_present: sourceHashPresent,
  source_hash_missing: sourceHashMissing,
};

assert.equal(card.case_file, 'benchmark_cases.json', 'unexpected case file name in card');
assert.equal(card.case_file_sha256, caseFileSha256, 'card case-file hash is stale');
assert.deepEqual(card.counts, computedCounts, 'card counts do not match cases');
assert.deepEqual([...card.scope.platforms].sort(), [...platforms].sort(), 'card platforms do not match cases');
assert.deepEqual([...card.scope.labels].sort(), [...LABELS].sort(), 'card labels do not match schema');
assert.equal(card.status, 'software_self_check_only', 'provisional card status changed');
assert.equal(card.evaluation.unseen_detector_evaluation, false, 'unseen evaluation must remain false until performed');
assert.equal(card.evaluation.held_out_test_set, false, 'held-out test-set claim is unsupported');
assert.equal(card.evaluation.population_false_positive_rate_available, false, 'population FPR claim is unsupported');
assert.equal(card.evaluation.verified_account_level_negative_denominator, false, 'verified negative denominator claim is unsupported');
assert(card.prohibited_uses.some((item) => item.includes('population false-positive rate')), 'missing population-FPR prohibition');
assert(card.prohibited_uses.some((item) => item.includes('unknown cases into verified negatives')), 'missing unknown-is-not-negative prohibition');
assert.equal(card.release_gates.source_hashes_complete, sourceHashMissing === 0, 'source-hash gate mismatch');
assert.equal(card.release_gates.bias_card_present, true, 'bias-card gate must be true for this card');

assert(!Number.isNaN(Date.parse(rights.reviewed_at_utc)), 'invalid rights-review timestamp');
const casesBySource = new Map<string, string[]>();
for (const item of cases) casesBySource.set(item.source, [...(casesBySource.get(item.source) ?? []), item.case_id]);
const rightsSources = new Set<string>();
const rightsCaseIds = new Set<string>();
let externalFullTextFiles = 0;
for (const item of rights.sources) {
  assert(!rightsSources.has(item.source), `duplicate rights-review source: ${item.source}`);
  rightsSources.add(item.source);
  assert(casesBySource.has(item.source), `rights review includes unknown source: ${item.source}`);
  assert.deepEqual([...item.case_ids].sort(), [...casesBySource.get(item.source)!].sort(), `rights case mapping mismatch: ${item.source}`);
  assert(item.source_kind && item.rights_evidence && item.limitations, `incomplete rights review: ${item.source}`);
  assert.equal(item.redistribution_decision, 'approved_for_current_repository_use', `source not approved for current use: ${item.source}`);
  if (item.source.startsWith('https://')) {
    assert.equal(item.full_text_in_repository, false, `external full text must not be redistributed: ${item.source}`);
    if (item.full_text_in_repository) externalFullTextFiles++;
  } else assert.equal(item.full_text_in_repository, true, `local report missing from repository: ${item.source}`);
  for (const caseId of item.case_ids) {
    assert(!rightsCaseIds.has(caseId), `case appears twice in rights review: ${caseId}`);
    rightsCaseIds.add(caseId);
  }
}
const rightsComplete = rightsSources.size === casesBySource.size && rightsCaseIds.size === cases.length &&
  rights.review_result.approved_for_current_repository_use;
assert.equal(rights.review_result.distinct_sources_reviewed, rightsSources.size, 'rights source count mismatch');
assert.equal(rights.review_result.cases_covered, rightsCaseIds.size, 'rights case count mismatch');
assert.equal(rights.review_result.external_full_text_files_redistributed, externalFullTextFiles, 'external full-text count mismatch');
assert.equal(card.release_gates.source_rights_reviewed, rightsComplete, 'source-rights gate mismatch');

const packetPath = resolve(adjudicationDir, 'independent_reviewer_packet.jsonl');
const packetManifestPath = resolve(adjudicationDir, 'PACKET_MANIFEST.json');
const workbookManifestPath = resolve(adjudicationDir, 'WORKBOOK_MANIFEST.json');
const packetBytes = readFileSync(packetPath);
const packetRows = packetBytes.toString('utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line) as Record<string, unknown>);
const packetManifest = JSON.parse(readFileSync(packetManifestPath, 'utf8')) as Record<string, unknown>;
const workbookManifest = JSON.parse(readFileSync(workbookManifestPath, 'utf8')) as Record<string, unknown>;
assert.equal(packetManifest.status, 'blind_independent_adjudication_packet');
assert.equal(packetManifest.case_file_sha256, caseFileSha256, 'adjudication packet uses a different case file');
assert.equal(packetManifest.packet_sha256, createHash('sha256').update(packetBytes).digest('hex'), 'adjudication packet hash mismatch');
assert.equal(packetManifest.labels_withheld, true, 'provisional labels leaked into adjudication manifest');
assert.equal(packetRows.length, cases.length * CLAIMS.length, 'adjudication packet row count mismatch');
const expectedAdjudicationKeys = new Set(cases.flatMap((item) => CLAIMS.map((claim) => `${item.case_id}:${claim}`)));
for (const row of packetRows) {
  assert.equal(typeof row.row_key, 'string', 'adjudication row lacks row key');
  assert(expectedAdjudicationKeys.delete(row.row_key as string), `duplicate or unexpected adjudication row: ${row.row_key}`);
  assert(!('labels' in row) && !('provisional_label' in row), `provisional label leaked into adjudication row: ${row.row_key}`);
}
assert.equal(expectedAdjudicationKeys.size, 0, 'adjudication packet is missing rows');
assert.equal(workbookManifest.packet_sha256, packetManifest.packet_sha256, 'workbook uses a different adjudication packet');
assert.equal(workbookManifest.labels_withheld, true, 'workbook manifest does not confirm blinded labels');
assert.equal(workbookManifest.decisions_present, 0, 'blank workbook manifest unexpectedly reports decisions');
const workbookPath = resolve(folder, String(workbookManifest.workbook_file));
assert(existsSync(workbookPath), 'independent adjudication workbook is missing');
assert.equal(workbookManifest.workbook_sha256, createHash('sha256').update(readFileSync(workbookPath)).digest('hex'), 'adjudication workbook hash mismatch');
assert.equal(card.release_gates.independent_adjudication_completed, false, 'independent adjudication cannot pass before validated decisions exist');

const heldoutRegistration = registrationStatus.benchmark_heldout_amendment;
assert(heldoutRegistration, 'held-out registration record is missing');
assert.equal(heldoutRegistration.tag, 'v0.4.0-heldout-amendment');
assert.equal(heldoutRegistration.immutable, true, 'held-out amendment is not recorded as immutable');
assert.equal(heldoutRegistration.heldout_candidates_selected_before_release, 0, 'held-out candidates existed before registration');
assert.equal(heldoutRegistration.heldout_reference_labels_created_before_release, 0, 'held-out labels existed before registration');
assert.equal(heldoutRegistration.heldout_predictions_scored_before_release, 0, 'held-out predictions existed before registration');
const heldoutPacketPath = resolve(folder, 'registration', String(heldoutRegistration.asset_name));
assert(existsSync(heldoutPacketPath), 'held-out amendment packet is missing');
assert.equal(createHash('sha256').update(readFileSync(heldoutPacketPath)).digest('hex'), heldoutRegistration.asset_sha256,
  'held-out amendment packet hash mismatch');
const heldoutManifest = JSON.parse(readFileSync(resolve(folder, 'registration', 'HELDOUT_AMENDMENT_MANIFEST_v0.4.0.json'), 'utf8')) as Record<string, any>;
assert.deepEqual(heldoutManifest.prospective_state, {
  heldout_candidates_selected: 0,
  heldout_reference_labels_created: 0,
  heldout_predictions_scored: 0,
}, 'held-out amendment was not prospective');
assert.equal(heldoutRegistration.heldout_split_established, false, 'registration status incorrectly claims a real split');
assert.equal(card.release_gates.held_out_campaign_period_split_established, false, 'protocol registration alone cannot establish a real split');
assert.equal(card.release_gates.unseen_predictions_scored, false, 'no held-out predictions have been scored');

const finalGateInputs = [
  'source_hashes_complete',
  'source_rights_reviewed',
  'independent_adjudication_completed',
  'held_out_campaign_period_split_established',
  'unseen_predictions_scored',
  'bias_card_present',
];
const expectedReady = finalGateInputs.every((gate) => card.release_gates[gate] === true);
assert.equal(card.release_gates.ready_for_final_benchmark, expectedReady, 'final benchmark gate is inconsistent');

const blockers = finalGateInputs.filter((gate) => card.release_gates[gate] !== true);
const audit = {
  audit_version: '1.1.0',
  status: 'passed',
  benchmark_status: card.status,
  case_file: card.case_file,
  case_file_sha256: caseFileSha256,
  computed_counts: computedCounts,
  verified_invariants: [
    'case identifiers are unique',
    'claim and label schemas are exact',
    'dataset/time split fields agree with case metadata',
    'local source hashes match current file bytes',
    'external sources have retrieval times and syntactically valid hashes',
    'card counts, platforms, source-hash gate, and case-file hash match the case file',
    'every distinct source has a conservative repository-use rights decision and no external article bytes are redistributed',
    'the independent adjudication packet covers all 80 claim slots without exposing provisional labels',
    'the immutable held-out amendment predates every candidate, reference label, and prediction while leaving real split and scoring gates false',
    'unknown labels remain distinct from verified negatives',
    'final readiness equals the conjunction of all required release gates',
  ],
  release_gates: card.release_gates,
  open_blockers: blockers,
};

writeFileSync(outputPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify(audit, null, 2));
