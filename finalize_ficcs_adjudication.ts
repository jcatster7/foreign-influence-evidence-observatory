import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const arg=(name:string)=>process.argv.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3);
const aPath=arg('a'),bPath=arg('b'),resolutionPath=arg('resolutions'),out=arg('out')??'ficcs/coding/adjudicated_decisions.jsonl';
assert(aPath&&bPath&&resolutionPath,'usage: --a=<validated-a.jsonl> --b=<validated-b.jsonl> --resolutions=<jsonl> [--out=<jsonl>]');
const sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const load=(p:string)=>readFileSync(p,'utf8').trim().split('\n').filter(Boolean).map(x=>JSON.parse(x));
for(const p of [aPath,bPath]){assert(existsSync(`${p}.manifest.json`));const m=JSON.parse(readFileSync(`${p}.manifest.json`,'utf8'));assert.equal(m.status,'validated_complete_independent_ficcs_coding');assert.equal(m.decision_sha256,sha(p));}
const A=load(aPath),B=load(bPath),R=load(resolutionPath);assert.equal(A.length,1600);assert.equal(B.length,1600);
const bm=new Map(B.map(x=>[x.row_key,x])),rm=new Map(R.map(x=>[x.row_key,x]));assert.equal(rm.size,R.length,'duplicate resolution row');
const substantiveFields=(r:any)=>r.row_type==='construct'?['asserted_by_source','decision','evidence_stage']:r.row_type==='edge'?['asserted','status']:['categories','action_basis','severity'];
const requiredFields=(r:any)=>r.row_type==='construct'?['asserted_by_source','decision','evidence_stage','evidence_locator','rationale','confidence','source_checked']:r.row_type==='edge'?['asserted','status','rationale','source_checked']:['categories','action_basis','severity','rationale','source_checked'];
function validateDecision(r:any){assert(typeof r.rationale==='string'&&r.rationale.trim());assert.equal(r.source_checked,true);if(r.row_type==='construct'){assert.equal(typeof r.asserted_by_source,'boolean');assert(['supported','contradicted','unknown'].includes(r.decision));assert(['direct','proxy','platform_disclosure','measurement_validation','unknown'].includes(r.evidence_stage));assert(['high','moderate','low'].includes(r.confidence));}else if(r.row_type==='edge'){assert(['yes','no','unclear'].includes(r.asserted));assert(['supported_link','measured_association','proxy_only','untested','contradicted_link'].includes(r.status));}else{assert(Array.isArray(r.categories)&&r.categories.length);assert(['none_descriptive','recommended','documented_taken','both','unclear'].includes(r.action_basis));assert(['low','moderate','high'].includes(r.severity));}}
const final=[];const resolved=new Set<string>();let agreed=0,adjudicated=0;
for(const a of A){const b=bm.get(a.row_key);assert(b,`missing reviewer B row ${a.row_key}`);assert.equal(a.row_type,b.row_type);assert.equal(a.claim_id,b.claim_id);const fields=substantiveFields(a);const differs=fields.some(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]));let chosen=a;let trail:any;
  if(!differs){agreed++;trail={status:'agreed',reviewer_a_row_sha256:createHash('sha256').update(JSON.stringify(a)).digest('hex'),reviewer_b_row_sha256:createHash('sha256').update(JSON.stringify(b)).digest('hex'),changed_fields:[]};}
  else{const r=rm.get(a.row_key);assert(r,`missing resolution ${a.row_key}`);resolved.add(a.row_key);assert(['reviewer_a','reviewer_b','third_decision'].includes(r.resolution));assert(typeof r.adjudicator_id==='string'&&r.adjudicator_id.trim());assert(typeof r.rationale==='string'&&r.rationale.trim());assert(!Number.isNaN(Date.parse(r.decided_at_utc)));
    if(r.resolution!=='third_decision')assert(r.third_decision==null,'third_decision must be null unless selected');
    if(r.resolution==='reviewer_b')chosen=b;else if(r.resolution==='third_decision'){assert(r.third_decision&&typeof r.third_decision==='object');chosen={...a,...r.third_decision};assert.equal(chosen.row_key,a.row_key);assert.equal(chosen.row_type,a.row_type);assert.equal(chosen.claim_id,a.claim_id);if(a.row_type==='construct')assert.equal(chosen.construct,a.construct);if(a.row_type==='edge'){assert.equal(chosen.from,a.from);assert.equal(chosen.to,a.to);}}
    for(const k of requiredFields(a))assert(chosen[k]!==undefined,`resolved row missing ${k}: ${a.row_key}`);
    validateDecision(chosen);
    trail={status:'adjudicated',resolution:r.resolution,adjudicator_id:r.adjudicator_id,rationale:r.rationale,decided_at_utc:r.decided_at_utc,changed_fields:fields.filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])),reviewer_a_row_sha256:createHash('sha256').update(JSON.stringify(a)).digest('hex'),reviewer_b_row_sha256:createHash('sha256').update(JSON.stringify(b)).digest('hex')};adjudicated++;}
  final.push({...chosen,adjudication:trail});
}
assert.equal(resolved.size,rm.size,'resolution supplied for a non-disagreement row');
const text=final.map(x=>JSON.stringify(x)).join('\n')+'\n';writeFileSync(out,text);
const manifest={status:'validated_complete_adjudicated_ficcs_coding',reviewer_a_sha256:sha(aPath),reviewer_b_sha256:sha(bPath),resolutions_sha256:sha(resolutionPath),decision_sha256:createHash('sha256').update(text).digest('hex'),rows:final.length,agreed_rows:agreed,adjudicated_rows:adjudicated,originals_preserved:true};
writeFileSync(`${out}.manifest.json`,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest,null,2));
