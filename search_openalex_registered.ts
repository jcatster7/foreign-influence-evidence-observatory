import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Run only after the OSF registration is public. The URL is recorded, not authenticated by this script.
const queries = [
  '"foreign influence" AND "social media" AND (Twitter OR Facebook OR TikTok OR Reddit OR YouTube)',
  '"coordinated inauthentic behavior" AND (Twitter OR Facebook OR Instagram OR TikTok)',
  '"information operations" AND "social media" AND (exposure OR recommendation)',
  '"bot detection" AND (political OR election) AND validation',
  '"algorithmic amplification" AND (political OR election) AND (Twitter OR Facebook OR TikTok OR YouTube)',
];
const args = new Map(process.argv.slice(2).map((arg) => {
  const match = /^--([a-z-]+)=(.+)$/.exec(arg);
  if (!match) throw new Error(`Expected --name=value, got ${arg}`);
  return [match[1], match[2]];
}));
const registrationUrl = args.get('registration-url');
const cutoff = args.get('cutoff');
if (!registrationUrl || !cutoff || args.size !== 2) {
  throw new Error('Usage: node --experimental-strip-types search_openalex_registered.ts --registration-url=https://osf.io/REGISTRATION/ --cutoff=YYYY-MM-DD');
}
const registration = new URL(registrationUrl);
if (registration.protocol !== 'https:' || registration.hostname !== 'osf.io' || !/^\/[a-z0-9]{5,}\/$/i.test(registration.pathname)) {
  throw new Error('Expected a public OSF registration URL, for example https://osf.io/abcde/');
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoff) || Number.isNaN(Date.parse(`${cutoff}T00:00:00Z`))) throw new Error('Invalid UTC cutoff date');
const folder = dirname(fileURLToPath(import.meta.url));
const outdir = resolve(folder, 'searches', `registered_openalex_${cutoff}_${registration.pathname.split('/')[1]}`);
mkdirSync(outdir, { recursive: true });
const run = { registration_url: registration.toString(), cutoff_utc_date: cutoff, queries, source: 'OpenAlex core works',
  status: 'in_progress', started_at_utc: new Date().toISOString() };
const runPath = resolve(outdir, 'RUN.json');
if (existsSync(runPath)) {
  const prior = JSON.parse(readFileSync(runPath, 'utf8')) as typeof run;
  if (prior.registration_url !== run.registration_url || prior.cutoff_utc_date !== cutoff || JSON.stringify(prior.queries) !== JSON.stringify(queries)) {
    throw new Error('Registered run parameters changed; use a new directory and log the deviation');
  }
} else writeFileSync(runPath, JSON.stringify(run, null, 2) + '\n');

type Reply = { meta: { count: number; next_cursor: string | null; cost_usd?: number }; results: unknown[] };
const digest = (bytes: string) => createHash('sha256').update(bytes).digest('hex');
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
for (let qi = 0; qi < queries.length; qi++) {
  let cursor = '*';
  for (let page = 1; cursor; page++) {
    if (page > 200) throw new Error(`Safety page cap reached for query ${qi + 1}; search remains incomplete`);
    const base = `q${qi + 1}_p${String(page).padStart(3, '0')}`;
    const rawPath = resolve(outdir, `${base}.response.json`);
    const recordPath = resolve(outdir, `${base}.checkpoint.json`);
    const url = new URL('https://api.openalex.org/works');
    url.searchParams.set('search', queries[qi]);
    url.searchParams.set('filter', `to_publication_date:${cutoff}`);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('cursor', cursor);
    url.searchParams.set('select', 'id,display_name,doi,publication_year,publication_date,type,primary_location,abstract_inverted_index');
    if (existsSync(recordPath) || existsSync(rawPath)) {
      if (!existsSync(recordPath) || !existsSync(rawPath)) throw new Error(`Incomplete checkpoint: ${base}`);
      const prior = JSON.parse(readFileSync(recordPath, 'utf8')) as { url: string; cursor_in: string; cursor_out: string | null; response_sha256: string };
      if (prior.url !== url.toString() || prior.cursor_in !== cursor || digest(readFileSync(rawPath, 'utf8')) !== prior.response_sha256) {
        throw new Error(`Checkpoint mismatch: ${base}`);
      }
      cursor = prior.cursor_out ?? '';
      continue;
    }
    let response: Response | undefined;
    for (let attempt = 0; attempt < 4; attempt++) {
      response = await fetch(url);
      if (response.ok) break;
      if (![429, 500, 502, 503, 504].includes(response.status)) throw new Error(`HTTP ${response.status}: ${url}`);
      await sleep(1000 * 2 ** attempt);
    }
    if (!response?.ok) throw new Error(`API failure ${response?.status}: ${url}`);
    const raw = await response.text();
    const parsed = JSON.parse(raw) as Reply;
    if (!Array.isArray(parsed.results) || typeof parsed.meta?.count !== 'number') throw new Error(`Malformed API response: ${url}`);
    const record = { registration_url: registration.toString(), query_index: qi + 1, query: queries[qi], page,
      url: url.toString(), cursor_in: cursor, cursor_out: parsed.meta.next_cursor, fetched_at_utc: new Date().toISOString(),
      response_sha256: digest(raw), reported_total_results: parsed.meta.count, returned: parsed.results.length,
      api_estimated_cost_usd: parsed.meta.cost_usd ?? null };
    const rawTmp = `${rawPath}.tmp`;
    const recordTmp = `${recordPath}.tmp`;
    writeFileSync(rawTmp, raw);
    renameSync(rawTmp, rawPath);
    writeFileSync(recordTmp, JSON.stringify(record, null, 2) + '\n');
    renameSync(recordTmp, recordPath);
    console.log(`query ${qi + 1} page ${page}: ${parsed.results.length} records`);
    cursor = parsed.meta.next_cursor ?? '';
    await sleep(120);
  }
}
const complete = { ...run, status: 'complete', completed_at_utc: new Date().toISOString() };
writeFileSync(runPath, JSON.stringify(complete, null, 2) + '\n');
console.log(`Registered OpenAlex harvest complete: ${outdir}`);
