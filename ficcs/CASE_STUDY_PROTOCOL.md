# FICCS case-study audit protocol

Version 1.0.0, 2026-09-27. Case boundaries are frozen before independent evidence coding. These cases are demonstrations of claim-chain auditing, not frequency estimates and not new attribution findings.

## Cases

1. Internet Research Agency activity on Twitter, covering attribution, reconstructed potential exposure, and reported audience outcomes.
2. Doppelgänger, covering attributed operators, impersonating domains, deception, and government or journalistic claims about the campaign.
3. Spamouflage, covering platform attribution and cross-platform coordinated influence claims.

The exact primary-corpus claim IDs are in `case_study_frame_v1.json`. No claim may be added because its eventual label is favorable or dramatic. Additional sources may be used only to resolve evidence provenance, must be logged, and cannot change the frozen primary-claim denominator.

## Audit method

For each case:

1. Preserve every included claim's exact subject, unit, period, wording, locator, URL, and source type.
2. Use the two frozen independent coding files. Exclude provisional or singly coded claims from the demonstrated evidence chain.
3. Display all eight construct decisions and every asserted or required directed edge. Preserve `unknown`.
4. Distinguish an institution's attribution from independent verification and identify the attribution authority and scope.
5. Trace cited evidence to the earliest inspectable source and identify reuse of one underlying dataset across documents.
6. Record attached institutional actions and whether each was recommended or documented as taken.
7. List unsupported inference jumps only from adjudicated decisions. Do not extrapolate the case result to accounts, platforms, operations, or periods outside the evidence unit.
8. Publish the two original coding hashes, adjudicated record hash, source hashes where lawful, correction history, and a reproducible build command.

## Required outputs

Each audit will contain a human-readable report, machine-readable claim-chain JSON, evidence-source table, decision-difference table, and conformance report against `policy-disclosure.schema.json`. Reports remain `pending_independent_coding` until both reviewer files and adjudication are complete.

After adjudication, run `build_ficcs_case_audits.ts --decisions=<adjudicated.jsonl>`. The builder refuses unvalidated inputs, requires all 16 decision rows per claim, embeds the final decision hash, and emits one report and one complete decision-trail JSON file per frozen case.

## Cross-case synthesis

After all three audits pass, compare which constructs and links are supported, unknown, proxy-only, or contradicted. The synthesis may describe recurring mechanisms but may not calculate confirmatory corpus frequencies from these purposively selected cases.
