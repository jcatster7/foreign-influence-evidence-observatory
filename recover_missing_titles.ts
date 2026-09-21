import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const queueArg = process.argv.find((arg) => arg.startsWith('--queue='));
const outArg = process.argv.find((arg) => arg.startsWith('--out-dir='));
if (!queueArg || !outArg || process.argv.length !== 4) {
  throw new Error('Usage: node --experimental-strip-types recover_missing_titles.ts --queue=/path/screening_queue.jsonl --out-dir=/path/title_recovery');
}
const queuePath = resolve(queueArg.slice('--queue='.length));
const outDir = resolve(outArg.slice('--out-dir='.length));
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const queueBytes = readFileSync(queuePath);
type QueueRow = { record_key: string; doi: string | null; title: string; openalex_ids: string[] };
const queue = queueBytes.toString('utf8').trim().split('\n').map((line) => JSON.parse(line) as QueueRow);
const missing = queue.filter((row) => !row.title);
if (!missing.length) throw new Error('Queue has no missing titles');
if (missing.some((row) => !row.doi)) throw new Error('Every missing-title record must have a DOI for this recovery method');
mkdirSync(outDir, { recursive: true });

type Work = { id: string; doi: string | null; display_name: string | null };
type Reply = { results: Work[]; meta?: { count?: number; cost_usd?: number } };
const recovered = new Map<string, { title: string; source_id: string; source_doi: string }>();
const requests: object[] = [];
for (let offset = 0; offset < missing.length; offset += 100) {
  const batch = missing.slice(offset, offset + 100);
  const url = new URL('https://api.openalex.org/works');
  url.searchParams.set('filter', `doi:${batch.map((row) => `https://doi.org/${row.doi}`).join('|')}`);
  url.searchParams.set('per_page', '100');
  url.searchParams.set('select', 'id,doi,display_name');
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`OpenAlex metadata recovery failed: HTTP ${response.status}`);
  const raw = await response.text();
  const reply = JSON.parse(raw) as Reply;
  if (!Array.isArray(reply.results) || reply.results.length > 100) throw new Error('Malformed OpenAlex recovery response');
  const file = `batch_${String(offset / 100 + 1).padStart(2, '0')}.response.json`;
  writeFileSync(resolve(outDir, file), raw);
  for (const work of reply.results) {
    const doi = work.doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').toLowerCase();
    if (!doi || !work.id?.startsWith('https://openalex.org/W') || work.display_name === null || typeof work.display_name !== 'string') continue;
    recovered.set(doi, { title: work.display_name, source_id: work.id, source_doi: doi });
  }
  requests.push({ batch: offset / 100 + 1, requested_dois: batch.length, returned_works: reply.results.length,
    retrieved_at_utc: new Date().toISOString(), url: url.toString(), response_file: file,
    response_sha256: sha256(raw), api_estimated_cost_usd: reply.meta?.cost_usd ?? null });
}

const rows = missing.map((row) => {
  const match = recovered.get(row.doi!.toLowerCase());
  return { record_key: row.record_key, doi: row.doi, frozen_openalex_ids: row.openalex_ids,
    recovered_title: match?.title ?? null, recovery_status: match ? 'recovered' : 'still_missing',
    recovery_source: match ? 'OpenAlex DOI batch lookup' : 'OpenAlex DOI batch lookup returned no titled match',
    recovery_source_id: match?.source_id ?? null };
});
const rowText = rows.map((row) => JSON.stringify(row)).join('\n') + '\n';
writeFileSync(resolve(outDir, 'title_recovery.jsonl'), rowText);
const manifest = { status: 'supplemental_metadata_recovery', frozen_queue_file: basename(queuePath),
  frozen_queue_sha256: sha256(queueBytes), frozen_queue_modified: false, missing_title_records: missing.length,
  recovered_titles: rows.filter((row) => row.recovery_status === 'recovered').length,
  still_missing: rows.filter((row) => row.recovery_status === 'still_missing').length,
  recovery_file: 'title_recovery.jsonl', recovery_sha256: sha256(rowText), requests };
writeFileSync(resolve(outDir, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
