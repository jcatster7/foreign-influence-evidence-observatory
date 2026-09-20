# Foreign Influence Evidence Observatory — preregistration draft

Version 0.1, 2026-09-19. **Draft for registration; not registered or published.**

## Research question

Across public social-media research, which links in the proposed chain from account origin to automation, coordination, recommendation exposure, and audience effect have been directly measured? How often do studies infer a downstream link from an upstream proxy?

## Scope and unit

The review covers empirical studies, platform disclosures with inspectable data, and reproducible public datasets concerning X/Twitter, Facebook, Instagram, Reddit, YouTube, TikTok, and other social platforms. The unit of synthesis is an **independent source dataset or collection**, not a paper or local analysis. Multiple analyses of the same participants or platform archive share one dataset ID. No estimates from overlapping samples will be counted as independent.

## Construct ontology

Code eight outcomes separately: (O) verified account/operator origin; (P) operation or campaign attribution; (A) automation; (C) coordinated behavior; (D) deception or concealed organizational control; (E) observed audience exposure; (R) measured feed-selection increment relative to an explicit ranking/feed baseline; (I) audience impact. For each, record `supported`, `contradicted`, or `unknown`, the exact operational measure, and the evidence source. A platform-displayed location is an O *signal*, not verified O. A platform attribution of a campaign can support P without verifying the origin or operator of each account in it. Cross-posting or simultaneity is a C *signal*, not proof of D. Engagement is not E without a feed or eligible-content denominator. E requires a record that content was delivered in an observed feed; it does not prove the user noticed it. Posts reconstructed from follow lists are potential exposure, not observed feed delivery or viewing. E alone does not identify R; a comparison against a valid feed or ranking baseline is needed. Code causal identification separately at the edge level; an observed difference alone does not prove why ranking changed the feed. No single proxy may be promoted to a downstream claim.

## Eligibility and search

The exact query strings, source roles, paging, citation chasing, deduplication, screening decisions, reviewer assignment, and audit fields are specified in `SEARCH_PROTOCOL.md`. OpenAlex is exhaustively cursor-paged through the final search date; Crossref verifies DOI metadata, and Google Scholar is a ranked supplemental source with an explicit cutoff. Record exact query, search date, result count, deduplication decision, and full-text exclusion reason. Two reviewers independently screen a 20% calibration sample and all disputed records; final full-text inclusion and eight-construct labels require two independent coders.

Include a source when it has a defined sampling frame or disclosed platform enforcement corpus and reports at least one of O/P/A/C/D/E/R/I with enough method detail to classify its measure. Exclude commentary without empirical observations, datasets with no provenance, and duplicated analyses as separate samples. Keep excluded studies in a disposition log.

## Extraction and synthesis

Extract platform, period, geography, sampling/selection, unit, dataset ID, positive/negative/unknown labels, validation source, denominator, missingness, effect measure, uncertainty, code/data availability, and conflicts of interest using the fixed definitions in `EXTRACTION_CODEBOOK.md`. Judge risk of bias separately for sampling, construct validity, label provenance, missing data, and selective reporting. Label each proposed edge `causal_test`, `measured_association`, `proxy_only`, or `untested`, and record the underlying design and counterfactual. A measured association is not coded as a causal effect. Record C and D independently because ordinary media organizations and activists can coordinate openly.

Primary deliverable: a cross-platform evidence map showing study counts and evidence quality at each node and edge. Secondary deliverable: a structured synthesis of compatible effect estimates. Numerical pooling requires at least three independent datasets with the same construct, comparison, denominator, and recoverable uncertainty; otherwise report estimates separately. Any later meta-analysis model and exclusion sensitivity will be registered before fitting it. Report search and screening with PRISMA 2020 and non-pooled synthesis with SWiM.

## Benchmark and false-positive analysis

Benchmark evidence bundles rather than people. Positive labels require an attributable public platform or archival disclosure with traceable records; absence from a takedown archive is **not** a negative label. `unknown` is a first-class label. The benchmark must include hard abstention cases (for example, displayed non-US country alone, synchronized behavior alone, or a feed shift alone). Report the rate at which a method incorrectly upgrades those cases to a stronger claim. A conventional false-positive rate requires independently verified negatives; report it only if such a set is acquired with a defensible provenance rule.

Split by campaign/dataset and collection period, never by row, to avoid leakage. Publish the evidence and decision trail, excluding sensitive personal data and platform-restricted content. Do not publish account-level accusations from weak or unknown labels.

## Existing local evidence and temporal boundary

The 600-event origin pilot, the 2023/2024 matched-feed analyses, and exploratory Crossref/OpenAlex searches run on 2026-09-19 are known before registration. They are pre-existing scoping evidence, not confirmatory tests of this preregistration. After registration, rerun the frozen searches across the full indexed result sets and apply the frozen eligibility rules. New hypotheses, screening rules, and benchmark thresholds must be frozen before evaluating newly acquired candidate datasets. Document deviations with date and rationale; never silently retrofit the plan to results.

## Cost and stopping rule

External spending cap: **$20 total**, recorded with date, vendor, purpose, and receipt. Default plan uses free public releases and local tools, costing $0. No paid API access is a prerequisite. Stop any acquisition before the cap would be exceeded. If a critical source needs paid access beyond the cap, mark it unavailable and report the resulting limitation.

## Registration and archive plan

Submit this protocol through the OSF **Registration** workflow after screening fields and extraction code are finalized. Keep active data/code in a versioned repository, because OSF Projects are being phased out while Registrations continue. Registration status must be recorded with its permanent URL and timestamp before calling this work preregistered.

## Primary guidance and source leads

- PRISMA 2020: https://www.prisma-statement.org/prisma-2020
- SWiM: https://www.bmj.com/content/368/bmj.l6890
- OSF transition: https://help.osf.io/article/759-details-of-osf-projects-transition
- X information-operations archive description: https://blog.x.com/en_us/topics/company/2019/information-ops-on-twitter
- Meta threat indicator repository: https://github.com/facebook/threat-research
- Public matched-feed replication: https://doi.org/10.6084/m9.figshare.28033772.v1
