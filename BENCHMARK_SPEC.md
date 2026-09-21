# Evidence-chain benchmark specification

Version 0.1, 2026-09-19. This is a benchmark design, not a scored benchmark release.

## Record schema

One JSON Lines record is one claim-evidence bundle. A bundle can concern an account, a group, or an aggregate claim; its unit must be explicit. The ten provisional JSON cases now state their unit, exact claim subject, platform, period, single-reviewer label basis, and dataset/time split group. Independent adjudication remains pending, and the cases remain smaller than the planned release schema. A hash of an HTTP response documents the observed bytes; it does not preserve or license the full article. Every provisional case now has a source hash; external source bytes are not redistributed.

- `case_id`, `dataset_id`, `unit`, `claim_subject`, `platform`, `collection_period`, `source_url`, `source_locator`, `retrieved_at_utc`, `source_sha256`, `source_hash_scope`
- `observations`: typed observations, each with `kind`, `value`, `method`, `source_span`, and `missingness`
- `labels`: `origin`, `operation_attribution`, `automation`, `coordination`, `deception`, `exposure`, `recommendation`, `impact`; each is `supported`, `contradicted`, or `unknown`
- `label_provenance`: assessor, disclosure basis, adjudication, and audit trail
- `allowed_claims` and `forbidden_inferences`
- `split_group`: campaign/dataset and time block, for leakage-safe evaluation

`origin` concerns an account or operator; `operation_attribution` concerns a named campaign or operation and retains the attributing source. A campaign attribution does not establish each included account's operator location. An `unknown` label means available evidence does not settle the claim; it is neither a negative nor a failed positive. `Coordination` denotes observed joint behavior; `deception` denotes concealed or false organizational presentation. `Exposure` denotes observed delivery to an audience; `recommendation` denotes a measured composition increment against an explicit ranking/feed baseline; the edge design separately records whether the increment is causal or associational. Platform enforcement labels retain the platform's exact wording and confidence limitations. A confirmed state-linked operation is not automatically automated; a bot is not automatically foreign; a coordinated network is not automatically deceptive or algorithmically amplified.

## Benchmark tracks

1. **Claim-boundary track:** Given an evidence bundle, output supported claims, contradicted claims, and abstentions. Score unsupported assertions separately for O, P, A, C, D, E, R, and I, whether they are unwarranted positive or negative claims. The main score is the proportion of asserted claims that were unsupported; lower is better. Publish coverage alongside error so a method cannot win by abstaining on everything.
2. **Origin/automation/coordination track:** Evaluate against independently disclosed positives and verified comparison cases, stratified by platform and period. Do not call undisclosed accounts negative. Report precision/recall only where the label design permits them.
3. **Exposure track:** Observed delivery supports E. A ranking or feed comparison with a valid baseline is required for R, and causal interpretation requires a separate design grade. Score effect estimation separately from account identification. Historical anonymized feed data cannot identify particular promoted accounts.

## Hard abstention cases from existing work

| Case | Observation | Required output | Source |
| --- | --- | --- | --- |
| `displayed_origin_only` | X displayed a non-US country for a reposter | Origin signal observed; actual origin, automation, coordination, exposure, and impact unknown | `studies/foreign_origin_amplification_600/REPORT_v1.md` |
| `feed_shift_only` | 2023 matched feeds show conservative-relative source-share shift | Exposure composition supported for the dataset; foreign origin, automation, coordination, and impact of any specific account unknown | `studies/political_recommendation_amplification/public_results/heterogeneity/report.md` |
| `anonymous_news_source` | Public 2023 data show unmatched anonymous News account contributions | Source-type contribution supported; unmatched does not mean foreign or inauthentic | Same report |
| `values_misalignment_only` | 2024 matched feeds show negative value alignment of amplified content | Value-selection pattern supported; account origin and bot status unknown | `studies/political_recommendation_amplification/public_results/synthesis/report.md` |
| `facebook_media_coordination` | A Facebook study observed highly coordinated link sharing by media groups as well as an influence operation | Coordinated behavior supported; coordination alone does not settle deception, foreign origin, or feed exposure | Rogers and Righetti (2025), DOI 10.1177/29768624251369784 |
| `tiktok_duet_signal_only` | A TikTok study found Duet and Stitch interactions can be organic | That interaction type alone does not establish covert coordination or deception | Luceri et al. (2026), DOI 10.1609/icwsm.v20i1.42711 |
| `ira_potential_exposure` | A 2016 election study reconstructed possible timeline exposure from follow lists and posts by followed accounts | Campaign attribution supported; actual feed delivery and viewing unknown, as are recommendation increment and causal audience impact | Eady et al. (2023), DOI 10.1038/s41467-022-35576-9, Methods (PMC9829855) |
| `botometer_score_only` | A bot-detection score is above a researcher-chosen threshold | Automation remains unknown until case-specific validation; a score is not a verified bot label | Rauchfleisch and Kaiser (2020), DOI 10.1371/journal.pone.0241045 |
| `botometer_reviewed_false_positive_group` | Claim: all 27 German politician accounts flagged above a 0.76 threshold were fully automated | Contradicted at the group-claim level: manual review found only one account with possible cross-posting automation | Rauchfleisch and Kaiser (2020), DOI 10.1371/journal.pone.0241045 |
| `youtube_engagement_not_recommendation` | A YouTube paper titled “algorithmic amplification” analyzes engagement on official campaign videos | Recommendation increment remains unknown: the authors explicitly state that recommender behavior was not measured | Hassan (2026), DOI 10.3389/fpos.2026.1901653 |

