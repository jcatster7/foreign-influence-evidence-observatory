# Low-cost replication protocol

Version 0.1, 2026-09-19. Protocol only; no new observations collected.

## Target question

Does the 600-event pilot's contrast in X-displayed country signals replicate under a prespecified, independently archived sample, and how much do missing panels and repeated accounts change it? This is a validation of a displayed origin signal, not a test of bot identity or foreign control.

## Sampling and capture

Freeze target eligibility, ideology coding rule, post window, position rule, and collection dates before capture. Select targets from a declared roster using a recorded random seed. Sample equal numbers of posts per target and visible repost positions per post. Save the post URL, UTC capture time, selected position, anonymized account key, displayed country category, and an archived screenshot at observation time. Record failed loads and inaccessible panels as outcomes. Use two independent reviewers for at least a prespecified 20% sample; adjudicate disagreements without overwriting initial codes.

## Analysis

Primary estimand: non-US displayed country among country-resolved sampled repost events, contrasted across prespecified target strata. Report all five categories (`displayed_us`, `displayed_non_us`, `region_only`, `panel_unavailable`, `unresolved`) before restricting the denominator. Use target-cluster uncertainty, target-level plots, handle/account deduplication, leave-one-target-out estimates, and worst-case missingness bounds. Do not interpret visible repost positions as a random sample of all reposts.

## Reproducibility and costs

Archive source URLs, collection logs, screenshots where permitted, reviewer decisions, code, hashes, and a machine-readable run manifest. Use existing local browser/manual workflows and free software. Budget $0 for the default run; reserve up to $20 for documented capture/storage needs only. No paid X API is assumed. If screenshot archiving or access fails, stop the confirmatory analysis and report the gap rather than filling it with later captures.

## Publication gate

Do not claim replication until the prespecified sample is complete, screenshot audit passes, two-reviewer agreement is reported, and sensitivity results are available. Never infer nationality, residence, automation, coordination, or state sponsorship solely from the displayed origin panel.
