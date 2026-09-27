import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const path = resolve(folder, 'supplemental', 'LIVING_UPDATE_2026-09-27.csv');

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { value += '"'; index++; }
      else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(value); value = ''; }
    else if (char === '\n') { row.push(value); rows.push(row); row = []; value = ''; }
    else if (char !== '\r') value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}

const rows = parseCsv(readFileSync(path, 'utf8'));
const header = rows[0];
const records = rows.slice(1).map((row) => Object.fromEntries(header.map((name, index) => [name, row[index]])));
const constructs = ['origin_O', 'attribution_P', 'automation_A', 'coordination_C', 'deception_D', 'exposure_E', 'recommendation_R', 'impact_I'];
const allowed = new Set(['unknown', 'proxy', 'platform_disclosure', 'measurement_validation', 'measured_association', 'supported']);

assert.equal(records.length, 4, 'living update must contain four reviewed candidates');
assert.equal(new Set(records.map((record) => record.record_id)).size, records.length, 'record IDs must be unique');
assert.equal(new Set(records.map((record) => record.doi)).size, records.length, 'DOIs must be unique');
for (const record of records) {
  assert(/^10\.1609\/icwsm\./.test(record.doi), `unexpected DOI: ${record.doi}`);
  assert(record.source_url.startsWith('https://ojs.aaai.org/index.php/ICWSM/article/view/'), `non-primary source: ${record.record_id}`);
  assert(record.boundary_note.length >= 80, `boundary note is too short: ${record.record_id}`);
  for (const construct of constructs) assert(allowed.has(record[construct]), `invalid ${construct}: ${record.record_id}`);
}
assert(records.every((record) => record.origin_O === 'unknown'), 'article-page review cannot verify operator origin');
assert(records.some((record) => record.automation_A === 'measurement_validation'), 'bot benchmark candidate missing');
assert(records.some((record) => record.coordination_C === 'measurement_validation'), 'coordination validation candidate missing');
assert(records.every((record) => record.recommendation_R === 'unknown'), 'article-page review cannot establish recommendation effects');

console.log(JSON.stringify({ status: 'passed', records: records.length, source: 'official ICWSM article pages', registered_corpus_modified: false }, null, 2));
