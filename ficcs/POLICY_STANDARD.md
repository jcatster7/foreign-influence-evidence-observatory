# Foreign Influence Claim Chain Standard

Candidate version 1.0.0, 2026-09-27. This is prospective policy language. Empirical thresholds and failure-mode frequencies remain pending independent coding and adjudication.

## Purpose

FICCS governs public claims that social-media accounts, groups, campaigns, content, feeds, or effects are foreign, coordinated, automated, deceptive, exposed, recommended, or influential. It makes each proposition inspectable and prevents one observation from silently standing in for another.

## Required constructs

| Code | Proposition |
| --- | --- |
| O | Account or operator origin |
| P | Operation or campaign attribution |
| A | Automation |
| C | Coordination |
| D | Deception |
| E | Observed feed delivery |
| R | Feed-selection increment against an explicit baseline |
| I | Audience impact |

## Normative requirements

1. A publisher **MUST** identify the exact subject, unit, platform, and period of every claim.
2. A publisher **MUST** name every asserted construct and provide one evidence label per asserted construct.
3. Each label **MUST** state the decision, evidence stage, rationale, confidence, and known missing links. Every `supported` or `contradicted` label **MUST** also state an inspectable source, source relationship, and locator.
4. `unknown` **MUST** remain available. Missing, inaccessible, indirect, or unit-mismatched evidence **MUST NOT** be encoded as contradicted.
5. A publisher **MUST NOT** automatically promote displayed location to O, campaign attribution to account-level O or A, automation to O, coordination to P or D, engagement to E, E to R, or R to I.
6. Platform disclosure **MUST** be identified as platform disclosure. The record **MUST** state the authority's scope and exact unit of attribution.
7. A bot score, posting rate, language, time zone, profile statement, interaction type, or enforcement-list membership **MUST** be labeled as a proxy unless case-specific validation meets the direct-evidence rule.
8. Every public claim **MUST** include a plain-language uncertainty statement and an accessible correction route with retained version history.
9. Any attached enforcement, attribution, diplomatic, regulatory, funding, or warning action **MUST** be categorized and described as recommended, documented as taken, both, or unclear.
10. Machine-readable publication **MUST** conform to `policy-disclosure.schema.json`, retain explicit unknowns, and set `automatic_promotion_prohibited` to `true`.

## Conformance

- **Disclosure conformant:** all required fields validate and all asserted constructs have labels.
- **Evidence conformant:** disclosure conformant, every supported or contradicted decision has an inspectable source and locator, and unit and period match the claim.
- **Audit conformant:** evidence conformant, independent coding originals and adjudication history are preserved, and every correction is append-only.

Schema validation establishes structural conformance only. It does not verify that evidence is true, sufficient, independent, or correctly interpreted.

Run `python3 validate_ficcs_disclosure.py <record.json>` from the repository root. The validator also requires exactly one label for each asserted construct and rejects extra, duplicate, or missing construct labels.

## Governance

The candidate standard is versioned. Changes to construct definitions, minimum-evidence rules, or promotion prohibitions require a public change log and migration note. Empirical revisions based on the preregistered corpus will cite adjudicated failure modes rather than provisional frequencies.
