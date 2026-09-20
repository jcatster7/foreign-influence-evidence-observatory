import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const flags = new Map<string, string>();
const positionals: string[] = [];
for (const argument of process.argv.slice(2)) {
  const match = /^--(queue|summary|decisions)=(.+)$/.exec(argument);
  if (match) flags.set(match[1], match[2]);
  else if (argument.startsWith('--')) throw new Error(`Unknown option: ${argument}`);
  else positionals.push(argument);
}
if (positionals.length > 1 || (positionals.length && flags.has('decisions'))) throw new Error('Specify one decision file');
const queuePath = resolve(flags.get('queue') ?? resolve(folder, 'searches/openalex_partial_screening_queue.jsonl'));
const summaryPath = resolve(flags.get('summary') ?? resolve(folder, 'searches/openalex_partial_screening_queue_summary.json'));
const decisionPath = resolve(flags.get('decisions') ?? positionals[0] ?? resolve(folder, 'searches/screening_decisions.jsonl'));
type Queue = { record_key: string; calibration_sample: boolean; screening_status: 'unscreened' };
type Decision = { record_key: string; reviewer_id: string; stage: 'title_abstract' | 'full_text' | 'title_adjudication' | 'full_text_adjudication';
  decision: 'retrieve_full_text' | 'exclude' | 'include_dataset' | 'background_method';
  reason: string; decided_at_utc: string; source_locator: string };
const parseLines = <T>(path: string): T[] => readFileSync(path, 'utf8').split('\n').filter(Boolean).map((line, index) => {
  try { return JSON.parse(line) as T; } catch { throw new Error(`${path}:${index + 1}: invalid JSON`); }
});
const queue = parseLines<Queue>(queuePath);
const byKey = new Map(queue.map((item) => [item.record_key, item]));
assert.equal(byKey.size, queue.length, 'duplicate queue record');
const decisions = existsSync(decisionPath) ? parseLines<Decision>(decisionPath) : [];
const seen = new Set<string>();
const titleDecisions = new Map<string, Decision[]>();
const fullTextDecisions = new Map<string, Decision[]>();
const titleAdjudications = new Map<string, Decision>();
const fullTextAdjudications = new Map<string, Decision>();
for (const item of decisions) {
  assert(byKey.has(item.record_key), `decision outside queue: ${item.record_key}`);
  assert(item.reviewer_id.trim() && item.reason.trim() && item.source_locator.trim(), `incomplete decision: ${item.record_key}`);
  assert(!Number.isNaN(Date.parse(item.decided_at_utc)) && item.decided_at_utc.endsWith('Z'), `invalid UTC date: ${item.record_key}`);
  const key = `${item.record_key}\u0000${item.reviewer_id}\u0000${item.stage}`;
  assert(!seen.has(key), `duplicate reviewer-stage decision: ${item.record_key}`);
  seen.add(key);
  if (item.stage === 'title_abstract') {
    assert(['retrieve_full_text', 'exclude', 'background_method'].includes(item.decision), `invalid title decision: ${item.record_key}`);
    titleDecisions.set(item.record_key, [...(titleDecisions.get(item.record_key) ?? []), item]);
  } else if (item.stage === 'full_text') {
    assert(['include_dataset', 'exclude', 'background_method'].includes(item.decision), `invalid full-text decision: ${item.record_key}`);
    fullTextDecisions.set(item.record_key, [...(fullTextDecisions.get(item.record_key) ?? []), item]);
  } else if (item.stage === 'title_adjudication') {
    assert(['retrieve_full_text', 'exclude', 'background_method'].includes(item.decision), `invalid title adjudication: ${item.record_key}`);
    assert(!titleAdjudications.has(item.record_key), `duplicate title adjudication: ${item.record_key}`);
    titleAdjudications.set(item.record_key, item);
  } else {
    assert(item.stage === 'full_text_adjudication', `invalid stage: ${item.record_key}`);
    assert(['include_dataset', 'exclude', 'background_method'].includes(item.decision), `invalid full-text adjudication: ${item.record_key}`);
    assert(!fullTextAdjudications.has(item.record_key), `duplicate full-text adjudication: ${item.record_key}`);
    fullTextAdjudications.set(item.record_key, item);
  }
}
let calibrationMissingSecond = 0;
let titleUnscreened = 0;
let titleDisagreementsUnadjudicated = 0;
let fullTextMissingSecond = 0;
let fullTextDisagreementsUnadjudicated = 0;
for (const record of queue) {
  const title = titleDecisions.get(record.record_key) ?? [];
  if (!title.length) titleUnscreened++;
  if (record.calibration_sample && new Set(title.map((x) => x.reviewer_id)).size < 2) calibrationMissingSecond++;
  const titleDisagrees = new Set(title.map((x) => x.decision)).size > 1;
  if (titleDisagrees && !titleAdjudications.has(record.record_key)) titleDisagreementsUnadjudicated++;
  const finalTitle = titleAdjudications.get(record.record_key)?.decision ?? (titleDisagrees ? null : title[0]?.decision);
  const full = fullTextDecisions.get(record.record_key) ?? [];
  if (finalTitle === 'retrieve_full_text' && new Set(full.map((x) => x.reviewer_id)).size < 2) fullTextMissingSecond++;
  if (new Set(full.map((x) => x.decision)).size > 1 && !fullTextAdjudications.has(record.record_key)) fullTextDisagreementsUnadjudicated++;
}
const harvest = JSON.parse(readFileSync(summaryPath, 'utf8')) as
  { status?: string; queue_sha256?: string; queries: { complete?: boolean }[] };
assert.equal(harvest.queries?.length, 5, 'expected five OpenAlex query families');
const registeredQueue = harvest.status === 'registered_openalex_queue_unscreened';
if (registeredQueue) {
  const digest = createHash('sha256').update(readFileSync(queuePath)).digest('hex');
  assert.equal(digest, harvest.queue_sha256, 'registered queue bytes differ from frozen summary');
} else assert.equal(harvest.status, 'partial_pre_registration_queue_no_screening_decisions', 'unknown queue status');
const indexedChainComplete = registeredQueue || harvest.queries.every((x) => x.complete);
const report = { queue_records: queue.length, decisions: decisions.length, title_unscreened: titleUnscreened,
  calibration_missing_second_reviewer: calibrationMissingSecond,
  title_disagreements_unadjudicated: titleDisagreementsUnadjudicated,
  full_text_missing_second_reviewer: fullTextMissingSecond,
  full_text_disagreements_unadjudicated: fullTextDisagreementsUnadjudicated,
  queue_kind: registeredQueue ? 'registered_openalex' : 'pre_registration_scoping_openalex',
  indexed_cursor_chain_complete: indexedChainComplete,
  indexed_screening_gate_passed: false,
  ready_for_final_study_count: false,
  final_count_blocker: 'OpenAlex screening alone cannot verify supplemental sources, publication-to-dataset merges, dual-coded constructs, risk of bias, or the final PRISMA flow.' };
report.indexed_screening_gate_passed = report.indexed_cursor_chain_complete && !report.title_unscreened &&
  !report.calibration_missing_second_reviewer && !report.title_disagreements_unadjudicated &&
  !report.full_text_missing_second_reviewer && !report.full_text_disagreements_unadjudicated;
console.log(JSON.stringify(report, null, 2));
