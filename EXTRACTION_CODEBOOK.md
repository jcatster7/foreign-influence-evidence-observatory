# Dataset extraction and claim codebook

Version 0.1, 2026-09-20. Registration candidate; no final study has been adjudicated under this codebook.

## Unit and provenance

One extraction card represents one independent source dataset or collection. Keep separate publication records linked by DOI and a merge log. A platform archive reused by multiple analyses retains one attribution-corpus ID; survey or feed data collected independently receive a linked but distinct dataset ID. Record the exact source URL or DOI, retrieval UTC time, section/table locator, public archive version, and SHA-256 for locally held source files. Do not redistribute copyrighted article text or private account/participant identifiers.

Required fields: `dataset_id`, `publication_ids`, `platforms`, `collection_start`, `collection_end`, `geography`, `design`, `sampling_frame`, `unit`, `sample_size_by_unit`, `source_urls`, `data_access`, `code_access`, `label_source`, `missingness`, `denominators`, `effects`, `uncertainty`, `bias_domains`, `constructs`, `edges`, `reviewers`, `adjudication`, and `notes`. Use `unknown` or `not_applicable` with a reason; never encode missing values as zero.

## Construct labels

For each construct, code `supported`, `contradicted`, or `unknown` **for the exact claim subject and unit stated on the card**. `Supported` requires direct evidence meeting the rule below. `Contradicted` requires direct counterevidence for a specific positive claim, such as a universal group assertion disproved by verified exceptions; it is not a generic label for every unlisted account. `Unknown` covers absent, weak, or ambiguous evidence. Also record the operational measure, evidence stage (`direct`, `proxy`, `platform_disclosure`, `measurement_validation`, `unknown`), denominator, source locator, and reviewer rationale.

| Code | Construct | Minimum direct evidence | Insufficient alone |
| --- | --- | --- | --- |
| O | Account/operator origin | Independently documented operator location, identity, or platform forensic attribution specifically resolved at the account/operator level | Displayed country, language, time zone, profile text, or inclusion in a campaign list without account-level basis |
| P | Operation/campaign attribution | Named operation linked to an attributable platform enforcement disclosure or traceable archival/government investigation, with the source's wording preserved | Similarity to an operation, a suspicious-account list without explicit attribution, or an analyst's inference from one proxy |
| A | Automation | Validated automated posting/control behavior for the case and period, including human review or documented software control | Detector score, rapid posting, scheduling, or campaign attribution alone |
| C | Coordination | Repeated, jointly patterned behavior with a documented method and comparison/threshold sufficient to support behavioral coordination | One synchronized event or a platform-native interaction type alone |
| D | Deception | Verified false persona, concealed organizational control, or other specified deceptive presentation | Coordination, anonymity, or unpopular speech alone |
| E | Observed feed delivery | Record that content was delivered in an observed user's feed with a defined audience/time/content denominator | Follow lists plus all posts by followed accounts (potential exposure), impressions without the needed unit/denominator, or engagement alone |
| R | Feed-selection increment | Matched feed/ranking comparison with explicit eligible or chronological/followed baseline, same outcome and denominator, and recoverable contrast | E alone, engagement, retweet cascades, or a source-share change with no baseline; causal interpretation requires separate edge grade |
| I | Audience impact | Observed audience outcome with a stated exposure/outcome design and uncertainty; label the exact associational or causal claim | Reach, engagement, inferred intent, or a null p-value interpreted as proof of no effect |

`E` does not prove a user noticed or read a post. `R` can be supported by a defensible matched comparison while the edge remains `measured_association`; only randomized or otherwise credible causal designs receive `causal_test`. When a study reports potential exposure, preserve that measure in the extraction card and leave direct E `unknown`. A platform disclosure can support P without settling O, A, C, D, E, R, or I for every included account.

## Edge and design grades

Record each proposed link as `from_construct`, `to_construct`, `classification`, `design`, `counterfactual`, `effect_direction`, `effect_size`, `uncertainty`, `source_locator`, and `limitation`.

- `causal_test`: intervention or defensible natural experiment with an explicit counterfactual and identification assumptions.
- `measured_association`: both endpoints measured in related units/periods, but no credible causal identification.
- `proxy_only`: an endpoint or link is inferred from a weaker signal or reconstructed eligibility rather than directly observed delivery/outcome.
- `untested`: the source does not measure the proposed link.

A non-significant association stays `measured_association` if both variables were measured. It does not become `contradicted` for causal impact without an equivalence margin and appropriate design. Do not combine estimates across different participants, platforms, periods, units, or denominators as though independent.

## Bias assessment

For each domain, choose `low`, `some_concerns`, `high`, or `unclear`, with a source locator and one-sentence reason:

1. Selection and sampling: target/account/user inclusion, platform coverage, and population inference.
2. Construct validity: whether the measure actually identifies the stated construct.
3. Label provenance: independent verification, platform wording, and comparison-label quality.
4. Missing data: unavailable posts, accounts, panels, feeds, or screenshots and plausible direction of bias.
5. Selective reporting: preregistration, full outcome reporting, and accessible analysis trail.

`Unclear` means the source lacks enough information; do not treat it as low risk. An aggregate grade may be displayed for navigation but must not replace the five domain judgments.

## Reviewer and release rules

Two coders independently fill every included dataset card before seeing each other's coding. Keep both originals and an adjudicated card with disagreement rationale. The source dataset cannot enter the final evidence map until required fields, source locators, independence check, and bias domains pass review. A study with restricted data may be mapped with a clear `data_access` limitation if its methods and claims can be inspected; restricted controls cannot become verified negatives. Public release removes private identifiers and checks license terms before distributing source-derived content.
