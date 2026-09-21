import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const evidencePath = resolve(folder, 'EVIDENCE_MAP_SEED.csv');
const edgePath = resolve(folder, 'EDGE_MAP_SEED.csv');
const outputPath = resolve(folder, 'CLAIM_EVIDENCE_GRAPH_PROVISIONAL.json');
const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex');

function parseCsv(bytes: Buffer): Array<Record<string, string>> {
  const text = bytes.toString('utf8');
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
  const header = rows.shift();
  assert(header && header.length > 0, 'CSV header missing');
  return rows.filter((item) => item.some(Boolean)).map((item, index) => {
    assert.equal(item.length, header.length, `CSV row ${index + 2} has wrong column count`);
    return Object.fromEntries(header.map((key, column) => [key, item[column]]));
  });
}

const constructFields = {
  O: 'origin_evidence',
  P: 'operation_attribution_evidence',
  A: 'automation_evidence',
  C: 'coordination_evidence',
  D: 'deception_evidence',
  E: 'exposure_evidence',
  R: 'recommendation_evidence',
  I: 'impact_evidence',
} as const;
const evidenceStates = new Set(['unknown', 'proxy', 'supported', 'platform_disclosure', 'measurement_validation', 'measured_association']);
const edgeClasses = new Set(['untested', 'proxy_only', 'measured_association', 'causal_test']);
const evidenceBytes = readFileSync(evidencePath);
const edgeBytes = readFileSync(edgePath);
const evidenceRows = parseCsv(evidenceBytes);
const edgeRows = parseCsv(edgeBytes);
assert.equal(evidenceRows.length, 18);
assert.equal(edgeRows.length, 13);

const datasetIds = new Set<string>();
const records = evidenceRows.map((row) => {
  assert(row.record_id && row.dataset_id && row.platform && row.source, 'evidence record lacks a controlled identifier or source');
  assert(!datasetIds.has(row.dataset_id), `duplicate dataset_id: ${row.dataset_id}`);
  datasetIds.add(row.dataset_id);
  const constructs = Object.fromEntries(Object.entries(constructFields).map(([code, field]) => {
    assert(evidenceStates.has(row[field]), `invalid ${field} state for ${row.record_id}: ${row[field]}`);
    return [code, row[field]];
  }));
  return {
    record_id: row.record_id,
    dataset_id: row.dataset_id,
    platform: row.platform,
    period: row.period,
    source_type: row.source_type,
    constructs,
    independence_note: row.independence_note,
    evidence_status: row.evidence_status,
    source: row.source,
  };
});

const transitions = edgeRows.map((row, index) => {
  assert(datasetIds.has(row.dataset_id), `edge references missing dataset: ${row.dataset_id}`);
  assert(edgeClasses.has(row.classification), `invalid edge classification: ${row.classification}`);
  assert(row.edge && row.source && row.design_basis && row.limitation, `edge ${index + 1} is incomplete`);
  return {
    transition_id: `${row.dataset_id}:${row.edge}`,
    dataset_id: row.dataset_id,
    platform: row.platform,
    edge: row.edge,
    classification: row.classification,
    design_basis: row.design_basis,
    limitation: row.limitation,
    source: row.source,
  };
});
assert.equal(new Set(transitions.map((item) => item.transition_id)).size, transitions.length, 'duplicate transition identifier');

const graph = {
  title: 'Foreign Influence Evidence Observatory provisional claim-evidence graph',
  version: '2026-09-21-provisional-seed',
  status: 'scoping_only_not_systematic_review',
  claim_codes: {
    O: 'account_or_operator_origin', P: 'operation_attribution', A: 'automation', C: 'coordination',
    D: 'deception', E: 'observed_feed_delivery', R: 'recommendation_increment', I: 'audience_impact',
  },
  interpretation: {
    node_states: [...evidenceStates].sort(),
    edge_classes: [...edgeClasses].sort(),
    unknown_is_valid: true,
    final_review_complete: false,
    prohibition: 'Do not convert proxy, platform_disclosure, measurement_validation, or measured_association into verified account origin, automation, foreign control, recommendation causality, or audience impact.',
  },
  inputs: {
    evidence_map: { path: 'EVIDENCE_MAP_SEED.csv', sha256: sha256(evidenceBytes), records: records.length },
    edge_map: { path: 'EDGE_MAP_SEED.csv', sha256: sha256(edgeBytes), records: transitions.length },
  },
  datasets: records,
  transitions,
};
writeFileSync(outputPath, `${JSON.stringify(graph, null, 2)}\n`);
console.log(JSON.stringify({ status: 'passed', output: outputPath, datasets: records.length, transitions: transitions.length }));
