import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const input = 'ficcs/claim_extractions_v1.jsonl';
const outDir = 'ficcs/coding';
const out = `${outDir}/blind_claim_packet_v1.jsonl`;
const manifest = `${outDir}/PACKET_MANIFEST.json`;
const bytes = readFileSync(input);
const claims = bytes.toString('utf8').trim().split('\n').map((line) => JSON.parse(line));
const rows = claims.map(({ extraction_status: _status, ...claim }) => claim);
const text = rows.map((row) => JSON.stringify(row)).join('\n') + '\n';

mkdirSync(outDir, { recursive: true });
writeFileSync(out, text);
writeFileSync(manifest, JSON.stringify({
  status: 'blind_independent_coding_packet',
  version: '1.0.0',
  source_file: input,
  source_sha256: createHash('sha256').update(bytes).digest('hex'),
  packet_file: out,
  packet_sha256: createHash('sha256').update(text).digest('hex'),
  claims: rows.length,
  construct_slots: rows.length * 8,
  registered_edge_slots: rows.length * 7,
  labels_withheld: true,
  generated_by: 'deterministic transformation; no coding decisions generated',
}, null, 2) + '\n');

console.log(JSON.stringify({ claims: rows.length, out, manifest }));
