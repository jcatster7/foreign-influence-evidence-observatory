import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const graph = JSON.parse(readFileSync(resolve(folder, 'CLAIM_EVIDENCE_GRAPH_PROVISIONAL.json'), 'utf8'));
const status = JSON.parse(readFileSync(resolve(folder, 'OBSERVATORY_STATUS.json'), 'utf8'));
const benchmark = JSON.parse(readFileSync(resolve(folder, 'BENCHMARK_SCORER_SELF_CHECK.json'), 'utf8'));
assert.equal(graph.datasets.length, 18);
assert.equal(graph.transitions.length, 13);
assert.equal(status.status, 'passed');
assert.equal(benchmark.evaluatorSelfCheck, 'passed');

const data = JSON.stringify({ graph, status, benchmark }).replaceAll('<', '\\u003c');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Foreign Influence Evidence Observatory</title>
  <style>
    :root{color-scheme:dark;--bg:#07111f;--panel:#0f1d2e;--line:#263c53;--text:#e9f0f7;--muted:#9bb0c3;--accent:#69d2b0;--warn:#f0bf68;--unknown:#7f91a4}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 15% 0,#15324a 0,transparent 35%),var(--bg);color:var(--text);font:15px/1.5 ui-sans-serif,system-ui,-apple-system,sans-serif}
    main{max-width:1180px;margin:auto;padding:42px 22px 70px}h1{font-size:clamp(2rem,5vw,4rem);line-height:1.02;max-width:850px;margin:0 0 14px}h2{margin:38px 0 14px;font-size:1.35rem}.lede{max-width:820px;color:var(--muted);font-size:1.06rem}.notice{border-left:4px solid var(--warn);padding:12px 16px;background:#211b12;margin:24px 0}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}.card,.panel{background:color-mix(in srgb,var(--panel) 92%,transparent);border:1px solid var(--line);border-radius:12px;padding:16px}.big{font-size:1.8rem;font-weight:750}.label,.muted{color:var(--muted)}.filters{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}select,input{background:#091522;color:var(--text);border:1px solid var(--line);border-radius:8px;padding:9px 11px}input{min-width:260px;flex:1}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:12px}table{width:100%;border-collapse:collapse;min-width:900px;background:var(--panel)}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}th{position:sticky;top:0;background:#13263a;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em}.pill{display:inline-block;padding:2px 7px;border-radius:999px;background:#20364a;margin:1px;font-size:.76rem}.supported,.causal_test{background:#17493e;color:#9ff1d4}.unknown,.untested{background:#283747;color:#c1ceda}.proxy,.proxy_only,.platform_disclosure,.measurement_validation,.measured_association{background:#4a3518;color:#ffdda0}a{color:#8bdac1}.footer{margin-top:40px;color:var(--muted);font-size:.9rem}
  </style>
</head>
<body><main>
  <div class="label">PUBLIC PROVISIONAL RESEARCH INFRASTRUCTURE</div>
  <h1>Foreign Influence Evidence Observatory</h1>
  <p class="lede">An auditable map of what research actually measures across account origin, operation attribution, automation, coordination, deception, feed delivery, recommendation, and audience impact.</p>
  <div class="notice"><strong>Boundary:</strong> this is a scoping graph, not a completed systematic review or a list of verified foreign accounts. Unknown is a valid result.</div>
  <section class="cards" id="cards"></section>
  <h2>Dataset evidence</h2>
  <div class="filters"><select id="platform"></select><select id="construct"></select><input id="search" placeholder="Search dataset, source type, or status"></div>
  <div class="table-wrap"><table><thead><tr><th>Dataset</th><th>Platform / period</th><th>Selected construct</th><th>Status</th><th>Evidence state</th><th>Source</th></tr></thead><tbody id="datasets"></tbody></table></div>
  <h2>Claim transitions</h2>
  <div class="table-wrap"><table><thead><tr><th>Transition</th><th>Dataset</th><th>Class</th><th>Design basis</th><th>Limitation</th></tr></thead><tbody id="transitions"></tbody></table></div>
  <p class="footer">Generated from hash-audited repository artifacts. External spending: $0 of $20. <a href="https://github.com/jcatster7/foreign-influence-evidence-observatory">Source repository and protocols</a>.</p>
</main><script>
const DATA=${data};
const codes=DATA.graph.claim_codes, req=DATA.status.requirements, graph=DATA.graph;
const cards=[['Datasets',graph.datasets.length],['Claim transitions',graph.transitions.length],['Screening queue',req.preregistered_cross_platform_evidence_map.queue_records.toLocaleString()],['Unknown benchmark labels','71 / 80'],['Immutable releases',req.open_reproducible_repository.immutable_releases_verified],['External spend','$'+req.external_spend_cap.spend_usd+' / $'+req.external_spend_cap.cap_usd]];
document.querySelector('#cards').innerHTML=cards.map(([l,v])=>'<div class="card"><div class="big">'+v+'</div><div class="label">'+l+'</div></div>').join('');
const platform=document.querySelector('#platform'), construct=document.querySelector('#construct'), search=document.querySelector('#search');
const platforms=['All platforms',...new Set(graph.datasets.map(d=>d.platform))]; platform.innerHTML=platforms.map(x=>'<option>'+x+'</option>').join('');
construct.innerHTML=Object.entries(codes).map(([k,v])=>'<option value="'+k+'">'+k+' · '+v.replaceAll('_',' ')+'</option>').join('');
function esc(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function source(x){return x.startsWith('https://')?'<a href="'+esc(x)+'">source</a>':'<span class="muted">local source path: '+esc(x)+'</span>'}
function render(){const p=platform.value,q=search.value.toLowerCase(),c=construct.value;const rows=graph.datasets.filter(d=>(p==='All platforms'||d.platform===p)&&JSON.stringify(d).toLowerCase().includes(q));document.querySelector('#datasets').innerHTML=rows.map(d=>'<tr><td><strong>'+esc(d.dataset_id)+'</strong><br><span class="muted">'+esc(d.source_type)+'</span></td><td>'+esc(d.platform)+'<br><span class="muted">'+esc(d.period)+'</span></td><td>'+c+' · '+esc(codes[c].replaceAll('_',' '))+'</td><td>'+esc(d.evidence_status)+'</td><td><span class="pill '+esc(d.constructs[c])+'">'+esc(d.constructs[c])+'</span></td><td>'+source(d.source)+'<br><span class="muted">'+esc(d.independence_note)+'</span></td></tr>').join('')||'<tr><td colspan="6">No matching datasets.</td></tr>'}
document.querySelector('#transitions').innerHTML=graph.transitions.map(e=>'<tr><td><strong>'+esc(e.edge.replaceAll('_',' '))+'</strong></td><td>'+esc(e.dataset_id)+'</td><td><span class="pill '+esc(e.classification)+'">'+esc(e.classification)+'</span></td><td>'+esc(e.design_basis)+'</td><td>'+esc(e.limitation)+'</td></tr>').join('');
[platform,construct,search].forEach(x=>x.addEventListener('input',render));render();
</script></body></html>`;
mkdirSync(resolve(folder, 'docs'), { recursive: true });
writeFileSync(resolve(folder, 'docs', 'index.html'), html);
writeFileSync(resolve(folder, 'docs', '.nojekyll'), '');
console.log(JSON.stringify({ status: 'passed', output: 'docs/index.html', datasets: graph.datasets.length, transitions: graph.transitions.length }));
