import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const dir = resolve(folder, 'searches/openalex_full_2026-09-19');
type Item = { openalex_id: string; title: string; doi: string | null; year: number | null; publication_date: string | null; type: string | null; landing_page_url: string | null };
type Page = { query: string; query_index: number; page: number; cursor_in: string; cursor_out: string | null; url: string; fetched_at_utc: string; response_sha256: string; reported_total_results: number; returned: number; items: Item[] };
const files = readdirSync(dir).filter((x) => /^q\d+_p\d+\.json$/.test(x));
const pages = files.map((file) => JSON.parse(readFileSync(resolve(dir, file), 'utf8')) as Page);
const all = new Map<string, { item: Item; query_hits: string[] }>();
const runs = [];
for (let q = 1; q <= 5; q++) {
  const group = pages.filter((p) => p.query_index === q).sort((a, b) => a.page - b.page);
  if (!group.length || group[0].page !== 1 || group[0].cursor_in !== '*') throw new Error(`q${q}: missing first page`);
  for (let i = 0; i < group.length; i++) {
    const p = group[i];
    if (p.page !== i + 1 || p.items.length !== p.returned || !p.response_sha256) throw new Error(`q${q}: malformed page ${p.page}`);
    if (i && group[i - 1].cursor_out !== p.cursor_in) throw new Error(`q${q}: broken cursor chain page ${p.page}`);
    for (const item of p.items) {
      if (!item.openalex_id) throw new Error(`q${q}: missing id`);
      const row = all.get(item.openalex_id);
      const hit = `q${q}:p${p.page}`;
      if (row) row.query_hits.push(hit);
      else all.set(item.openalex_id, { item, query_hits: [hit] });
    }
  }
  const last = group.at(-1)!;
  if (last.cursor_out) throw new Error(`q${q}: harvest incomplete`);
  const retrieved = group.reduce((n, p) => n + p.returned, 0);
  runs.push({ query_index: q, query: group[0].query, pages: group.length,
    reported_total_results_first_page: group[0].reported_total_results,
    reported_total_results_last_page: last.reported_total_results,
    retrieved, complete_cursor_chain: true });
}
function csv(v: unknown): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
const rows = ['openalex_id,doi,title,year,publication_date,type,landing_page_url,query_hits,screen_decision,screen_reason'];
for (const { item, query_hits } of all.values()) rows.push([
  item.openalex_id, item.doi?.replace(/^https:\/\/doi\.org\//, '').toLowerCase() ?? '',
  item.title, item.year, item.publication_date, item.type, item.landing_page_url,
  query_hits.join(' | '), '', '',
].map(csv).join(','));
writeFileSync(resolve(folder, 'searches/openalex_full_2026-09-19_unique.csv'), rows.join('\n') + '\n');
const doiCount = new Set([...all.values()].map((x) => x.item.doi?.toLowerCase()).filter(Boolean)).size;
const summary = { status: 'pre_registration_scoping_harvest_not_final_screen',
  retrieved_total: runs.reduce((n, run) => n + run.retrieved, 0), unique_openalex_ids: all.size,
  unique_dois: doiCount, runs };
writeFileSync(resolve(folder, 'searches/openalex_full_2026-09-19_summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
