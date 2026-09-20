import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const queries = [
  '"coordinated inauthentic behavior" AND (Twitter OR Facebook OR TikTok OR Reddit)',
  '"information operations" AND "social media"',
  '"bot detection" AND political',
  '"algorithmic amplification" AND political',
  '"foreign influence" AND "social media"',
];
const perPage = 50;
const folder = dirname(fileURLToPath(import.meta.url));
const output = resolve(folder, 'searches', 'openalex_initial_2026-09-19.json');
type Work = { id: string; display_name: string; doi: string | null; publication_year: number | null;
  type: string | null; primary_location?: { landing_page_url?: string | null } };
type Response = { meta: { count: number; cost_usd?: number }; results: Work[] };

const runs = [];
for (const query of queries) {
  const url = new URL('https://api.openalex.org/works');
  url.searchParams.set('search', query);
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('select', 'id,display_name,doi,publication_year,type,primary_location');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const bytes = await response.text();
  const data = JSON.parse(bytes) as Response;
  runs.push({ query, url: url.toString(), fetched_at_utc: new Date().toISOString(),
    response_sha256: createHash('sha256').update(bytes).digest('hex'),
    reported_total_results: data.meta.count, api_estimated_cost_usd: data.meta.cost_usd ?? null,
    returned: data.results.length,
    items: data.results.map((work, rank) => ({ rank: rank + 1, openalex_id: work.id,
      doi: work.doi, title: work.display_name, year: work.publication_year,
      type: work.type, landing_page_url: work.primary_location?.landing_page_url ?? null })) });
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify({ method: 'OpenAlex exact-phrase Boolean search, top 50 per query; discovery pass, not a complete systematic search', runs }, null, 2) + '\n');
const unique = new Set(runs.flatMap((run) => run.items.map((item) => item.openalex_id)));
console.log(JSON.stringify({ output, queries: runs.length,
  retrieved: runs.reduce((n, run) => n + run.returned, 0), unique: unique.size,
  api_estimated_cost_usd: runs.reduce((n, run) => n + (run.api_estimated_cost_usd ?? 0), 0) }, null, 2));
