import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const read = (path: string): string => readFileSync(resolve(folder, path), 'utf8');
const json = (path: string): Record<string, any> => JSON.parse(read(path));
const sha256 = (text: string | Buffer): string => createHash('sha256').update(text).digest('hex');

const protocol = read('ficcs/PREREGISTRATION.md');
const claimSchemaText = read('ficcs/claim.schema.json');
const frameSchemaText = read('ficcs/source_frame.schema.json');
const claimSchema = json('ficcs/claim.schema.json');
const frameSchema = json('ficcs/source_frame.schema.json');
const registration = json('ficcs/REGISTRATION_STATUS.json');
const manifest = json('registration/FICCS_REGISTRATION_MANIFEST_v0.6.0.json');
const sourceFrameManifest = json('registration/FICCS_SOURCE_FRAME_MANIFEST_v0.6.1.json');
const frozenFrameManifest = json('registration/FICCS_SOURCE_FRAME_FREEZE_MANIFEST_v0.7.0.json');
const frozenFrameStatus = json('ficcs/SOURCE_FRAME_STATUS.json');

for (const phrase of [
  'at least 100 atomic claims',
  'at least 60 source documents',
  'each contributing at least 25 primary claims',
  'Two coders independently code every primary claim',
  'unsupported assertion proportion = unsupported asserted slots / all asserted slots',
  'predictions from each evaluated method before revealing labels',
  'spending ledger remains at or below $20',
]) assert(protocol.includes(phrase), `protocol commitment missing: ${phrase}`);

const constructCodes = ['O', 'P', 'A', 'C', 'D', 'E', 'R', 'I'];
assert.deepEqual(Object.keys(claimSchema.properties.constructs.properties), constructCodes);
assert.deepEqual(claimSchema.properties.claim.properties.asserted_constructs.items.enum, constructCodes);
assert.deepEqual(claimSchema.$defs.constructDecision.properties.decision.enum, ['supported', 'contradicted', 'unknown']);
assert(claimSchema.$defs.edge.properties.status.enum.includes('proxy_only'));
assert.equal(claimSchema.properties.source.properties.quote_word_count.maximum, 25);
assert.deepEqual(frameSchema.properties.source_type.enum, ['research', 'platform', 'government', 'journalism']);
assert(frameSchema.required.includes('duplicate_family_id'));
assert.equal(registration.status, 'registered');
assert.equal(registration.immutable, true);
assert.equal(registration.tag, manifest.tag);
assert.equal(registration.asset_sha256, sha256(readFileSync(resolve(folder, 'registration/FICCS_PREREGISTRATION_PACKET_v0.6.0.zip'))));
assert.equal(manifest.prospective_state.source_frame_records, 0);
assert.equal(manifest.prospective_state.corpus_claims, 0);
assert.equal(manifest.prospective_state.independent_codings, 0);
assert.equal(registration.source_frame_amendment.immutable, true);
assert.equal(registration.source_frame_amendment.tag, sourceFrameManifest.tag);
assert.equal(registration.source_frame_amendment.registered_seed, sourceFrameManifest.registered_seed);
assert.equal(registration.source_frame_amendment.asset_sha256,
  sha256(readFileSync(resolve(folder, 'registration/FICCS_SOURCE_FRAME_PACKET_v0.6.1.zip'))));
assert.equal(sourceFrameManifest.prospective_state.source_frame_records, 0);
assert.equal(sourceFrameManifest.prospective_state.corpus_claims, 0);
assert.equal(frozenFrameStatus.status, 'frozen');
assert.equal(frozenFrameStatus.immutable, true);
assert.equal(frozenFrameStatus.tag, frozenFrameManifest.tag);
assert.equal(frozenFrameStatus.source_frame_sha256, sha256(readFileSync(resolve(folder, 'ficcs/source_frame_v1.jsonl'))));
assert.equal(frozenFrameStatus.asset_sha256,
  sha256(readFileSync(resolve(folder, 'registration/FICCS_SOURCE_FRAME_FREEZE_PACKET_v0.7.0.zip'))));
assert.equal(frozenFrameStatus.manifest_asset_sha256,
  sha256(readFileSync(resolve(folder, 'registration/FICCS_SOURCE_FRAME_FREEZE_MANIFEST_v0.7.0.json'))));
assert.equal(frozenFrameManifest.freeze_state.eligible_source_documents, 60);
assert.equal(frozenFrameManifest.freeze_state.corpus_claims, 0);
assert.equal(frozenFrameManifest.freeze_state.independent_codings, 0);
assert.equal(frozenFrameManifest.freeze_state.stress_test_predictions, 0);
for (const path of ['ficcs/AMENDMENT_v0.6.1_SOURCE_FRAME.md', 'build_ficcs_source_frame.ts']) {
  const frozen = sourceFrameManifest.files.find((item: Record<string, any>) => item.path === path);
  assert(frozen, `source-frame amendment entry missing: ${path}`);
  assert.equal(sha256(readFileSync(resolve(folder, path))), frozen.sha256, `registered amendment file changed: ${path}`);
}
for (const path of ['ficcs/PREREGISTRATION.md', 'ficcs/claim.schema.json', 'ficcs/source_frame.schema.json', 'EXTRACTION_CODEBOOK.md']) {
  const frozen = manifest.files.find((item: Record<string, any>) => item.path === path);
  assert(frozen, `registered manifest entry missing: ${path}`);
  assert.equal(sha256(readFileSync(resolve(folder, path))), frozen.sha256, `registered file changed: ${path}`);
}

console.log(JSON.stringify({
  status: 'passed',
  protocol_status: 'registered_immutable',
  release_url: registration.release_url,
  source_frame_amendment_url: registration.source_frame_amendment.release_url,
  source_frame_status: 'frozen_immutable',
  source_frame_release_url: frozenFrameStatus.release_url,
  eligible_source_documents: frozenFrameStatus.eligible_source_documents,
  source_frame_sha256: frozenFrameStatus.source_frame_sha256,
  corpus_claims: 0,
  independent_codings: 0,
  claim_schema_sha256: sha256(claimSchemaText),
  source_frame_schema_sha256: sha256(frameSchemaText),
  external_spend_usd: 0,
}, null, 2));
