import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const options = new Map<string, string>();
for (const argument of process.argv.slice(2)) {
  const match = /^--(queue|reviewer-a|reviewer-b|out-dir)=(.+)$/.exec(argument);
  if (!match || options.has(match[1])) throw new Error(`Unexpected or duplicate option: ${argument}`);
  options.set(match[1], match[2]);
}
if (options.size !== 4) throw new Error('Usage: node --experimental-strip-types compare_screening_decisions.ts --queue=QUEUE.jsonl --reviewer-a=A.jsonl --reviewer-b=B.jsonl --out-dir=DIR');
const queuePath = resolve(options.get('queue')!);
const aPath = resolve(options.get('reviewer-a')!);
const bPath = resolve(options.get('reviewer-b')!);
const outDir = resolve(options.get('out-dir')!);
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const readLines = <T>(path: string): { bytes: string; rows: T[] } => {
  const bytes = readFileSync(path, 'utf8');
  return { bytes, rows: bytes.split('\n').filter(Boolean).map((line, index) => {
    try { return JSON.parse(line) as T; } catch { throw new Error(`${path}:${index + 1}: invalid JSON`); }
  }) };
};
type Queue = { record_key: string; calibration_sample: boolean };
type DecisionName = 'retrieve_full_text' | 'exclude' | 'background_method';
type Decision = { record_key: string; reviewer_id: string; stage: string; decision: DecisionName;
  reason: string; decided_at_utc: string; source_locator: string };
const queue = readLines<Queue>(queuePath);
const reviewerA = readLines<Decision>(aPath);
const reviewerB = readLines<Decision>(bPath);
const queueKeys = new Set(queue.rows.map((row) => row.record_key));
if (queueKeys.size !== queue.rows.length) throw new Error('Duplicate queue record key');
const calibration = queue.rows.filter((row) => row.calibration_sample);
if (!calibration.length) throw new Error('Queue has no calibration records');
const calibrationKeys = new Set(calibration.map((row) => row.record_key));
const labels: DecisionName[] = ['retrieve_full_text', 'exclude', 'background_method'];
const validate = (rows: Decision[], expectedReviewer: 'A' | 'B', allowNonCalibration: boolean) => {
  const byKey = new Map<string, Decision>();
  for (const row of rows) {
    if (!queueKeys.has(row.record_key)) throw new Error(`${expectedReviewer} decision outside queue: ${row.record_key}`);
    if (!allowNonCalibration && !calibrationKeys.has(row.record_key)) throw new Error(`${expectedReviewer} decision outside calibration sample: ${row.record_key}`);
    if (row.reviewer_id !== expectedReviewer || row.stage !== 'title_abstract' || !labels.includes(row.decision) ||
        !row.reason?.trim() || !row.source_locator?.trim() || Number.isNaN(Date.parse(row.decided_at_utc)) || !row.decided_at_utc.endsWith('Z')) {
      throw new Error(`Invalid ${expectedReviewer} decision: ${row.record_key}`);
    }
    if (byKey.has(row.record_key)) throw new Error(`Duplicate ${expectedReviewer} decision: ${row.record_key}`);
    byKey.set(row.record_key, row);
  }
  for (const key of calibrationKeys) if (!byKey.has(key)) throw new Error(`${expectedReviewer} missing calibration decision: ${key}`);
  return byKey;
};
const byA = validate(reviewerA.rows, 'A', true);
const byB = validate(reviewerB.rows, 'B', false);
const matrix = Object.fromEntries(labels.map((a) => [a, Object.fromEntries(labels.map((b) => [b, 0]))])) as Record<DecisionName, Record<DecisionName, number>>;
const disagreements: object[] = [];
for (const row of calibration) {
  const a = byA.get(row.record_key)!;
  const b = byB.get(row.record_key)!;
  matrix[a.decision][b.decision]++;
  if (a.decision !== b.decision) disagreements.push({ record_key: row.record_key,
    reviewer_a_decision: a.decision, reviewer_a_reason: a.reason, reviewer_a_source_locator: a.source_locator,
    reviewer_a_decided_at_utc: a.decided_at_utc, reviewer_b_decision: b.decision,
    reviewer_b_reason: b.reason, reviewer_b_source_locator: b.source_locator,
    reviewer_b_decided_at_utc: b.decided_at_utc, adjudication_status: 'pending' });
}
const n = calibration.length;
const agreements = labels.reduce((sum, label) => sum + matrix[label][label], 0);
const marginalsA = Object.fromEntries(labels.map((label) => [label, labels.reduce((sum, b) => sum + matrix[label][b], 0)])) as Record<DecisionName, number>;
const marginalsB = Object.fromEntries(labels.map((label) => [label, labels.reduce((sum, a) => sum + matrix[a][label], 0)])) as Record<DecisionName, number>;
const observed = agreements / n;
const expected = labels.reduce((sum, label) => sum + (marginalsA[label] / n) * (marginalsB[label] / n), 0);
const kappa = expected === 1 ? null : (observed - expected) / (1 - expected);
const disagreementText = disagreements.map((row) => JSON.stringify(row)).join('\n') + (disagreements.length ? '\n' : '');
const report = { status: disagreements.length ? 'adjudication_required' : 'calibration_agreement_complete',
  queue_sha256: sha256(queue.bytes), reviewer_a_sha256: sha256(reviewerA.bytes), reviewer_b_sha256: sha256(reviewerB.bytes),
  calibration_records: n, agreements, disagreements: disagreements.length,
  observed_agreement: observed, expected_agreement_from_marginals: expected, cohens_kappa: kappa,
  kappa_unavailable_reason: kappa === null ? 'Both reviewers used one category exclusively, so expected agreement equals one.' : null,
  labels, confusion_matrix_rows_a_columns_b: matrix, reviewer_a_marginals: marginalsA, reviewer_b_marginals: marginalsB,
  disagreement_file: 'calibration_disagreements.jsonl', disagreement_sha256: sha256(disagreementText),
  interpretation_boundary: 'Agreement statistics describe this frozen calibration sample and do not measure study quality, detector performance, or population prevalence.' };
const files = new Map([
  ['calibration_agreement.json', JSON.stringify(report, null, 2) + '\n'],
  ['calibration_disagreements.jsonl', disagreementText],
]);
mkdirSync(outDir, { recursive: true });
for (const [name, body] of files) {
  const path = resolve(outDir, name);
  if (existsSync(path) && readFileSync(path, 'utf8') !== body) throw new Error(`Refusing to overwrite differing output: ${path}`);
}
for (const [name, body] of files) if (!existsSync(resolve(outDir, name))) writeFileSync(resolve(outDir, name), body);
console.log(JSON.stringify(report, null, 2));
