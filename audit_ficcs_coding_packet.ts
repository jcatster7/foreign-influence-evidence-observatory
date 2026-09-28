import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const packet='ficcs/coding/blind_claim_packet_v1.jsonl';
const pm=JSON.parse(readFileSync('ficcs/coding/PACKET_MANIFEST.json','utf8'));
const wm=JSON.parse(readFileSync('ficcs/coding/WORKBOOK_MANIFEST.json','utf8'));
const rows=readFileSync(packet,'utf8').trim().split('\n').map(JSON.parse);
assert.equal(rows.length,100); assert.equal(pm.packet_sha256,createHash('sha256').update(readFileSync(packet)).digest('hex')); assert.equal(pm.labels_withheld,true);
for(const row of rows){assert(!('constructs' in row));assert(!('edges' in row));assert(!('institutional_consequences' in row));assert(!('coding_status' in row));}
assert.equal(wm.decisions_prefilled,false); assert.equal(wm.outputs.length,2);
for(const item of wm.outputs){assert(existsSync(item.path));assert.equal(item.sha256,createHash('sha256').update(readFileSync(item.path)).digest('hex'));}
console.log(JSON.stringify({status:'passed',claims:rows.length,construct_slots:800,registered_edge_slots:700,workbooks:2,labels_withheld:true},null,2));
