# Foreign Influence Evidence Observatory: preregistration text

Status: prepared for OSF Open-Ended registration; **not submitted or registered**. Prepared 2026-09-20 UTC. This text is the proposed registration response and must be checked against the attached protocol files immediately before submission.

## Title and purpose

**Foreign Influence Evidence Observatory: a cross-platform evidence map and claim-boundary benchmark**

This study will map which claims about foreign influence on social media are directly evidenced, inferred from proxies, or untested. It will separate eight constructs: verified account/operator origin (O), operation/campaign attribution (P), automation (A), coordinated behavior (C), deception or concealed organizational control (D), observed feed delivery (E), feed-selection increment relative to an explicit baseline (R), and audience impact (I). It will not assume that a country displayed by a platform verifies an operator's location, that a bot score verifies automation, that coordination proves deception, or that engagement proves feed exposure. A record reconstructed from follow lists is potential exposure rather than observed delivery. Causal claims receive a separate design grade.

## Research questions and estimands

1. Among eligible independent datasets, how many directly measure each construct O/P/A/C/D/E/R/I, and with what label provenance and risk of bias?
2. Which proposed links among attribution, behavior, feed delivery, ranking, and audience outcomes have a causal test, a measured association, a proxy only, or no test?
3. How often do methods promote a weak signal into an unsupported stronger claim when evaluated on source-backed evidence bundles with an explicit `unknown` label?
4. Where independent, comparable estimates exist, what is the distribution of effect sizes for the same construct and denominator? Numerical pooling is conditional on at least three independent datasets with compatible outcome, comparison, denominator, and recoverable uncertainty.

The primary output is a cross-platform evidence map by independent dataset, platform, construct, and design grade. The secondary outputs are a non-pooled structured synthesis, a claim-boundary benchmark, and a low-cost replication protocol. This is a descriptive and measurement-validity review; it has no directional effect hypothesis.

## Scope and acquisition

The review covers empirical social-platform studies, reproducible public datasets, and platform enforcement disclosures with inspectable corpus or sampling details. Platforms include X/Twitter, Facebook, Instagram, Reddit, YouTube, TikTok, and other social platforms found by the search. Search all publication years through the UTC date of the final registered search. The exhaustive scholarly index is OpenAlex core works, using the five exact Boolean queries and cursor-pagination procedure in `SEARCH_PROTOCOL.md`. Crossref verifies DOI metadata; Google Scholar supplies a logged ranked supplement with a 100-result cutoff per query; platform archives, linked data/code, and one-pass backward/forward citation chasing supplement the index. The attached search protocol fixes query strings, source roles, deduplication, screening rules, and audit fields. `EXTRACTION_CODEBOOK.md` fixes construct thresholds, edge grades, bias domains, and reviewer rules.

The unit of synthesis is an independent source dataset or collection, not each paper. Normalize DOI, deduplicate OpenAlex IDs, then manually merge publication records sharing participants, campaigns, or platform experiments. Keep all source publications and a merge log. Ambiguous titles advance. Full-text inclusion requires a defined sampling frame or disclosed platform corpus, a relevant measured construct, and sufficient method detail to classify it. Record one primary exclusion reason for each full-text exclusion.

Two reviewers independently screen a deterministic random 20% calibration sample stratified by primary query family and all disputed records. Full-text inclusion and eight-construct labels require two independent coders for every admitted dataset. Preserve individual decisions and adjudications. The map remains provisional until these gates are met.

## Extraction and synthesis

Extract platform, period, geography, sampling, unit, dataset ID, operational measure, denominator, missingness, label provenance, known positives/verified negatives/unknowns, effect measure and uncertainty, data and code availability, conflicts, and source locator. Assess bias separately for selection, construct validity, label provenance, missing data, and selective reporting. For proposed links, code `causal_test`, `measured_association`, `proxy_only`, or `untested`, with design and counterfactual. Report source-level and independent-dataset counts separately; do not infer that absence of a disclosure is a verified negative.

Pool an effect only if at least three independent datasets share a construct, comparison, denominator, and recoverable uncertainty. Any model, weighting, heterogeneity statistic, and exclusion sensitivity will be registered before fitting. Otherwise report source estimates separately under SWiM. Report search flow under PRISMA 2020 and document deviations with date and reason.

## Benchmark

The benchmark unit is a source-linked claim-evidence bundle, not an accusation against a person. For each of O/P/A/C/D/E/R/I, label `supported`, `contradicted`, or `unknown`; record exact evidence, source locator/hash where obtainable, unit, campaign/dataset split, and adjudication. The claim-boundary score is the fraction of asserted claims unsupported by the bundle, with coverage reported alongside. Count claims that contradict a source-backed group finding separately from assertions over unknown labels. A population false-positive rate will be reported only if an independently verified negative corpus is acquired; topical controls and undisclosed accounts are not negatives. The nine known pilot cases in `BENCHMARK_SPEC.md` and `benchmark_cases.json` are pre-registration examples and may be used for software checks, not an unseen confirmatory test. Future evaluation cases must be split by campaign/dataset and time, never by row.

## Prior knowledge and temporal boundary

Before registration, the team inspected a 600-event selected visible-repost origin pilot, public matched-feed analyses from 2023 and 2024, platform archives, several published studies, and exploratory Crossref/OpenAlex searches. The pilot's displayed country is a platform signal, not verified origin or a bot label; most original screenshots were not locally auditable at its freeze. The matched-feed data do not identify the same accounts as the repost pilot. Exploratory OpenAlex collection through 2026-09-19/20 is incomplete due to a keyless API limit and has no final screening decisions. These materials inform the protocol and are disclosed as prior knowledge; they are not confirmatory results of this registration. After registration, rerun the fixed search, screen the full eligible corpus, and archive all deviations.

## Open data, ethics, and cost

Publish query URLs and page hashes, screening decisions with safe source metadata, extraction cards, deduplication trail, analysis code, benchmark cards and evaluator, and aggregate map. Do not republish restricted articles or account identifiers where rights or privacy do not permit it. Do not present weak account-level evidence as a foreign-operation accusation. Actual external spend is $0 at packet preparation. Total external spend is capped at $20; no paid API is required. Stop before any acquisition that exceeds the cap and document unavailable sources. The attached `LOW_COST_REPLICATION_PROTOCOL.md` specifies a separate future validation sample for the displayed-country signal; it does not claim that replication data have been collected.

## Attached files

`PREREGISTRATION_DRAFT.md`, `SEARCH_PROTOCOL.md`, `EXTRACTION_CODEBOOK.md`, `BENCHMARK_SPEC.md`, `LOW_COST_REPLICATION_PROTOCOL.md`, `benchmark_cases.json`, `score_claims.ts`, `search_openalex_registered.ts`, `prepare_registered_queue.ts`, `audit_screening.ts`, and byte-identical copies of three local source reports under `sources/local_reports/`. The registration packet manifest records exact SHA-256 digests. The existing search and benchmark pilot cases are identified as prior knowledge and are not attached as confirmatory results.
