import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const queueArg = process.argv.find((arg) => arg.startsWith('--queue='));
const outArg = process.argv.find((arg) => arg.startsWith('--out-dir='));
if (!queueArg || !outArg || process.argv.length !== 4) {
  throw new Error('Usage: node --experimental-strip-types recover_missing_titles_crossref.ts --queue=/path/screening_queue.jsonl --out-dir=/path/crossref_recovery');
}
const queuePath = resolve(queueArg.slice('--queue='.length));
const outDir = resolve(outArg.slice('--out-dir='.length));
const rawDir = resolve(outDir, 'responses');
mkdirSync(rawDir, { recursive: true });
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const queueBytes = readFileSync(queuePath);
type QueueRow = { record_key: string; doi: string | null; title: string };
const missing = queueBytes.toString('utf8').trim().split('\n').map((line) => JSON.parse(line) as QueueRow)
  .filter((row) => !row.title);
if (missing.some((row) => !row.doi)) throw new Error('Every missing-title record must have a DOI');

const rows: { record_key: string; doi: string | null; recovered_title: string | null;
  recovery_status: 'recovered' | 'still_missing'; source_url: string; retrieved_at_utc: string;
  http_status: number; response_file: string; response_sha256: string }[] = [];
for (let index = 0; index < missing.length; index++) {
  const row = missing[index];
  const url = `https://api.crossref.org/works/${encodeURIComponent(row.doi!)}`;
  let response: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(url, { headers: { 'user-agent': 'ForeignInfluenceEvidenceObservatory/0.3.2 (https://github.com/jcatster7/foreign-influence-evidence-observatory)' },
      signal: AbortSignal.timeout(30000) });
    if (response.ok || response.status === 404) break;
    await new Promise((done) => setTimeout(done, 500 * 2 ** attempt));
  }
  const raw = await response!.text();
  const responseFile = `${String(index + 1).padStart(3, '0')}.json`;
  writeFileSync(resolve(rawDir, responseFile), raw);
  let title: string | null = null;
  try {
    const parsed = JSON.parse(raw) as { message?: { title?: unknown } };
    const candidate = Array.isArray(parsed.message?.title) ? parsed.message.title[0] : null;
    title = typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
  } catch { /* Preserve malformed response for audit. */ }
  rows.push({ record_key: row.record_key, doi: row.doi, recovered_title: title,
    recovery_status: title ? 'recovered' : 'still_missing', source_url: url,
    retrieved_at_utc: new Date().toISOString(), http_status: response!.status,
    response_file: `responses/${responseFile}`, response_sha256: sha256(raw) });
  await new Promise((done) => setTimeout(done, 60));
}
const recoveryText = rows.map((row) => JSON.stringify(row)).join('\n') + '\n';
writeFileSync(resolve(outDir, 'title_recovery_crossref.jsonl'), recoveryText);
const manifest = { status: 'supplemental_crossref_metadata_recovery', frozen_queue_sha256: sha256(queueBytes),
  frozen_queue_modified: false, attempted: missing.length,
  recovered_titles: rows.filter((row) => row.recovery_status === 'recovered').length,
  still_missing: rows.filter((row) => row.recovery_status === 'still_missing').length,
  recovery_sha256: sha256(recoveryText) };
writeFileSync(resolve(outDir, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
