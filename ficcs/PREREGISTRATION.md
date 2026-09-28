# FICCS preregistration candidate

Version 0.1.0, 2026-09-27. This protocol is not registered until included in an immutable public release. No FICCS claim has been sampled or coded.

## Research contribution

The Foreign Influence Claim Chain Standard tests where public claims outrun their evidence. It decomposes a statement into eight constructs: account or operator origin (`O`), operation attribution (`P`), automation (`A`), coordination (`C`), deception (`D`), observed feed delivery (`E`), recommendation increment (`R`), and audience impact (`I`). The study measures unsupported transitions between constructs and converts the results into a machine-readable reporting standard and model policy language.

## Primary questions

1. Which constructs are asserted in public foreign-influence claims, and which have source-located evidence?
2. Which directed inference jumps most often lack evidence, including `A→O`, `C→P`, `P→A`, `C→D`, `engagement→E`, `E→R`, and `R→I`?
3. Do unsupported-assertion rates differ among research papers, platform reports, government statements, and journalism?
4. Which institutional action is attached to each claim, and how consequential is an unsupported inference for account enforcement, public attribution, regulation, or public understanding?

## Units

The sampling unit is one public source document. The coding unit is one atomic factual claim from that document. An atomic claim has one subject, one time scope, and one asserted construct or directed relationship. Compound sentences are split when they assert multiple constructs. Repeated wording in one document is coded once and linked to every locator. Syndicated journalism and verbatim copies share a `claim_family_id` and are not treated as independent claims.

The primary corpus contains at least 100 atomic claims from at least 60 source documents. No source document contributes more than five primary claims. Descriptive counts may include additional claims, but confirmatory comparisons use the frozen primary corpus.

## Source strata and minimum allocation

The source frame has four strata, each contributing at least 25 primary claims:

1. Peer-reviewed research articles or published proceedings papers.
2. Official platform threat, enforcement, transparency, or influence-operation reports.
3. Public government, legislative, regulatory, intelligence, or law-enforcement statements and reports.
4. Journalism from outlets with a named author or institutional byline and a stable public URL.

Within each stratum, enumerate eligible source documents before selecting claims. Sort the frozen source frame by canonical URL, assign a SHA-256-derived random key using the registered seed string, and traverse in that order. Select the first eligible atomic claim from each document before selecting a second claim from any document. Continue round-robin until the stratum quota is reached. Record all exclusions and exhausted documents.

## Eligibility

Include a public English-language statement that concerns a social-media account, group, campaign, content set, platform intervention, exposure, recommendation, or audience outcome and explicitly asserts or clearly entails at least one of O/P/A/C/D/E/R/I. The source must provide a stable URL, publication date, accountable author or institution, and enough surrounding text to preserve meaning.

Exclude pure hypotheticals, definitions without a case claim, inaccessible text, duplicate syndication, satire, anonymous social posts, and statements whose subject or asserted proposition cannot be resolved. Do not infer a stronger claim from provocative wording when the body text is narrower.

## Evidence capture

For every atomic claim, preserve the exact claim text within copyright limits, a faithful paraphrase, subject, unit, platform, period, source type, publication and retrieval dates, canonical URL, section or paragraph locator, source-page SHA-256 when lawful to retain, and archive status. The quotation field is limited to 25 words from a source unless permission or a compatible license permits more.

List each cited evidence item separately. Record whether the source itself supplies the evidence, cites it, or merely repeats another source. Resolve citations to the earliest inspectable source available. Shared platform archives receive one `evidence_dataset_id` so reuse across documents is visible.

## Construct decisions

Each construct receives one of `supported`, `contradicted`, or `unknown` for the exact subject, unit, and period. Evidence stage is separately coded as `direct`, `proxy`, `platform_disclosure`, `measurement_validation`, or `unknown`. Apply the minimum-evidence rules in `../EXTRACTION_CODEBOOK.md`.

`Unknown` is required when evidence is absent, inaccessible, indirect, or mismatched to the claim unit. Absence from a disclosure list is not counterevidence. A bot score does not establish automation; coordination does not establish deception or foreign control; campaign attribution does not establish that every member account is automated; engagement does not establish feed delivery; observed delivery does not identify a recommendation increment; recommendation exposure does not establish persuasion.

For each asserted construct, coders record the decision, evidence stage, locator, rationale, and confidence (`high`, `moderate`, `low`). Confidence never upgrades an unsupported decision.

