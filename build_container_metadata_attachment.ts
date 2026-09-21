import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const queueArg = process.argv.find((arg) => arg.startsWith('--queue='));
const recoveryArg = process.argv.find((arg) => arg.startsWith('--crossref-recovery='));
const outArg = process.argv.find((arg) => arg.startsWith('--out='));
if (!queueArg || !recoveryArg || !outArg || process.argv.length !== 5) {
  throw new Error('Usage: node --experimental-strip-types build_container_metadata_attachment.ts --queue=/path/queue.jsonl --crossref-recovery=/path/recovery --out=/path/attachment.jsonl');
}
const queuePath = resolve(queueArg.slice('--queue='.length));
const recoveryDir = resolve(recoveryArg.slice('--crossref-recovery='.length));
const outPath = resolve(outArg.slice('--out='.length));
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
type QueueRow = { record_key: string; doi: string | null; title: string; type: string | null };
const queueBytes = readFileSync(queuePath);
const missing = queueBytes.toString('utf8').trim().split('\n').map((line) => JSON.parse(line) as QueueRow)
  .filter((row) => !row.title);
type Crossref = { message?: { DOI?: string; type?: string; publisher?: string; 'container-title'?: string[];
  resource?: { primary?: { URL?: string } }; URL?: string } };
const byDoi = new Map<string, { message: NonNullable<Crossref['message']>; response_file: string; response_sha256: string }>();
for (const file of readdirSync(resolve(recoveryDir, 'responses')).sort()) {
  const raw = readFileSync(resolve(recoveryDir, 'responses', file), 'utf8');
  const parsed = JSON.parse(raw) as Crossref;
  const doi = parsed.message?.DOI?.toLowerCase();
  if (!doi || !parsed.message) throw new Error(`Crossref response lacks DOI: ${file}`);
  if (byDoi.has(doi)) throw new Error(`Duplicate Crossref DOI: ${doi}`);
  byDoi.set(doi, { message: parsed.message, response_file: `responses/${file}`, response_sha256: sha256(raw) });
}
const rows = missing.map((row) => {
  const source = row.doi ? byDoi.get(row.doi.toLowerCase()) : undefined;
  if (!source) throw new Error(`Missing Crossref response for ${row.record_key}`);
  const message = source.message;
  return { record_key: row.record_key, doi: row.doi, frozen_openalex_type: row.type,
    crossref_type: message.type ?? null, container_title: message['container-title']?.[0] ?? null,
    publisher: message.publisher ?? null, primary_resource_url: message.resource?.primary?.URL ?? null,
    crossref_landing_url: message.URL ?? null, interpretation: 'container_record_requires_constituent_work_review',
    source_response_file: source.response_file, source_response_sha256: source.response_sha256 };
});
if (rows.some((row) => !['journal-issue', 'journal-volume'].includes(row.crossref_type ?? ''))) {
  throw new Error('Unexpected non-container Crossref type');
}
const output = rows.map((row) => JSON.stringify(row)).join('\n') + '\n';
writeFileSync(outPath, output);
const manifest = { status: 'reviewer_metadata_attachment', frozen_queue_sha256: sha256(queueBytes),
  frozen_queue_modified: false, records: rows.length,
  journal_issues: rows.filter((row) => row.crossref_type === 'journal-issue').length,
  journal_volumes: rows.filter((row) => row.crossref_type === 'journal-volume').length,
  attachment_sha256: sha256(output) };
writeFileSync(`${outPath}.manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
