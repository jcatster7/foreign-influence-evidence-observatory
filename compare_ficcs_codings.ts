import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const arg = (name:string) => process.argv.find(x => x.startsWith(`--${name}=`))?.slice(name.length+3);
const aPath=arg('a'), bPath=arg('b'), out=arg('out') ?? 'ficcs/coding/AGREEMENT_REPORT.json', disagreements=arg('disagreements') ?? 'ficcs/coding/disagreements.jsonl';
assert(aPath && bPath, 'usage: --a=<validated.jsonl> --b=<validated.jsonl>');
const load=(p:string)=>readFileSync(p,'utf8').trim().split('\n').filter(Boolean).map(x=>JSON.parse(x));
const A=load(aPath), B=load(bPath); assert.equal(A.length,B.length); assert.equal(A.length,1600);
const bm=new Map(B.map(x=>[x.row_key,x]));
for(const suffix of [aPath,bPath]) { const m=JSON.parse(readFileSync(`${suffix}.manifest.json`,'utf8')); assert.equal(m.status,'validated_complete_independent_ficcs_coding'); assert.equal(m.decision_sha256,createHash('sha256').update(readFileSync(suffix)).digest('hex')); }
function alphaNominal(pairs:Array<[string,string]>) { const cats=[...new Set(pairs.flat())]; const dobs=pairs.filter(([x,y])=>x!==y).length/pairs.length; const counts=new Map(cats.map(c=>[c,0])); for(const [x,y] of pairs){counts.set(x,counts.get(x)!+1);counts.set(y,counts.get(y)!+1)} const n=pairs.length*2; const agree=[...counts.values()].reduce((s,v)=>s+v*(v-1),0)/(n*(n-1)); const dexp=1-agree; return dexp===0?1:1-dobs/dexp; }
const domains:Record<string,Array<[string,string]>>={asserted_construct:[],evidence_decision:[],evidence_stage:[],edge_asserted:[],edge_status:[],consequence_category:[]};
const queue=[]; let exact=0;
for(const a of A){ const b=bm.get(a.row_key); assert(b,`missing ${a.row_key}`); const compare:string[]=[]; if(a.row_type==='construct'){compare.push('asserted_by_source','decision','evidence_stage');domains.asserted_construct.push([String(a.asserted_by_source),String(b.asserted_by_source)]);domains.evidence_decision.push([a.decision,b.decision]);domains.evidence_stage.push([a.evidence_stage,b.evidence_stage]);} else if(a.row_type==='edge'){compare.push('asserted','status');domains.edge_asserted.push([a.asserted,b.asserted]);domains.edge_status.push([a.status,b.status]);} else {const ac=[...a.categories].sort(),bc=[...b.categories].sort(); domains.consequence_category.push([ac.join('|'),bc.join('|')]);compare.push('categories','action_basis','severity');}
  const changed=compare.filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])); if(!changed.length) exact++; else queue.push({row_key:a.row_key,row_type:a.row_type,claim_id:a.claim_id,disputed_fields:changed,reviewer_a:Object.fromEntries(changed.map(k=>[k,a[k]])),reviewer_b:Object.fromEntries(changed.map(k=>[k,b[k]])),adjudication_status:'pending'});
}
const agreement=Object.fromEntries(Object.entries(domains).map(([k,p])=>[k,{n:p.length,raw_agreement:p.filter(([x,y])=>x===y).length/p.length,krippendorff_alpha_nominal:alphaNominal(p)}]));
const report={status:queue.length?'independent_coding_complete_adjudication_pending':'independent_coding_complete_no_disagreements',reviewer_a_sha256:createHash('sha256').update(readFileSync(aPath)).digest('hex'),reviewer_b_sha256:createHash('sha256').update(readFileSync(bPath)).digest('hex'),rows:A.length,exact_rows:exact,disagreements:queue.length,agreement};
writeFileSync(out,JSON.stringify(report,null,2)+'\n');writeFileSync(disagreements,queue.map(x=>JSON.stringify(x)).join('\n')+(queue.length?'\n':''));console.log(JSON.stringify(report,null,2));
