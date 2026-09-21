import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const claims = ['origin', 'operation_attribution', 'automation', 'coordination', 'deception', 'exposure', 'recommendation', 'impact'] as const;
const labels = ['supported', 'contradicted', 'unknown'] as const;
type Label = typeof labels[number];
type Decision = { row_key: string; case_id: string; claim: typeof claims[number]; reviewer_id: string; label: Label; rationale: string; source_checked: boolean; decided_at_utc: string };

function argument(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

const decisionArg = argument('decisions');
assert(decisionArg, 'usage: node --experimental-strip-types compare_benchmark_adjudication.ts --decisions=<validated.jsonl> [--out=<report.json>] [--disagreements=<queue.jsonl>]');
const decisionPath = resolve(decisionArg);
const casePath = resolve(folder, 'benchmark_cases.json');
const reportPath = resolve(argument('out') ?? resolve(folder, 'benchmark_adjudication', 'ADJUDICATION_REPORT.json'));
const disagreementPath = resolve(argument('disagreements') ?? resolve(folder, 'benchmark_adjudication', 'disagreements.jsonl'));
assert(existsSync(`${decisionPath}.manifest.json`), 'validated decision manifest is missing');

const cases = JSON.parse(readFileSync(casePath, 'utf8')) as Array<{ case_id: string; labels: Record<typeof claims[number], Label> }>;
const decisions = readFileSync(decisionPath, 'utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line) as Decision);
const decisionManifest = JSON.parse(readFileSync(`${decisionPath}.manifest.json`, 'utf8')) as Record<string, unknown>;
assert.equal(decisionManifest.status, 'validated_complete_independent_benchmark_adjudication');
assert.equal(decisionManifest.decision_sha256, createHash('sha256').update(readFileSync(decisionPath)).digest('hex'), 'decision hash mismatch');

const byKey = new Map(decisions.map((item) => [item.row_key, item]));
assert.equal(byKey.size, decisions.length, 'duplicate adjudication row key');
assert.equal(decisions.length, cases.length * claims.length, 'incomplete adjudication decisions');
const matrix: Record<Label, Record<Label, number>> = {
  supported: { supported: 0, contradicted: 0, unknown: 0 },
  contradicted: { supported: 0, contradicted: 0, unknown: 0 },
  unknown: { supported: 0, contradicted: 0, unknown: 0 },
};
const claimAgreement = Object.fromEntries(claims.map((claim) => [claim, { agree: 0, total: 0 }])) as Record<typeof claims[number], { agree: number; total: number }>;
const disagreements: Array<Record<string, unknown>> = [];
let agree = 0;

for (const item of cases) {
  for (const claim of claims) {
    const key = `${item.case_id}:${claim}`;
    const decision = byKey.get(key);
    assert(decision, `missing decision: ${key}`);
    assert.equal(decision.case_id, item.case_id);
    assert.equal(decision.claim, claim);
    assert(labels.includes(decision.label));
    const provisional = item.labels[claim];
    matrix[provisional][decision.label]++;
    claimAgreement[claim].total++;
    if (provisional === decision.label) {
      agree++;
      claimAgreement[claim].agree++;
    } else disagreements.push({
      row_key: key,
      case_id: item.case_id,
      claim,
      provisional_label: provisional,
      independent_label: decision.label,
      independent_rationale: decision.rationale,
      adjudication_status: 'pending_consensus',
      consensus_label: null,
      consensus_rationale: null,
    });
  }
}

const total = cases.length * claims.length;
const report = {
  status: disagreements.length === 0 ? 'independent_labels_complete_no_disagreements' : 'independent_labels_complete_consensus_pending',
  decisions_file: decisionPath.split('/').pop(),
  decisions_sha256: createHash('sha256').update(readFileSync(decisionPath)).digest('hex'),
  total_claim_slots: total,
  exact_agreement: agree,
  exact_agreement_rate: agree / total,
  disagreements: disagreements.length,
  confusion_matrix_rows_provisional_columns_independent: matrix,
  agreement_by_claim: Object.fromEntries(claims.map((claim) => [claim, {
    agree: claimAgreement[claim].agree,
    total: claimAgreement[claim].total,
    rate: claimAgreement[claim].agree / claimAgreement[claim].total,
  }])),
  independent_adjudication_completed: disagreements.length === 0,
  consensus_required: disagreements.length > 0,
};
const disagreementText = disagreements.map((row) => JSON.stringify(row)).join('\n') + (disagreements.length ? '\n' : '');
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(disagreementPath, disagreementText);
console.log(JSON.stringify(report, null, 2));
