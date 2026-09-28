#!/usr/bin/env python3
import json
from pathlib import Path
from referencing import Registry, Resource
from jsonschema import Draft202012Validator

root = Path(__file__).resolve().parent
label_path = root / 'ficcs/evidence-label.schema.json'
policy_path = root / 'ficcs/policy-disclosure.schema.json'
label = json.loads(label_path.read_text())
policy = json.loads(policy_path.read_text())
Draft202012Validator.check_schema(label)
Draft202012Validator.check_schema(policy)
registry = Registry().with_resource(label['$id'], Resource.from_contents(label)).with_resource('https://jcatster7.github.io/foreign-influence-evidence-observatory/schemas/evidence-label.schema.json', Resource.from_contents(label))
registry = registry.with_resource((policy_path.parent / 'evidence-label.schema.json').as_uri(), Resource.from_contents(label))

record = {
  'ficcs_version':'1.0.0-candidate','record_id':'conformance-test-only','issuer':'Schema test issuer','published_at_utc':'2026-09-27T00:00:00Z',
  'claim':{'text':'Non-empirical schema conformance test','subject':'test subject','unit':'other','platforms':['test platform'],'period':'test period','asserted_constructs':['O']},
  'labels':[{'construct':'O','asserted':True,'decision':'unknown','evidence_stage':'unknown','evidence_sources':[],'locator':None,'rationale':'No empirical evidence is attached to this schema-only test.','confidence':'low','missing_links':[]}],
  'attribution_authority':{'name':'Schema test issuer','authority_type':'other','scope':'non-empirical validation only'},
  'uncertainty_statement':'This is not an empirical claim.','correction_route':{'url':'https://example.invalid/correction','contact':'schema-test','version_history_url':'https://example.invalid/history'},
  'institutional_action':{'categories':['none_descriptive'],'basis':'none_descriptive','severity':'low'},'automatic_promotion_prohibited':True
}
validator = Draft202012Validator(policy, registry=registry)
errors = list(validator.iter_errors(record))
assert not errors, '\n'.join(e.message for e in errors)
bad = dict(record); bad['automatic_promotion_prohibited'] = False
assert list(validator.iter_errors(bad)), 'schema accepted automatic promotion'
unsupported_label = dict(record['labels'][0])
unsupported_label.update({'decision':'supported','evidence_stage':'direct','confidence':'high'})
unsupported_record = dict(record); unsupported_record['labels'] = [unsupported_label]
assert list(validator.iter_errors(unsupported_record)), 'schema accepted supported label without evidence source and locator'
codes = set('OPACDERI')
assert set(label['properties']['construct']['enum']) == codes
text = (root/'ficcs/POLICY_STANDARD.md').read_text()
for code in codes: assert f'| {code} |' in text
for phrase in ('MUST NOT', '`unknown`', 'correction route', 'automatic_promotion_prohibited'):
  assert phrase in text
print(json.dumps({'status':'passed','schemas':2,'constructs':8,'valid_record_accepted':True,'automatic_promotion_rejected':True,'unsupported_without_source_rejected':True,'empirical_findings_generated':False},indent=2))
