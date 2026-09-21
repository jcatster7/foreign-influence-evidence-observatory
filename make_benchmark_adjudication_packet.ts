import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const claims = ['origin', 'operation_attribution', 'automation', 'coordination', 'deception', 'exposure', 'recommendation', 'impact'] as const;
const folder = dirname(fileURLToPath(import.meta.url));
const casePath = resolve(folder, 'benchmark_cases.json');
const outputDir = resolve(folder, 'benchmark_adjudication');
const packetPath = resolve(outputDir, 'independent_reviewer_packet.jsonl');
const manifestPath = resolve(outputDir, 'PACKET_MANIFEST.json');

type BenchmarkCase = {
  case_id: string;
  dataset_id: string;
  platform: string;
  collection_period: string;
  unit: string;
  claim_subject: string;
  evidence: string;
  source: string;
  source_locator: string;
  source_sha256: string;
  source_hash_scope: string;
};

const caseBytes = readFileSync(casePath);
const cases = JSON.parse(caseBytes.toString('utf8')) as BenchmarkCase[];
const rows = cases.flatMap((item) => claims.map((claim) => ({
  row_key: `${item.case_id}:${claim}`,
  case_id: item.case_id,
  claim,
  dataset_id: item.dataset_id,
  platform: item.platform,
  collection_period: item.collection_period,
  unit: item.unit,
  claim_subject: item.claim_subject,
  evidence: item.evidence,
  source: item.source,
  source_locator: item.source_locator,
  source_sha256: item.source_sha256,
  source_hash_scope: item.source_hash_scope,
})));

const packet = rows.map((row) => JSON.stringify(row)).join('\n') + '\n';
mkdirSync(outputDir, { recursive: true });
writeFileSync(packetPath, packet);
writeFileSync(manifestPath, `${JSON.stringify({
  status: 'blind_independent_adjudication_packet',
  case_file: 'benchmark_cases.json',
  case_file_sha256: createHash('sha256').update(caseBytes).digest('hex'),
  packet_file: 'independent_reviewer_packet.jsonl',
  packet_sha256: createHash('sha256').update(packet).digest('hex'),
  cases: cases.length,
  claims_per_case: claims.length,
  rows: rows.length,
  labels_withheld: true,
  allowed_labels: ['supported', 'contradicted', 'unknown'],
}, null, 2)}\n`);
console.log(JSON.stringify({ packet: packetPath, manifest: manifestPath, rows: rows.length }, null, 2));
