import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const sha256 = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex');
const json = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;
const argument = (name: string, fallback: string): string => {
  const prefix = `--${name}=`;
  return resolve(process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length) ?? fallback);
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { value += '"'; index++; }
      else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(value); value = ''; }
    else if (char === '\n') { row.push(value); rows.push(row); row = []; value = ''; }
    else if (char !== '\r') value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}

const registeredDir = argument('registered-dir', resolve(folder, 'searches', 'registered_openalex_2026-09-20_v0.3.1-preregistration-amendment'));
const queuePath = resolve(registeredDir, 'screening_queue.jsonl');
const queueSummaryPath = resolve(registeredDir, 'screening_queue_summary.json');
const canonicalDecisionPath = resolve(registeredDir, 'screening_decisions.jsonl');
const queueSummary = json<Record<string, any>>(queueSummaryPath);
const run = json<Record<string, any>>(resolve(registeredDir, 'RUN.json'));
assert.equal(run.status, 'complete', 'registered OpenAlex run is incomplete');
assert.equal(run.queries.length, 5, 'registered search must contain five query families');
assert.equal(queueSummary.status, 'registered_openalex_queue_unscreened');
assert.equal(sha256(queuePath), queueSummary.queue_sha256, 'screening queue hash mismatch');
const queueLines = readFileSync(queuePath, 'utf8').trim().split('\n');
assert.equal(queueLines.length, queueSummary.unique_screening_records, 'screening queue count mismatch');
assert(queueLines.every((line) => JSON.parse(line).screening_status === 'unscreened'), 'frozen queue status was modified');

const checkpoints = readdirSync(registeredDir).filter((name) => name.endsWith('.checkpoint.json')).sort();
assert.equal(checkpoints.length, 96, 'registered run must contain 96 checkpoints');
let retrieved = 0;
for (const checkpointName of checkpoints) {
  const checkpoint = json<Record<string, any>>(resolve(registeredDir, checkpointName));
  const responsePath = resolve(registeredDir, checkpointName.replace('.checkpoint.json', '.response.json'));
  assert(existsSync(responsePath), `missing raw response for ${checkpointName}`);
  assert.equal(sha256(responsePath), checkpoint.response_sha256, `raw response hash mismatch: ${checkpointName}`);
  retrieved += checkpoint.returned;
}
assert.equal(retrieved, queueSummary.retrieved, 'registered retrieval count mismatch');

const screening = JSON.parse(execFileSync(process.execPath, [
  '--experimental-strip-types', resolve(folder, 'audit_screening.ts'),
  `--queue=${queuePath}`, `--summary=${queueSummaryPath}`, `--decisions=${canonicalDecisionPath}`,
], { encoding: 'utf8' }));
assert.equal(screening.queue_records, 8587);
assert.equal(screening.decisions, 0, 'screening decisions exist but observatory status was not advanced');
assert.equal(screening.title_unscreened, 8587);
assert.equal(screening.ready_for_final_study_count, false);

const registrationManifest = json<Record<string, any>>(resolve(folder, 'registration', 'REGISTRATION_PACKET_MANIFEST.json'));
const registeredFileHashes = new Map(registrationManifest.files.map((item: Record<string, any>) => [item.path, item.sha256]));
for (const path of ['PREREGISTRATION_DRAFT.md', 'SEARCH_PROTOCOL.md', 'EXTRACTION_CODEBOOK.md', 'LOW_COST_REPLICATION_PROTOCOL.md']) {
  assert.equal(sha256(resolve(folder, path)), registeredFileHashes.get(path), `registered protocol file changed: ${path}`);
}
assert.equal(sha256(resolve(folder, 'EVIDENCE_MAP_SEED.csv')), registeredFileHashes.get('EVIDENCE_MAP_SEED.csv'), 'seed map changed after registration');
assert.equal(sha256(resolve(folder, 'EDGE_MAP_SEED.csv')), registeredFileHashes.get('EDGE_MAP_SEED.csv'), 'seed edge map changed after registration');
const evidenceSeedRecords = readFileSync(resolve(folder, 'EVIDENCE_MAP_SEED.csv'), 'utf8').trim().split('\n').length - 1;
const edgeSeedRecords = readFileSync(resolve(folder, 'EDGE_MAP_SEED.csv'), 'utf8').trim().split('\n').length - 1;
assert.equal(evidenceSeedRecords, 18);
assert.equal(edgeSeedRecords, 13);
const registrationStatus = json<Record<string, any>>(resolve(folder, 'registration', 'REGISTRATION_STATUS.json'));
assert.equal(registrationStatus.route, 'public immutable GitHub release');
const releases = [registrationStatus, registrationStatus.amendment, registrationStatus.processing_amendment,
  registrationStatus.benchmark_heldout_amendment, registrationStatus.replication_sampling_amendment];
for (const release of releases) {
  assert.equal(release.immutable, true, `release is not immutable: ${release.tag}`);
  const assetPath = resolve(folder, 'registration', release.asset_name);
  assert(existsSync(assetPath), `registration asset missing: ${release.asset_name}`);
  assert.equal(sha256(assetPath), release.asset_sha256, `registration asset hash mismatch: ${release.asset_name}`);
}

const benchmark = JSON.parse(execFileSync(process.execPath, [
  '--experimental-strip-types', resolve(folder, 'audit_benchmark.ts'),
], { encoding: 'utf8' }));
assert.equal(benchmark.status, 'passed');
assert.equal(benchmark.release_gates.ready_for_final_benchmark, false);