The scorer separately counts assertions against `unknown` labels and assertions against `contradicted` labels. `contradictedClaimAssertionRate` is calculated over contradicted claim slots in this test set, not over real-world accounts; coverage is reported for supported and contradicted slots. The latter is a real source-backed false-positive **case test**, but it is not a population false-positive rate for real-world account detection. That rate remains unmeasurable until a sufficiently large, independently verified negative corpus exists.

The evaluator's deterministic self-check includes five targeted mistakes: promoting a displayed country to verified origin, coordination to deception, potential exposure to observed delivery, engagement to a measured recommendation increment, and a Botometer-flagged group to universal automation. Four assert facts over `unknown`; the Botometer group claim contradicts a source-backed finding. The check verifies that these error types stay distinct in the reported score. It tests the scorer, not a new detector or an unseen case set.

The independent-adjudication packet expands the ten cases into 80 claim rows while withholding every provisional label. A strict importer requires source verification, a label, rationale, decision time, reviewer identity, conflict disclosure, and an independence attestation for every row. Comparison and consensus code is ready, but no independent decisions exist yet.

### Denominator guard for detector-error claims

Keep three different quantities separate: false-positive rate is `FP / (FP + TN)` among reference negatives; false discovery proportion is `FP / (FP + TP)` among predicted positives; and the benchmark's contradicted-claim assertion rate is an error count over the deliberately selected claim slots above. The last quantity estimates neither of the first two. In [Rauchfleisch and Kaiser (2020)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0241045), the reported 41% human share among accounts classified as bots at a 0.76 threshold comes from a resampling thought experiment assuming 15% bots. It is a false discovery proportion under that assumed mix, not an observed false-positive rate in the Twitter population. Do not relabel it, pool it as a binomial FPR, or transfer it to a newer Botometer version. An account-level historical validation must state the negative-label source, score version, threshold, account denominator, and how repeated daily scores were reduced.

Seçkin et al.'s 26-campaign data are a promising source of platform-attributed positives and time/topic controls, but the [Zenodo files](https://zenodo.org/records/14189053) are restricted and require academic-affiliation access. Their control sampling does not independently prove every control account is a true negative. We will not silently use those controls as ground truth or bypass the stated one-file-per-researcher-per-day condition.

## Release gate

A public benchmark release requires source hashes, license/redistribution checks, a double-coded adjudication sample, campaign-level split integrity, false-positive/abstention results, and a machine-readable card describing bias and prohibited uses. The current source-by-source rights review permits the repository's conservative use: external articles remain link-and-hash references, and local reports do not relicense underlying data. The [immutable v0.4.0 amendment](https://github.com/jcatster7/foreign-influence-evidence-observatory/releases/tag/v0.4.0-heldout-amendment) prospectively freezes a sealed-label group split, minimum pool coverage, and prediction-before-reveal sequence. It does not establish the split until a real candidate pool passes the registered script. Run `node --experimental-strip-types audit_benchmark.ts` to reconcile the cases, rights review, and provisional card and write the machine-readable audit. No account-level accusation is released on a proxy-only case.
