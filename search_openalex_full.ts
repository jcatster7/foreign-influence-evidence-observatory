import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Pre-registration scoping harvest. A registered review must rerun these exact queries.
const queries = [
  '"foreign influence" AND "social media" AND (Twitter OR Facebook OR TikTok OR Reddit OR YouTube)',
  '"coordinated inauthentic behavior" AND (Twitter OR Facebook OR Instagram OR TikTok)',
  '"information operations" AND "social media" AND (exposure OR recommendation)',
  '"bot detection" AND (political OR election) AND validation',
  '"algorithmic amplification" AND (political OR election) AND (Twitter OR Facebook OR TikTok OR YouTube)',
];
const folder = dirname(fileURLToPath(import.meta.url));
const outdir = resolve(folder, 'searches', 'openalex_full_2026-09-19');
mkdirSync(outdir, { recursive: true });
type Item = { id: string; display_name: string; doi: string | null; publication_year: number | null; publication_date: string | null; type: string | null; primary_location?: { landing_page_url?: string | null }; abstract_inverted_index?: Record<string, number[]> | null };
type Reply = { meta: { count: number; next_cursor: string | null; cost_usd?: number }; results: Item[] };
const sleep = (ms: number) => new Promise((ok) => setTimeout(ok, ms));
for (let qi = 0; qi < queries.length; qi++) {
  let cursor = '*';
  let page = 1;
  let total = 0;
  while (cursor) {
    const path = resolve(outdir, `q${qi + 1}_p${String(page).padStart(3, '0')}.json`);
    if (existsSync(path)) {
      const prior = JSON.parse(readFileSync(path, 'utf8')) as { query: string; cursor_in: string; cursor_out: string | null; returned: number; response_sha256: string };
      if (prior.query !== queries[qi] || prior.cursor_in !== cursor || !prior.response_sha256) throw new Error(`checkpoint mismatch: ${path}`);
      total += prior.returned;
      cursor = prior.cursor_out ?? '';
      page++;
      continue;
    }
    const url = new URL('https://api.openalex.org/works');
    url.searchParams.set('search', queries[qi]);
    url.searchParams.set('filter', 'to_publication_date:2026-09-19');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('cursor', cursor);
    url.searchParams.set('select', 'id,display_name,doi,publication_year,publication_date,type,primary_location,abstract_inverted_index');
    let response: Response | undefined;
    for (let attempt = 0; attempt < 4; attempt++) {
      response = await fetch(url);
      if (response.ok) break;
      if (![429, 500, 502, 503, 504].includes(response.status)) throw new Error(`${response.status} ${url}`);
      await sleep(1000 * 2 ** attempt);
    }
    if (!response?.ok) throw new Error(`API failure ${response?.status} ${url}`);
    const bytes = await response.text();
    const data = JSON.parse(bytes) as Reply;
    if (!Array.isArray(data.results) || typeof data.meta.count !== 'number') throw new Error(`malformed response ${url}`);
    const record = { query: queries[qi], query_index: qi + 1, page, cursor_in: cursor,
      cursor_out: data.meta.next_cursor, url: url.toString(), fetched_at_utc: new Date().toISOString(),
      response_sha256: createHash('sha256').update(bytes).digest('hex'), reported_total_results: data.meta.count,
      api_estimated_cost_usd: data.meta.cost_usd ?? null, returned: data.results.length,
      items: data.results.map((w) => ({ openalex_id: w.id, title: w.display_name, doi: w.doi,
        year: w.publication_year, publication_date: w.publication_date, type: w.type,
        landing_page_url: w.primary_location?.landing_page_url ?? null,
        abstract_inverted_index: w.abstract_inverted_index ?? null })) };
    writeFileSync(path, JSON.stringify(record) + '\n');
    total += data.results.length;
    cursor = data.meta.next_cursor ?? '';
    console.log(`q${qi + 1} page ${page}: ${data.results.length}, cumulative ${total}/${data.meta.count}`);
    page++;
    if (page > 200) throw new Error(`safety page cap q${qi + 1}`);
    await sleep(120);
  }
}
console.log('Full scoping harvest complete.');