const replicationPath = argument('replication', resolve(folder, 'replication', 'REPLICATION_STATUS.json'));
const replication = json<Record<string, any>>(replicationPath);
const acquisitionCheckpointPath = resolve(folder, String(replication.acquisition_checkpoint_file));
const acquisitionCheckpoint = json<Record<string, any>>(acquisitionCheckpointPath);
assert.equal(sha256(resolve(folder, String(replication.protocol_file))), replication.protocol_sha256, 'replication protocol hash mismatch');
assert.equal(replication.included_in_immutable_registration, true);
assert.equal(replication.sampling_amendment_registered, true);
assert.equal(replication.target_inventories_created, 0);
assert.equal(sha256(acquisitionCheckpointPath), replication.acquisition_checkpoint_sha256,
  'replication acquisition checkpoint hash mismatch');
assert.equal(acquisitionCheckpoint.accounts_examined, replication.partial_accounts_examined);
assert.equal(acquisitionCheckpoint.in_window_posts_seen_total, replication.partial_in_window_posts_seen);
assert.equal(acquisitionCheckpoint.complete_target_inventories, 0);
assert.equal(acquisitionCheckpoint.origin_or_about_fields_collected, false);
assert.equal(acquisitionCheckpoint.target_about_panels_inspected, 0);
assert.equal(acquisitionCheckpoint.sample_frozen, false);
assert.equal(acquisitionCheckpoint.observations_collected, 0);
assert.equal(replication.partial_checkpoint_is_sample, false);
assert.equal(replication.target_frame_about_panels_inspected, 0);
assert.equal(replication.authorized_x_session_available, replication.latest_preflight_passed,
  'authorized-session and preflight states disagree');
assert.equal(replication.sample_frozen, false);
assert.equal(replication.new_observations, 0);
assert.equal(replication.replication_claim_ready, false);

const budgetPath = argument('budget', resolve(folder, 'BUDGET_LEDGER.csv'));
const budgetRows = parseCsv(readFileSync(budgetPath, 'utf8'));
assert.deepEqual(budgetRows[0], ['date_utc', 'vendor', 'purpose', 'amount_usd', 'cumulative_usd', 'evidence']);
let spend = 0;
let previousCumulative = 0;
for (const [index, row] of budgetRows.slice(1).entries()) {
  assert.equal(row.length, 6, `budget row ${index + 2} has wrong column count`);
  const amount = Number(row[3]);
  const cumulative = Number(row[4]);
  assert(Number.isFinite(amount) && amount >= 0, `invalid amount on budget row ${index + 2}`);
  spend += amount;
  assert(Math.abs(cumulative - spend) < 1e-9, `cumulative budget mismatch on row ${index + 2}`);
  assert(cumulative >= previousCumulative, `budget cumulative total decreased on row ${index + 2}`);
  previousCumulative = cumulative;
}
assert(spend <= 20, 'external spending cap exceeded');
assert.equal(spend, replication.external_spend_usd, 'replication and ledger spend disagree');

const requirements = {
  open_reproducible_repository: {
    status: 'achieved',
    evidence: 'public GitHub repository with immutable registration releases and hash-audited artifacts',
    immutable_releases_verified: releases.length,
  },
  preregistered_cross_platform_evidence_map: {
    status: 'incomplete',
    acquisition_complete: true,
    queue_records: 8587,
    title_abstract_decisions: screening.decisions,
    title_abstract_unscreened: screening.title_unscreened,
    calibration_records: queueSummary.calibration_count,
    provisional_seed_records: evidenceSeedRecords,
    provisional_edge_records: edgeSeedRecords,
    final_map_ready: false,
  },
  benchmark_unknown_and_false_positive_tests: {
    status: 'incomplete',
    software_audit_passed: benchmark.status === 'passed',
    release_gates: benchmark.release_gates,
    open_blockers: benchmark.open_blockers,
  },
  low_cost_replication: {
    status: 'incomplete',
    protocol_registered: replication.included_in_immutable_registration,
    access_preflight_passed: replication.latest_preflight_passed,
    partial_accounts_examined: replication.partial_accounts_examined,
    partial_in_window_posts_seen: replication.partial_in_window_posts_seen,
    partial_checkpoint_is_sample: replication.partial_checkpoint_is_sample,
    new_observations: replication.new_observations,
    replication_claim_ready: replication.replication_claim_ready,
  },
  external_spend_cap: { status: 'achieved', spend_usd: spend, cap_usd: 20, remaining_usd: 20 - spend },
};
const overallComplete = Object.values(requirements).every((item) => item.status === 'achieved');
const report = {
  audit_version: '1.0.0',
  status: 'passed',
  overall_goal_complete: overallComplete,
  requirements,
  authoritative_blockers: [
    '8,587 registered title/abstract records need Reviewer A decisions; 1,719 calibration records also need independent Reviewer B decisions.',
    'Admitted full texts and all eight construct labels need two independent coders before the evidence map is final.',
    'The benchmark needs completed independent adjudication, a real qualifying held-out pool, and predictions frozen before label reveal.',
    'The replication preflight passes and 14 target summaries are checkpointed; six target checks, complete inventory export, a frozen sample, archived observations, and independent coding remain.',
  ],
};
const outputPath = argument('output', resolve(folder, 'OBSERVATORY_STATUS.json'));
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
