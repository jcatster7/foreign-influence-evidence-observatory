import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const queries = [
  'foreign influence social media',
  'coordinated inauthentic behavior social media',
  'social bot detection political influence',
  'algorithmic amplification political social media',
  'foreign information operations recommendation feed',
];
const rows = 30;
const folder = dirname(fileURLToPath(import.meta.url));
const output = resolve(folder, 'searches', 'crossref_initial_2026-09-19.json');

type CrossrefItem = { DOI?: string; title?: string[]; type?: string; URL?: string;
  published?: { 'date-parts'?: number[][] }; abstract?: string };
type CrossrefResponse = { message: { 'total-results': number; items: CrossrefItem[] } };

const runs = [];
for (const query of queries) {
  const url = new URL('https://api.crossref.org/works');
  url.searchParams.set('query.title', query);
  url.searchParams.set('rows', String(rows));
  url.searchParams.set('select', 'DOI,title,type,URL,published');
  const response = await fetch(url, { headers: { 'User-Agent': 'ForeignInfluenceEvidenceObservatory/0.1 (research metadata search)' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const bytes = await response.text();
  const data = JSON.parse(bytes) as CrossrefResponse;
  runs.push({ query, url: url.toString(), fetched_at_utc: new Date().toISOString(),
    response_sha256: createHash('sha256').update(bytes).digest('hex'),
    reported_total_results: data.message['total-results'], returned: data.message.items.length,
    items: data.message.items.map((item, rank) => ({ rank: rank + 1, doi: item.DOI ?? null,
      title: item.title?.[0] ?? '', type: item.type ?? null, url: item.URL ?? null,
      year: item.published?.['date-parts']?.[0]?.[0] ?? null })) });
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify({ method: 'Crossref title search, top 30 per query; discovery only, not a complete systematic search', runs }, null, 2) + '\n');
const unique = new Set(runs.flatMap((run) => run.items.map((item) => item.doi?.toLowerCase() ?? item.title.toLowerCase())));
console.log(JSON.stringify({ output, queries: runs.length, retrieved: runs.reduce((n, run) => n + run.returned, 0), unique: unique.size }, null, 2));