## Inference edges and errors

Record every directed relationship asserted or required by the claim. Edge status is `supported_link`, `measured_association`, `proxy_only`, `untested`, or `contradicted_link`.

An unsupported inference jump occurs when a source asserts a target construct or link while the adjudicated evidence decision is `unknown`, `proxy_only`, or `untested`. A contradicted assertion is reported separately. The primary error denominator is asserted construct slots, not all eight possible slots:

`unsupported assertion proportion = unsupported asserted slots / all asserted slots`.

Report document-clustered confidence intervals and raw counts. Do not call this a detector false-positive rate. A conventional false-positive rate is released only for cases with independently verified reference negatives.

## Institutional consequences

Code the action attached to the claim as zero or more of: `none_descriptive`, `account_enforcement`, `content_enforcement`, `public_attribution`, `sanctions_or_diplomacy`, `legislation_or_regulation`, `resource_allocation`, `public_warning`, or `other`. Also code whether the source explicitly recommends the action or the action is documented as already taken. Consequence severity is descriptive (`low`, `moderate`, `high`) under a registered rubric; it is not a causal outcome.

## Independent coding

Two coders independently code every primary claim before seeing the other's decisions. They must disclose conflicts and attest that they did not collaborate. Compute raw agreement and Krippendorff's alpha for asserted constructs, evidence decisions, evidence stage, edge status, and consequence category. Report prevalence and category counts because chance-corrected agreement can be unstable with sparse labels.

Disagreements are adjudicated by a third decision or a documented consensus meeting after independent files are frozen. Preserve both originals, timestamps, adjudication rationale, and all changed fields. Claims without two complete independent records remain provisional and are excluded from confirmatory comparisons.

## Analyses

Primary outputs are construct assertion counts, evidence-decision counts, unsupported assertion proportions, and an eight-by-eight directed matrix of inference jumps. Compare source strata using document-clustered descriptive intervals and a preregistered binomial model with source type as a fixed effect and document as a cluster. If model assumptions fail or cells are sparse, report stratified estimates without significance claims.

Secondary analyses examine evidence stage, platform, publication year, and consequence category. These are explicitly exploratory. No numerical pooling combines different constructs, units, or evidence datasets.

## False-positive stress test

Create evidence bundles that preserve the observed source material while withholding adjudicated labels. Include hard cases involving displayed location, bot scores, open coordination, platform attribution, potential exposure, engagement, and matched-feed differences. Freeze predictions from each evaluated method before revealing labels. Split by operation, evidence dataset, and time block to prevent leakage. Report unsupported assertion rate, contradicted-claim assertion rate, coverage, and per-construct abstention.

## Policy output

The final FICCS policy standard will require public claim makers to disclose: exact claim subject and unit; asserted construct; evidence stage and source; known missing links; attribution authority; temporal scope; uncertainty; correction route; and proposed institutional action. Machine-readable records must retain `unknown` and prohibit automatic promotion from one construct to another.

## Prior knowledge and prospective boundary

The Foreign Influence Evidence Observatory, its provisional graph, ten benchmark cases, and supplemental literature update are known before FICCS registration. They may be used to design the schema and stress tests but cannot supply confirmatory frequency estimates. The primary claim corpus must be selected after registration using the frozen source-frame process. Any pilot claims used to test tools are labeled `development_only` and excluded by ID before sampling.

## Release gates

No confirmatory FICCS result is released until all of the following hold:

- immutable registration packet and digest published before source-frame freezing;
- at least 100 eligible primary claims and all four stratum minima met;
- every primary claim independently coded twice;
- adjudication trail complete and immutable originals preserved;
- source rights and quotation-length audit passed;
- duplicate documents, claim families, and evidence datasets reconciled;
- stress-test predictions frozen before label reveal;
- policy language traceable to observed failure modes;
- spending ledger remains at or below $20.

## Ethics and safety

Use already-public institutional claims and research sources. Do not publish new accusations about individual accounts from proxy evidence. Minimize personal identifiers, preserve source wording, and separate documentation of an institution's attribution from independent verification. Corrections must be versioned without erasing earlier decisions.

## Cost

External spending cap is $20 across the study. Use public sources, free metadata, and local processing by default. Record every expense in `../BUDGET_LEDGER.csv`; stop acquisition before exceeding the cap.
