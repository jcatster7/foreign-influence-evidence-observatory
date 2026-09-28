#!/usr/bin/env python3
import argparse, hashlib, json, math
from pathlib import Path
import numpy as np
from scipy.stats import norm

ROOT = Path(__file__).resolve().parent
SEED = 20260927

def logistic_cluster(y, x, clusters):
    beta = np.zeros(x.shape[1])
    for _ in range(100):
        eta = np.clip(x @ beta, -30, 30); mu = 1/(1+np.exp(-eta)); w = np.clip(mu*(1-mu), 1e-9, None)
        h = x.T @ (w[:,None]*x); step = np.linalg.pinv(h) @ (x.T @ (y-mu)); beta += step
        if np.max(np.abs(step)) < 1e-10: break
    eta=np.clip(x@beta,-30,30);mu=1/(1+np.exp(-eta));w=np.clip(mu*(1-mu),1e-9,None);bread=np.linalg.pinv(x.T@(w[:,None]*x))
    meat=np.zeros((x.shape[1],x.shape[1])); unique=np.unique(clusters)
    for group in unique:
        score=x[clusters==group].T@(y[clusters==group]-mu[clusters==group]);meat+=np.outer(score,score)
    n,p=len(y),x.shape[1];g=len(unique);correction=(g/(g-1))*((n-1)/(n-p)) if g>1 and n>p else 1
    cov=bread@meat@bread*correction;se=np.sqrt(np.clip(np.diag(cov),0,None))
    return beta,se

def cluster_bootstrap(rows, iterations=5000):
    rng=np.random.default_rng(SEED); by_type={}
    for row in rows: by_type.setdefault(row['source_type'],{}).setdefault(row['document_id'],[]).append(row['unsupported'])
    draws={k:[] for k in ['overall',*sorted(by_type)]}
    for _ in range(iterations):
        pooled=[]
        for typ,docs in by_type.items():
            keys=list(docs); sample=rng.choice(keys,size=len(keys),replace=True);vals=[v for key in sample for v in docs[key]];draws[typ].append(float(np.mean(vals)));pooled.extend(vals)
        draws['overall'].append(float(np.mean(pooled)))
    return {k:{'estimate':float(np.mean([r['unsupported'] for r in rows if k=='overall' or r['source_type']==k])),'ci95_document_cluster_bootstrap':[float(np.quantile(v,.025)),float(np.quantile(v,.975))],'iterations':iterations,'seed':SEED} for k,v in draws.items()}

ap=argparse.ArgumentParser();ap.add_argument('--decisions',required=True);ap.add_argument('--out',default='ficcs/results/FICCS_CONFIRMATORY_MODEL.json');args=ap.parse_args()
path=Path(args.decisions);raw=path.read_bytes();manifest=json.loads(Path(str(path)+'.manifest.json').read_text());assert manifest['status']=='validated_complete_adjudicated_ficcs_coding';assert manifest['decision_sha256']==hashlib.sha256(raw).hexdigest()
decisions=[json.loads(x) for x in raw.decode().splitlines() if x];claims={x['claim_id']:x for x in (json.loads(line) for line in (ROOT/'ficcs/claim_extractions_v1.jsonl').read_text().splitlines() if line)}
rows=[]
for d in decisions:
    if d['row_type']=='construct' and d['asserted_by_source']:
        c=claims[d['claim_id']];rows.append({'claim_id':d['claim_id'],'document_id':c['source']['document_id'],'source_type':c['source']['source_type'],'unsupported':1 if d['decision']=='unknown' else 0})
assert rows and set(x['source_type'] for x in rows)=={'research','platform','government','journalism'}
types=['research','platform','government','journalism'];y=np.array([r['unsupported'] for r in rows],float);x=np.array([[1,*[1 if r['source_type']==t else 0 for t in types[1:]]] for r in rows],float);clusters=np.array([r['document_id'] for r in rows])
model={'status':'not_estimable','reason':None,'reference_source_type':'research','terms':{}}
try:
    if len(set(y))<2: raise ValueError('outcome has no variation')
    beta,se=logistic_cluster(y,x,clusters);names=['intercept','platform','government','journalism']
    if not np.all(np.isfinite(beta)) or not np.all(np.isfinite(se)) or np.any(se==0): raise ValueError('singular or zero cluster-robust variance')
    model={'status':'estimated','reference_source_type':'research','terms':{n:{'log_odds':float(b),'cluster_robust_se':float(s),'odds_ratio':float(math.exp(np.clip(b,-30,30))),'ci95_odds_ratio':[float(math.exp(np.clip(b-1.96*s,-30,30))),float(math.exp(np.clip(b+1.96*s,-30,30)))],'p_two_sided':float(2*norm.sf(abs(b/s)))} for n,b,s in zip(names,beta,se)}}
except Exception as e: model['reason']=str(e)
report={'status':'confirmatory_model_complete' if model['status']=='estimated' else 'confirmatory_model_fallback_to_stratified_estimates','decisions_sha256':manifest['decision_sha256'],'outcome':'unknown decision among source-asserted construct slots','n_asserted_slots':len(rows),'documents':len(set(r['document_id'] for r in rows)),'cluster_bootstrap':cluster_bootstrap(rows),'binomial_fixed_source_type_clustered_by_document':model,'interpretation_limits':['The outcome is unsupported evidence for an asserted construct, not a detector false-positive rate.','If the model is not estimable, stratified document-clustered intervals are the registered fallback.']}
out=Path(args.out);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
