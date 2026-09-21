# Foreign Influence Evidence Observatory: current synthesis

Status: provisional synthesis, updated 2026-09-21 UTC. This document aggregates the project's audited scoping evidence and registered workflow. It is not a completed systematic review, a foreign-account list, or a causal estimate. All 8,587 registered title-and-abstract records remain unscreened, independent benchmark adjudication is pending, and the replication sample is not frozen.

## What the project can currently establish

The inspected evidence does not support a single category called “foreign bots.” It supports separate, source-specific judgments about eight constructs:

| Code | Construct | Strongest inspected evidence | Current boundary |
| --- | --- | --- | --- |
| O | Account or operator origin | Operator interviews and subset validation in the Venezuela study; public country display in the local X pilot is only a proxy | Platform labels and displayed country do not independently verify nationality, residence, or operator location |
| P | Operation attribution | Platform-disclosed campaign lists and archives; participant reports for a limited subset | Campaign attribution does not automatically validate every account or operator |
| A | Automation | Historical Botometer validation and manually reviewed flagged cases | Scores and campaign membership do not prove automation; no current population false-positive rate is available |
| C | Coordination | Link-sharing, interaction, timing, and content-pattern studies | Similar patterns can appear among legitimate publishers; coordination alone does not establish deception or state control |
| D | Deception | Platform coordinated-inauthentic-behavior reports and operation-specific qualitative evidence | Enforcement labels and suspicious-account lists preserve the platform's stated confidence and unit |
| E | Observed feed delivery | Historical matched-feed captures and randomized feed experiments for political-source groups | Potential exposure reconstructed from follows is not direct observation of what a person saw |
| R | Recommendation increment | Ranked-versus-baseline feed comparisons and a platform holdback experiment | The inspected ranking studies do not label the same accounts as foreign operations |
| I | Audience impact | Longitudinal survey studies linked to attributed-operation interactions or potential exposure | Small exposed groups, observational assignment, and unobserved viewing prevent broad causal claims |

The key empirical gap is linkage. The inspected sources contain attributed operations without observed recommendation delivery, ranking studies without foreign-operation labels, and audience studies without a ranking counterfactual. No inspected dataset jointly verifies individual foreign origin, automation, covert coordination, recommendation increment, and audience impact for the same accounts.

## Cross-platform evidence now indexed

- **X:** a historical information-operations archive, campaign-attribution studies, automation validation, audience-contact studies, a randomized ranking study, two public matched-feed datasets, and the local displayed-country pilot. Dataset overlap is material: papers can reuse the same platform-attributed account archive.
- **Meta/Facebook:** coordinated-inauthentic-behavior reports and a public threat-indicator repository provide campaign-level attribution and coordination/deception provenance. Meta explicitly limits indicator-level inference; ordinary users sharing a listed domain do not become attributed campaign accounts.
- **Reddit:** the 2018 suspected-IRA account disclosure and later Secondary Infektion disclosures use distinct units and may overlap across updates. Suspicion, bans, karma, and removals do not measure recommendation delivery or impact.
- **TikTok:** covert-influence disruption reports provide network-level platform attribution. Duet, Stitch, and reply patterns can be organic, and enforcement totals do not measure recommendation effects.
- **YouTube/Google:** Threat Analysis Group bulletins document linked campaigns and terminated-channel counts. They do not provide audience feed traces or persuasion estimates. A separate YouTube narrative study measures engagement rather than recommender behavior.

These are source families and candidate datasets, not final included-study counts. The [platform source register](PLATFORM_SOURCE_REGISTER.md) preserves attribution wording, units, access limits, and intake decisions.

## Provisional source-level synthesis

The current [source extractions](SOURCE_EXTRACTIONS.md) identify 15 inspected dataset or study records. The immutable seed map contains 18 records and 13 claim-transition edges. The generated [claim-evidence graph](CLAIM_EVIDENCE_GRAPH_PROVISIONAL.json) combines those tables, preserves each source and limitation, verifies controlled evidence states, and records the input hashes. These totals are scoping artifacts and cannot be used as a PRISMA count.

