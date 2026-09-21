# Prospective replication amendment: fixed frame and deterministic sample

Prepared 2026-09-21 UTC after an authorized-session preflight passed and **before inspecting any target-frame About panel, freezing any target or post sample, or collecting any replication observation**. This amendment narrows the registered low-cost replication protocol. It changes no evidence-map or benchmark rule.

## Estimand and interpretation

Replicate the historical pilot's difference between two fixed publisher-account strata in the proportion of country-resolved visible repost events whose X About panel displays a non-US country. The strata are historical pilot labels, not revalidated current ideology scores. The result concerns X-displayed account signals in selected visible repost positions. It cannot establish nationality, residence, operator location, automation, coordination, foreign control, platform intent, or population prevalence.

## Fixed target frame and eligibility

The only target candidates are the 20 rows in `replication/historical_pilot_target_frame.csv`, SHA-256 `0ad2f614bb0dd310cddf7ffc903b01e29141817728a0e1d9945644e1d5defb6f`: ten `far_left` and ten `far_right`. Do not add replacements.

A target is eligible when its profile is publicly accessible in the authorized English-language X interface and it has at least five qualifying posts in the fixed window. A qualifying post is authored by the target, including a quote post, and is neither a reply nor a repost. The fixed post window is 2026-08-22 00:00:00 through 2026-09-20 23:59:59 UTC. Inventory every qualifying post visible through the profile timeline for that interval and preserve URL, post ID, and UTC time. Sort newest to oldest by time, then descending post ID. Select qualifying ranks 1, 3, and 5.

If a target is inaccessible or has fewer than five qualifying posts, record the prespecified reason and exclude it without replacement. The primary analysis requires at least eight eligible targets in each stratum. If either stratum falls below eight, stop and report the failed sample gate.

Run the registered `freeze_replication_sample.ts` on the complete 20-target inventory. It verifies the historical-frame hash, exact target membership and strata, absence of origin/About fields, fixed dates, post order, eligibility, and the minimum stratum counts. Preserve and publish the inventory hash, plan hash, and summary before opening any selected repost list or target-frame About panel.

## Repost-position sample

For each selected target post, open the direct X repost-list route in the same authorized English-language browser session. Use fixed visible positions 2, 4, 6, 8, 10, 12, 14, 16, 18, and 20 in the order X displays at the recorded capture time. Do not replace a missing, inaccessible, or duplicated position with a later account. Record every planned position, including failures. With all 20 targets eligible, the design contains 60 posts and 600 planned event positions.

Complete collection within seven UTC calendar days after the sample plan is frozen. If X changes the route, ordering, About panel, or access controls during collection, stop and register a deviation before continuing.

## Observation categories and evidence

For each visible reposter, open the public About panel and assign exactly one primary category:

- `displayed_us`: country field explicitly displays United States;
- `displayed_non_us`: country field explicitly displays another country;
- `region_only`: only a subnational or broad region is displayed;
- `panel_unavailable`: the About panel cannot be loaded;
- `unresolved`: the panel loads but the country/region value cannot be classified.

Use reason `country_field_absent` when the panel loads without a country/region field. Never code absence as United States. Archive a screenshot at observation time where permitted, plus post URL, position, UTC time, interface language, category, reason, and an HMAC-derived account key. Keep the HMAC secret and screenshots in restricted local evidence; publish only anonymized keys, category data, hashes, and aggregates. Save after each target rather than batching transfer at the end.

## Independent coding and analysis

Select 20% of planned event keys for independent second coding with SHA-256 seed text `foreign-origin-replication-v0.5.0-independent-review`. The second reviewer receives screenshots and event keys without the first reviewer's codes. Preserve both initial codes and a separate consensus record. Report the complete category table, raw agreement, Cohen's kappa, and category-specific disagreement before the primary estimate.

The primary denominator contains only `displayed_us` and `displayed_non_us`. Report each stratum's non-US share and the far-right minus far-left difference. Use target-cluster bootstrap uncertainty with seed `20260921` and 10,000 draws. Also report target-level estimates, handle-key deduplication, leave-one-target-out differences, and worst-case bounds assigning all non-country-resolved events first to US and then to non-US. Visible X ordering is not a probability sample, so do not generalize to all reposters.

## Preflight and cost

The 2026-09-21 16:48 UTC preflight used two excluded accounts. It confirmed an authenticated About panel, a visible `Account based in United Kingdom` field where present, a direct repost list, and local screenshot capture. It collected no target-frame observation.

The default external cost is $0. No paid X API or service is authorized. The project cap remains $20. Protocol registration and a successful preflight do not constitute a replication result.
