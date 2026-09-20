import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const options = new Map<string, string>();
let practice = false;
for (const arg of process.argv.slice(2)) {
  if (arg === '--practice') { practice = true; continue; }
  const match = /^--(queue|summary|out-dir)=(.+)$/.exec(arg);
  if (!match || options.has(match[1])) throw new Error(`Unexpected or duplicate option: ${arg}`);
  options.set(match[1], match[2]);
}
if (options.size !== 3) throw new Error('Usage: node --experimental-strip-types make_reviewer_packets.ts --queue=QUEUE.jsonl --summary=SUMMARY.json --out-dir=DIR [--practice]');
const queuePath = resolve(options.get('queue')!);
const summaryPath = resolve(options.get('summary')!);
const outDir = resolve(options.get('out-dir')!);
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const queueBytes = readFileSync(queuePath, 'utf8');
const summary = JSON.parse(readFileSync(summaryPath, 'utf8')) as {
  status: string; queue_sha256?: string; unique_screening_records: number; calibration_count: number;
};
const expectedStatus = practice ? 'partial_pre_registration_queue_no_screening_decisions' : 'registered_openalex_queue_unscreened';
if (summary.status !== expectedStatus || (!practice && summary.queue_sha256 !== sha256(queueBytes))) {
  throw new Error('Queue is not a verified queue for the requested mode');
}
type Candidate = { record_key: string; title: string; abstract?: string | null; doi?: string | null;
  year?: number | null; landing_page_url?: string | null; primary_query: number;
  calibration_sample: boolean; screening_status: string };
const records = queueBytes.split('\n').filter(Boolean).map((line, index) => {
  try { return JSON.parse(line) as Candidate; } catch { throw new Error(`Invalid queue JSON at line ${index + 1}`); }
});
const keys = new Set<string>();
const stratum = new Map<number, { total: number; calibration: number }>();
for (const item of records) {
  if (!item.record_key || keys.has(item.record_key) || typeof item.title !== 'string' || item.screening_status !== 'unscreened' ||
      !Number.isInteger(item.primary_query) || item.primary_query < 1 || item.primary_query > 5 ||
      typeof item.calibration_sample !== 'boolean') throw new Error(`Invalid or duplicate record: ${item.record_key}`);
  keys.add(item.record_key);
  const counts = stratum.get(item.primary_query) ?? { total: 0, calibration: 0 };
  counts.total++;
  if (item.calibration_sample) counts.calibration++;
  stratum.set(item.primary_query, counts);
}
if (records.length !== summary.unique_screening_records ||
    records.filter((item) => item.calibration_sample).length !== summary.calibration_count ||
    [...stratum.values()].some((counts) => counts.calibration !== Math.ceil(counts.total * 0.2))) {
  throw new Error('Queue count or 20% stratified calibration sample mismatch');
}
const ordered = [...records].sort((a, b) =>
  sha256(`review-order-v1:${a.record_key}`).localeCompare(sha256(`review-order-v1:${b.record_key}`)));
const packetRecord = (item: Candidate) => ({ record_key: item.record_key, title: item.title || null,
  abstract: item.abstract ?? null, doi: item.doi ?? null, year: item.year ?? null,
  landing_page_url: item.landing_page_url ?? null, metadata_problem: item.title ? null : 'title_missing' });
const serialize = (items: Candidate[]) => items.map((item) => JSON.stringify(packetRecord(item))).join('\n') + '\n';
const reviewerA = serialize(ordered);
const reviewerB = serialize(ordered.filter((item) => item.calibration_sample));
const manifest = { mode: practice ? 'practice_only' : 'registered_title_abstract', queue_sha256: sha256(queueBytes),
  queue_records: records.length, reviewer_a_records: records.length,
  reviewer_b_calibration_records: ordered.filter((item) => item.calibration_sample).length,
  records_missing_title: records.filter((item) => !item.title).length,
  reviewer_a_sha256: sha256(reviewerA), reviewer_b_sha256: sha256(reviewerB),
  assignment: 'A screens every record; B independently screens the frozen stratified 20% sample. Disputes and uncertain records need additional dual review.',
  decisions_schema: { record_key: 'string', reviewer_id: 'string', stage: 'title_abstract',
    decision: 'retrieve_full_text | exclude | background_method', reason: 'string',
    decided_at_utc: 'ISO 8601 UTC', source_locator: 'title or abstract locator' } };
mkdirSync(outDir, { recursive: true });
const files = [
  ['reviewer_A.jsonl', reviewerA], ['reviewer_B_calibration.jsonl', reviewerB],
  ['PACKET_MANIFEST.json', JSON.stringify(manifest, null, 2) + '\n'],
] as const;
for (const [name, body] of files) {
  const path = resolve(outDir, name);
  if (existsSync(path) && readFileSync(path, 'utf8') !== body) throw new Error(`Existing packet differs: ${path}`);
}
for (const [name, body] of files) {
  const path = resolve(outDir, name);
  if (!existsSync(path)) writeFileSync(path, body);
}
console.log(JSON.stringify(manifest, null, 2));