Three recurring patterns matter:

1. **Attribution is usually campaign-level.** X, Meta, Reddit, TikTok, and Google disclosures can support a platform-attributed operation claim when their exact wording and corpus are preserved. They rarely verify each operator's origin or automation independently.
2. **Detection validity depends on the negative labels.** Historical politician accounts, time/topic comparison accounts, suspended accounts, and unlabelled accounts are not interchangeable verified-human negatives. A defensible false-positive meta-analysis needs compatible thresholds and independently verified negative denominators.
3. **Exposure, recommendation, and impact are different estimands.** Following an attributed account, potentially receiving its posts, observing a post in a captured feed, estimating a ranking increment, interacting with content, and changing an attitude are different events. They cannot be substituted for one another.

## Benchmark status

The provisional benchmark has 10 prior-known cases and 80 claim slots: 8 `supported`, 1 `contradicted`, and 71 `unknown`. All source hashes and rights reviews are complete. The cases test whether a system abstains when evidence does not support a claim and whether it avoids a specific contradicted universal automation assertion.

These cases are software checks, not an unseen evaluation set. A population false-positive rate is unavailable because the benchmark has no verified account-level negative denominator. Final release requires independent adjudication, a qualifying held-out campaign/period pool, frozen predictions before label reveal, and unseen scoring. The [benchmark card](BENCHMARK_CARD_PROVISIONAL.json) and [audit](BENCHMARK_AUDIT_PROVISIONAL.json) enforce these limits.

## Low-cost replication status

The displayed-country replication protocol and deterministic sampling amendment are public immutable releases. An authenticated X preflight showed that a country field can be present, a loaded About panel can omit it, direct repost lists are visible, and screenshot capture works. Field absence is therefore `unresolved`, never United States.

The acquisition checkpoint covers 14 of 20 registered targets and 4,318 in-window posts seen. It is deliberately not a sample: complete post arrays were not exported, six target checks remain, one high-volume timeline stopped before the window start, no target About panel has been inspected, and zero origin observations exist. The audit requires all of those values to remain false or zero until the registered gates are satisfied.

## Recommended meta-study program

1. **Primary study: evidence-chain validity map.** Complete two-reviewer screening and dataset-level coding, then report which of O/P/A/C/D/E/R/I each independent dataset actually measures. Publish the missing edges as results. This design remains informative even when no numerical pool qualifies.
2. **Conditional numerical study: detector false positives.** Pool only after at least three independent datasets provide verified negatives, compatible detector versions and thresholds, and recoverable counts and denominators. Stratify by platform, language, period, and label provenance.
3. **Structured synthesis: attributed-operation audience outcomes.** Keep randomized exposure, observed interaction, potential exposure, and observational contact separate. Pool only when exposure definitions, outcomes, populations, periods, and uncertainty are compatible.
4. **Gap study: attribution-to-recommendation linkage.** Test whether common campaign identifiers can connect platform attribution to feed observations and an eligible-content baseline. A documented absence of the required link is a valid result.

The [meta-study decision memo](META_STUDY_OPTIONS.md) contains the quantitative gates and source-specific feasibility notes.

## Registered state and remaining work

- Registered OpenAlex acquisition: 9,430 rows across 96 archived response pages.
- Deduplicated screening queue: 8,587 records, all unscreened.
- Independent calibration sample: 1,719 records.
- Immutable registration releases verified: five.
- External spending: **$0 of the $20 cap**.

Completion still requires independent title-and-abstract review, two-coder full-text and construct coding, dataset deduplication and risk-of-bias assessment, independent benchmark adjudication and held-out evaluation, and a complete replication inventory plus archived observations and independent coding. The machine-readable [observatory status](OBSERVATORY_STATUS.json) is the authoritative completion summary.
