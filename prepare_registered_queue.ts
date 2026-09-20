import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const argument = process.argv[2];
if (!argument?.startsWith('--run-dir=')) throw new Error('Usage: node --experimental-strip-types prepare_registered_queue.ts --run-dir=/path/to/registered_openalex_run');
const directory = resolve(argument.slice('--run-dir='.length));
const run = JSON.parse(readFileSync(resolve(directory, 'RUN.json'), 'utf8')) as
  { registration_url: string; cutoff_utc_date: string; queries: string[]; status: string };
const fixedQueries = [
  '"foreign influence" AND "social media" AND (Twitter OR Facebook OR TikTok OR Reddit OR YouTube)',
  '"coordinated inauthentic behavior" AND (Twitter OR Facebook OR Instagram OR TikTok)',
  '"information operations" AND "social media" AND (exposure OR recommendation)',
  '"bot detection" AND (political OR election) AND validation',
  '"algorithmic amplification" AND (political OR election) AND (Twitter OR Facebook OR TikTok OR YouTube)',
];
const fixedSelect = 'id,display_name,doi,publication_year,publication_date,type,primary_location,abstract_inverted_index';
if (run.status !== 'complete' || JSON.stringify(run.queries) !== JSON.stringify(fixedQueries) ||
    !run.registration_url?.startsWith('https://osf.io/')) {
  throw new Error('A complete five-query OSF-registered OpenAlex run is required');
}
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
type Work = { id: string; display_name: string; doi: string | null; publication_year: number | null;
  publication_date: string | null; type: string | null; primary_location?: { landing_page_url?: string | null };
  abstract_inverted_index?: Record<string, number[]> | null };
type Reply = { meta: { count: number; next_cursor: string | null }; results: Work[] };
type Checkpoint = { registration_url: string; query_index: number; query: string; page: number; url: string;
  cursor_in: string; cursor_out: string | null; response_sha256: string; returned: number; reported_total_results: number };
type Candidate = { record_key: string; openalex_ids: string[]; doi: string | null; title: string; abstract: string | null;
  year: number | null; publication_date: string | null; type: string | null; landing_page_url: string | null;
  query_hits: number[]; source_pages: string[]; primary_query: number; priority_score: number;
  calibration_sample: boolean; screening_status: 'unscreened' };
