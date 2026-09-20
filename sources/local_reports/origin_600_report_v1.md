# Foreign-origin amplification pilot: Version 1 findings memo

**Freeze date:** 2026-09-16  
**Status:** descriptive pilot; do not characterize as proof of manipulation

## Executive summary

In the frozen visible-repost sample, **24.7%** of country-resolved repost events associated with far-left targets displayed a non-US origin, compared with **5.8%** for far-right targets. The descriptive far-right-minus-far-left difference is **−18.94 percentage points**.

This is an observation about an origin signal displayed by X. It is not evidence of account nationality, residence, operator location, bot status, coordination, or foreign control.

## Design and estimand

The study contains 20 targets, 50 posts, and 600 sampled repost events: 12 visible repost positions per post, split evenly between 10 far-left and 10 far-right targets. The primary estimand is the share of **country-resolved** events displaying a non-US country. `region_only`, `panel_unavailable`, and `unresolved` observations are excluded from that denominator rather than treated as US.

| Group | Displayed non-US | Country-resolved | Share | Exact 95% CI |
|---|---:|---:|---:|---:|
| Far left | 72 | 291 | 24.7% | 19.9%–30.1% |
| Far right | 17 | 293 | 5.8% | 3.4%–9.1% |

Far-right minus far-left: **−18.94 percentage points**. A target-cluster bootstrap interval for that difference was −26.68 to −11.10 percentage points. This interval is supplemental and does not remove the study’s sampling and evidence limitations.

![Primary results chart](/Users/justinmonk/.codex/recovery/foreign_origin_amplification_600/analysis/results_chart.png)

## Sensitivity and target-level variation

Deduplicating by lower-cased observed reposter handle produced nearly the same estimates:

- Far left: 66/268 = **24.6%**
- Far right: 16/262 = **6.1%**

No observed handle appeared in both ideological strata. Across targets, far-left non-US shares ranged from **12.5% to 45.5%**, with a median of **21.4%**. Far-right shares ranged from **0.0% to 29.2%**, with a median of **3.5%**; three far-right targets had zero displayed non-US accounts. The aggregate contrast remained negative when any one target was removed, ranging from −21.02 to −16.85 percentage points.

Detailed outputs:

- [Primary and sensitivity results table](/Users/justinmonk/.codex/recovery/foreign_origin_amplification_600/analysis/analysis_results.csv)
- [Target-level variation table](/Users/justinmonk/.codex/recovery/foreign_origin_amplification_600/analysis/target_variation.csv)
- [Methods and limitations](/Users/justinmonk/.codex/recovery/foreign_origin_amplification_600/analysis/analysis_summary.md)
- [Version-1 lock record](VERSION_1_LOCK.md)

## Evidence and limitations

The canonical evidence directory contains 525 screenshot paths. **520 screenshots remain cloud-backed/dataless and could not be locally hydrated.** The analysis therefore relies on the recovered structured observations and treats the missing screenshots as an explicit audit limitation. Recovery-pass screenshots collected at different times are retained as provenance but are not presented as replacements for the missing original screenshots.

Additional limitations:

- X’s displayed origin signal is platform-inferred and may not reflect nationality, residence, or operator location.
- The sample covers selected visible repost positions, not every repost and not every account engaging with each post.
- Events are nested within posts and targets; simple event-level confidence intervals should not be read as fully independent-sample uncertainty.
- There are only 10 targets per ideological stratum, so target-level variation matters.
- Handle-based deduplication cannot perfectly resolve deleted, renamed, or inaccessible accounts.
- The analysis does not establish bots, coordination, foreign control, state sponsorship, or causality.

## Publication decision

This Version 1 memo should be treated as an internal descriptive result. A publication-grade follow-up should use independently archived screenshots captured at observation time, a prespecified double-coding procedure, and a fresh validation sample before making stronger claims.

No software or API spend was incurred.
