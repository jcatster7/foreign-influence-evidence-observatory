import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const input = JSON.parse(readFileSync(resolve(folder, 'searches/openalex_initial_2026-09-19.json'), 'utf8')) as {
  runs: { query: string; items: { rank: number; openalex_id: string; doi: string | null;
    title: string; year: number | null; landing_page_url: string | null }[] }[]
};
const retrieve = new Set([
  '10.1080/1369118x.2020.1739732', '10.1016/j.dss.2022.113819',
  '10.1145/3400806.3400817', '10.3389/fsoc.2023.1141416',
  '10.1609/icwsm.v20i1.42711', '10.1038/s41598-025-00233-w',
  '10.1109/access.2024.3393482', '10.1609/icwsm.v17i1.22139',
  '10.1609/icwsm.v18i1.31409', '10.48550/arxiv.2305.07350',
  '10.1371/journal.pone.0241045', '10.1145/3543873.3587672',
  '10.1177/20563051231196866', '10.1038/s44260-025-00056-w',
  '10.1609/icwsm.v15i1.18074', '10.1145/3476086',
  '10.1145/3447548.3467391', '10.1177/08944393211019951',
  '10.1093/pnasnexus/pgad094', '10.1145/3543507.3583214',
  '10.1017/s0003055421001507', '10.1038/s42005-020-0340-4',
  '10.1145/3313294.3313386', '10.1177/20539517211033566',
  '10.1609/icwsm.v17i1.22179', '10.1177/08944393211034991',
  '10.1038/s41598-023-43980-4', '10.1073/pnas.2025334119',
  '10.1140/epjds/s13688-024-00456-3', '10.1145/3715275.3732159',
  '10.1038/s41586-026-10098-2', '10.1038/s41467-022-35576-9',
  '10.1017/psrm.2022.9', '10.1177/00223433221092815',
  '10.3389/fpos.2022.885362', '10.1038/s41467-024-52179-8',
]);
const background = new Set([
  '10.1145/3409116', '10.1007/s13278-023-01028-5',
  '10.1007/s41109-024-00668-6', '10.1017/pan.2023.42',
  '10.1007/s13278-022-01020-5',
]);

type Row = { openalex_id: string; doi: string; title: string; year: number | null;
  landing_page_url: string; query_hits: string[] };
const unique = new Map<string, Row>();
for (const run of input.runs) for (const item of run.items) {
  const hit = `${run.query} [${item.rank}]`;
  const row = unique.get(item.openalex_id);
  if (row) row.query_hits.push(hit);
  else unique.set(item.openalex_id, { openalex_id: item.openalex_id,
    doi: item.doi?.replace(/^https:\/\/doi\.org\//, '').toLowerCase() ?? '',
    title: item.title, year: item.year, landing_page_url: item.landing_page_url ?? '', query_hits: [hit] });
}
function cell(value: string | number | null): string {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
const lines = ['openalex_id,doi,title,year,landing_page_url,query_hits,decision,reason,screen_stage'];
const counts = { retrieve_full_text: 0, background_method: 0, exclude_title: 0 };
for (const row of unique.values()) {
  const decision = retrieve.has(row.doi) || row.title === 'The Global Disinformation Order: 2019 Global Inventory of Organised Social Media Manipulation'
    ? 'retrieve_full_text' : background.has(row.doi) ? 'background_method' : 'exclude_title';
  counts[decision]++;
  const reason = decision === 'retrieve_full_text' ? 'Potential eligible empirical source; full-text construct and dataset check pending'
    : decision === 'background_method' ? 'Method/review background; inspect citations, not counted as independent dataset'
    : 'Title does not show an eligible empirical O/A/C/D/E/R/I construct; provisional decision';
  lines.push([row.openalex_id, row.doi, row.title, row.year, row.landing_page_url,
    row.query_hits.join(' | '), decision, reason, 'preliminary_single_reviewer_title'].map(cell).join(','));
}
const output = resolve(folder, 'searches/openalex_initial_title_screen.csv');
writeFileSync(output, lines.join('\n') + '\n');
console.log(JSON.stringify({ output, retrieved: input.runs.reduce((n, run) => n + run.items.length, 0),
  unique: unique.size, ...counts }, null, 2));
