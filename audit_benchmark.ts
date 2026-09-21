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

function argument(name: string, fallback: string): string {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

const casesPath = resolve(argument('cases', resolve(folder, 'benchmark_cases.json')));
const cardPath = resolve(argument('card', resolve(folder, 'BENCHMARK_CARD_PROVISIONAL.json')));
const outputPath = resolve(argument('output', resolve(folder, 'BENCHMARK_AUDIT_PROVISIONAL.json')));
const caseBytes = readFileSync(casesPath);
const cases = JSON.parse(caseBytes.toString('utf8')) as BenchmarkCase[];
const card = JSON.parse(readFileSync(cardPath, 'utf8')) as Card;

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
  audit_version: '1.0.0',
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
    'unknown labels remain distinct from verified negatives',
    'final readiness equals the conjunction of all required release gates',
  ],
  release_gates: card.release_gates,
  open_blockers: blockers,
};

writeFileSync(outputPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify(audit, null, 2));
