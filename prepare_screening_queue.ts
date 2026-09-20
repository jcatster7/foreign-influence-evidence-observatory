import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const sourceDir = resolve(folder, 'searches/openalex_full_2026-09-19');
const files = readdirSync(sourceDir).filter((file) => /^q\d+_p\d+\.json$/.test(file));
type Item = { openalex_id: string; title: string; doi: string | null; year: number | null;
  publication_date: string | null; type: string | null; landing_page_url: string | null };
type Page = { query: string; query_index: number; page: number; cursor_in: string;
  cursor_out: string | null; reported_total_results: number; returned: number; items: Item[] };
const pages = files.map((file) => JSON.parse(readFileSync(resolve(sourceDir, file), 'utf8')) as Page);
const status: { query_index: number; retrieved: number; reported_total: number; complete: boolean }[] = [];
const records = new Map<string, Item & { query_hits: number[] }>();
for (let qi = 1; qi <= 5; qi++) {
  const group = pages.filter((page) => page.query_index === qi).sort((a, b) => a.page - b.page);
  if (!group.length || group[0].page !== 1 || group[0].cursor_in !== '*') throw new Error(`q${qi}: missing start`);
  for (let i = 0; i < group.length; i++) {
    const page = group[i];
    if (page.page !== i + 1 || page.returned !== page.items.length) throw new Error(`q${qi}: bad page ${page.page}`);
    if (i && group[i - 1].cursor_out !== page.cursor_in) throw new Error(`q${qi}: broken cursor chain`);
    for (const item of page.items) {
      const existing = records.get(item.openalex_id);
      if (existing) { if (!existing.query_hits.includes(qi)) existing.query_hits.push(qi); }
      else records.set(item.openalex_id, { ...item, query_hits: [qi] });
    }
  }
  const last = group.at(-1)!;
  status.push({ query_index: qi, retrieved: group.reduce((n, page) => n + page.returned, 0),
    reported_total: last.reported_total_results, complete: !last.cursor_out });
}
const phrases = [
  /foreign (influence|interference|information operation)/i,
  /coordinated inauthentic/i,
  /social bot|bot detection|automated account/i,
  /algorithmic amplif|recommendation|ranked feed|timeline exposure/i,
  /internet research agency|state[- ]sponsored|state[- ]backed/i,
];
const platform = /twitter|x\/twitter|facebook|instagram|tiktok|reddit|youtube|social media|social network/i;
const unmerged = [...records.values()].map((item) => {
  const title = item.title ?? '';
  const priority_score = phrases.reduce((n, re) => n + (re.test(title) ? 2 : 0), 0) +
    (platform.test(title) ? 1 : 0) + Math.min(2, item.query_hits.length - 1);
  const doi = item.doi?.replace(/^https:\/\/doi\.org\//i, '').toLowerCase() ?? null;
  return { record_key: doi ? `doi:${doi}` : `openalex:${item.openalex_id}`,
    openalex_id: item.openalex_id, openalex_ids: [item.openalex_id], doi,
    title, year: item.year, publication_date: item.publication_date, type: item.type,
    landing_page_url: item.landing_page_url, query_hits: item.query_hits.sort((a, b) => a - b),
    primary_query: Math.min(...item.query_hits), priority_score,
    calibration_sample: false, screening_status: 'unscreened' as const };
});
const grouped = new Map<string, typeof unmerged[number]>();
for (const item of unmerged.sort((a, b) => a.openalex_id.localeCompare(b.openalex_id))) {
  const existing = grouped.get(item.record_key);
  if (!existing) { grouped.set(item.record_key, item); continue; }
  existing.openalex_ids.push(item.openalex_id);
  existing.query_hits = [...new Set([...existing.query_hits, ...item.query_hits])].sort((a, b) => a - b);
  existing.primary_query = Math.min(...existing.query_hits);
  existing.priority_score = Math.max(existing.priority_score, item.priority_score);
}
const queue = [...grouped.values()];
const hashOrder = (id: string) => createHash('sha256').update(`observatory-calibration-v1:${id}`).digest('hex');
for (let qi = 1; qi <= 5; qi++) {
  const stratum = queue.filter((item) => item.primary_query === qi).sort((a, b) => hashOrder(a.record_key).localeCompare(hashOrder(b.record_key)));
  for (const item of stratum.slice(0, Math.ceil(stratum.length * 0.2))) item.calibration_sample = true;
}
queue.sort((a, b) => Number(b.calibration_sample) - Number(a.calibration_sample) ||
  b.priority_score - a.priority_score || a.record_key.localeCompare(b.record_key));
writeFileSync(resolve(folder, 'searches/openalex_partial_screening_queue.jsonl'), queue.map((item) => JSON.stringify(item)).join('\n') + '\n');
const summary = { status: 'partial_pre_registration_queue_no_screening_decisions', retrieved: status.reduce((n, x) => n + x.retrieved, 0),
  unique_openalex_ids: records.size, duplicate_doi_records_collapsed: records.size - queue.length,
  unique_screening_records: queue.length, calibration_count: queue.filter((item) => item.calibration_sample).length,
  priority_score_ge_3: queue.filter((item) => item.priority_score >= 3).length, queries: status };
writeFileSync(resolve(folder, 'searches/openalex_partial_screening_queue_summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
