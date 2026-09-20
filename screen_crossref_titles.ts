import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const input = JSON.parse(readFileSync(resolve(folder, 'searches/crossref_initial_2026-09-19.json'), 'utf8')) as {
  runs: { query: string; items: { rank: number; doi: string | null; title: string; year: number | null; url: string | null }[] }[]
};

// Preliminary title screen only. Full text and a second reviewer can reverse any decision.
const retrieve = new Set([
  '10.51685/jqd.2022.010', '10.1017/psrm.2022.9', '10.7249/rr2740',
  '10.5210/spir.v2020i0.11132', '10.1016/j.dss.2022.113819',
  '10.3389/fsoc.2023.1141416', '10.1177/08944393211019951',
  '10.1609/icwsm.v18i1.31305', '10.1609/icwsm.v15i1.18074',
  '10.1016/j.osnem.2022.100224', '10.1609/icwsm.v20i1.42711',
  '10.1177/29768624251369784', '10.1145/3778356',
  '10.3389/fcomm.2025.1510144', '10.1016/j.jjimei.2026.100420',
  '10.1145/3313294.3313386', '10.55730/1300-0632.3848',
  '10.1109/tifs.2023.3254429', '10.1007/s11416-024-00521-5',
  '10.1145/3660522', '10.1287/isre.2022.1136',
  '10.1145/3641523.3665172', '10.1038/s41562-023-01604-x',
  '10.1093/hcr/hqac012', '10.7249/rra2853-1',
]);
const background = new Set([
  '10.1145/3409116', '10.5210/fm.v26i7.11474',
  '10.32614/cran.package.coortweet', '10.4337/9781800374263.coordinated.inauthentic.behavior',
]);

function cell(value: string | number | null): string {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

const lines = ['query,rank,doi,title,year,url,decision,reason,screen_stage'];
const counts = { retrieve_full_text: 0, background_method: 0, exclude_title: 0 };
for (const run of input.runs) {
  for (const item of run.items) {
    const doi = item.doi?.toLowerCase() ?? '';
    const decision = retrieve.has(doi) ? 'retrieve_full_text' : background.has(doi) ? 'background_method' : 'exclude_title';
    const reason = decision === 'retrieve_full_text' ? 'Potential empirical study or source report; construct and methods require full-text check'
      : decision === 'background_method' ? 'Method or conceptual background; inspect for citations, not an independent dataset'
      : 'Title does not show an eligible empirical social-platform construct; reversible at full-text or citation check';
    counts[decision]++;
    lines.push([run.query, item.rank, doi, item.title, item.year, item.url, decision, reason, 'preliminary_single_reviewer_title'].map(cell).join(','));
  }
}
const output = resolve(folder, 'searches/crossref_initial_title_screen.csv');
writeFileSync(output, lines.join('\n') + '\n');
console.log(JSON.stringify({ output, total: lines.length - 1, ...counts }, null, 2));
