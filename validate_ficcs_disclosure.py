#!/usr/bin/env python3
import argparse, json
from pathlib import Path
from referencing import Registry, Resource
from jsonschema import Draft202012Validator

root = Path(__file__).resolve().parent
label = json.loads((root/'ficcs/evidence-label.schema.json').read_text())
policy = json.loads((root/'ficcs/policy-disclosure.schema.json').read_text())
registry = Registry().with_resource(label['$id'], Resource.from_contents(label))
registry = registry.with_resource((root/'ficcs/evidence-label.schema.json').as_uri(), Resource.from_contents(label))

ap = argparse.ArgumentParser(description='Validate one FICCS public claim disclosure')
ap.add_argument('record')
args = ap.parse_args()
record = json.loads(Path(args.record).read_text())
errors = sorted(Draft202012Validator(policy, registry=registry).iter_errors(record), key=lambda e: list(e.path))
if errors:
  for error in errors: print(f"schema:{'/'.join(map(str,error.path))}: {error.message}")
  raise SystemExit(1)
asserted = record['claim']['asserted_constructs']
labels = [item['construct'] for item in record['labels']]
if len(labels) != len(set(labels)):
  print('semantic: duplicate construct labels'); raise SystemExit(1)
if set(labels) != set(asserted):
  print('semantic: labels must match asserted_constructs exactly'); raise SystemExit(1)
print(json.dumps({'status':'passed','record_id':record['record_id'],'asserted_constructs':len(asserted),'automatic_promotion_prohibited':True},indent=2))