const abstractText = (index: Record<string, number[]> | null | undefined): string | null => {
  if (!index) return null;
  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) for (const position of positions) {
    if (!Number.isInteger(position) || position < 0 || position > 10000 || words[position]) throw new Error('Invalid abstract inverted index');
    words[position] = word;
  }
  return words.length ? words.join(' ').replace(/\s+/g, ' ').trim() : null;
};
const byOpenAlex = new Map<string, Omit<Candidate, 'record_key' | 'primary_query' | 'priority_score' | 'calibration_sample' | 'screening_status'>>();
const pageCounts: { query_index: number; pages: number; retrieved: number; reported_total_at_last_page: number }[] = [];
const checkpointNames = readdirSync(directory).filter((name) => /^q\d+_p\d+\.checkpoint\.json$/.test(name));
for (let qi = 1; qi <= 5; qi++) {
  let cursor = '*';
  const seenCursors = new Set<string>();
  let page = 1;
  let retrieved = 0;
  let reportedTotal = 0;
  while (cursor) {
    if (seenCursors.has(cursor)) throw new Error(`Repeated cursor in query ${qi}`);
    seenCursors.add(cursor);
    const base = `q${qi}_p${String(page).padStart(3, '0')}`;
    const checkpointPath = resolve(directory, `${base}.checkpoint.json`);
    const rawPath = resolve(directory, `${base}.response.json`);
    if (!existsSync(checkpointPath) || !existsSync(rawPath)) throw new Error(`Missing page or raw response: ${base}`);
    const checkpoint = JSON.parse(readFileSync(checkpointPath, 'utf8')) as Checkpoint;
    const raw = readFileSync(rawPath, 'utf8');
    const response = JSON.parse(raw) as Reply;
    const url = new URL(checkpoint.url);
    if (checkpoint.registration_url !== run.registration_url || checkpoint.query_index !== qi ||
        checkpoint.query !== run.queries[qi - 1] || checkpoint.page !== page || checkpoint.cursor_in !== cursor ||
        checkpoint.response_sha256 !== sha256(raw) || checkpoint.returned !== response.results?.length ||
        checkpoint.reported_total_results !== response.meta?.count || checkpoint.cursor_out !== response.meta.next_cursor ||
        url.origin !== 'https://api.openalex.org' || url.pathname !== '/works' ||
        url.searchParams.get('search') !== run.queries[qi - 1] ||
        url.searchParams.get('filter') !== `to_publication_date:${run.cutoff_utc_date}` ||
        url.searchParams.get('per_page') !== '100' || url.searchParams.get('cursor') !== cursor ||
        url.searchParams.get('select') !== fixedSelect || [...url.searchParams.keys()].length !== 5 ||
        response.results.length > 100 || !Number.isInteger(response.meta?.count) || response.meta.count < 0 ||
        (response.meta.next_cursor !== null && typeof response.meta.next_cursor !== 'string')) {
      throw new Error(`Checkpoint or response mismatch: ${base}`);
    }
    for (const work of response.results) {
      if (!work.id?.startsWith('https://openalex.org/W') || !work.display_name) throw new Error(`Invalid work: ${base}`);
      const prior = byOpenAlex.get(work.id);
      if (prior) {
        if (!prior.query_hits.includes(qi)) prior.query_hits.push(qi);
        if (!prior.source_pages.includes(base)) prior.source_pages.push(base);
        continue;
      }
      const doi = work.doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim().toLowerCase() || null;
      byOpenAlex.set(work.id, { openalex_ids: [work.id], doi, title: work.display_name,
        abstract: abstractText(work.abstract_inverted_index), year: work.publication_year,
        publication_date: work.publication_date, type: work.type,
        landing_page_url: work.primary_location?.landing_page_url ?? null,
        query_hits: [qi], source_pages: [base] });
    }
    retrieved += response.results.length;
    reportedTotal = response.meta.count;
    cursor = response.meta.next_cursor ?? '';
    page++;
    if (page > 200 && cursor) throw new Error(`Query ${qi} exceeds the registered safety cap`);
  }
  pageCounts.push({ query_index: qi, pages: page - 1, retrieved, reported_total_at_last_page: reportedTotal });
}
if (checkpointNames.length !== pageCounts.reduce((sum, item) => sum + item.pages, 0)) throw new Error('Unexpected extra checkpoint pages');
const phrases = [
  /foreign (influence|interference|information operation)/i,
  /coordinated inauthentic/i,
  /social bot|bot detection|automated account/i,
  /algorithmic amplif|recommendation|ranked feed|timeline exposure/i,
  /internet research agency|state[- ]sponsored|state[- ]backed/i,
];
const platform = /twitter|x\/twitter|facebook|instagram|tiktok|reddit|youtube|social media|social network/i;
const byKey = new Map<string, Candidate>();
for (const item of [...byOpenAlex.values()].sort((a, b) => a.openalex_ids[0].localeCompare(b.openalex_ids[0]))) {
  const recordKey = item.doi ? `doi:${item.doi}` : `openalex:${item.openalex_ids[0]}`;
  const prior = byKey.get(recordKey);
  if (prior) {
    prior.openalex_ids.push(item.openalex_ids[0]);
    prior.query_hits = [...new Set([...prior.query_hits, ...item.query_hits])].sort((a, b) => a - b);
    prior.source_pages = [...new Set([...prior.source_pages, ...item.source_pages])].sort();
    if ((item.abstract?.length ?? 0) > (prior.abstract?.length ?? 0)) prior.abstract = item.abstract;
  } else byKey.set(recordKey, { ...item, record_key: recordKey, query_hits: [...item.query_hits].sort((a, b) => a - b),
    primary_query: 0, priority_score: 0, calibration_sample: false, screening_status: 'unscreened' });
}
const queue = [...byKey.values()];
for (const item of queue) {
  item.primary_query = Math.min(...item.query_hits);
  item.priority_score = phrases.reduce((count, phrase) => count + (phrase.test(item.title) ? 2 : 0), 0) +
    (platform.test(item.title) ? 1 : 0) + Math.min(2, item.query_hits.length - 1);
}
const calibrationHash = (key: string) => sha256(`observatory-calibration-v1:${key}`);
for (let qi = 1; qi <= 5; qi++) {
  const stratum = queue.filter((item) => item.primary_query === qi)
    .sort((a, b) => calibrationHash(a.record_key).localeCompare(calibrationHash(b.record_key)));
  for (const item of stratum.slice(0, Math.ceil(stratum.length * 0.2))) item.calibration_sample = true;
}
queue.sort((a, b) => Number(b.calibration_sample) - Number(a.calibration_sample) ||
  b.priority_score - a.priority_score || a.record_key.localeCompare(b.record_key));
const queueText = queue.map((item) => JSON.stringify(item)).join('\n') + '\n';
const queuePath = resolve(directory, 'screening_queue.jsonl');
if (existsSync(queuePath) && readFileSync(queuePath, 'utf8') !== queueText) throw new Error('Frozen registered queue differs from regenerated queue');
if (!existsSync(queuePath)) writeFileSync(queuePath, queueText);
const summary = { status: 'registered_openalex_queue_unscreened', registration_url: run.registration_url,
  cutoff_utc_date: run.cutoff_utc_date, queue_sha256: sha256(queueText),
  retrieved: pageCounts.reduce((sum, item) => sum + item.retrieved, 0), unique_openalex_ids: byOpenAlex.size,
  duplicate_doi_records_collapsed: byOpenAlex.size - queue.length, unique_screening_records: queue.length,
  calibration_count: queue.filter((item) => item.calibration_sample).length,
  records_with_abstract: queue.filter((item) => item.abstract).length, queries: pageCounts };
const summaryText = JSON.stringify(summary, null, 2) + '\n';
const summaryPath = resolve(directory, 'screening_queue_summary.json');
if (existsSync(summaryPath) && readFileSync(summaryPath, 'utf8') !== summaryText) throw new Error('Frozen registered summary differs from regenerated summary');
if (!existsSync(summaryPath)) writeFileSync(summaryPath, summaryText);
console.log(summaryText);
