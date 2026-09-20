# Local report copies in the registration packet

These are byte-identical copies of three reports used to construct the provisional benchmark cases. Their hashes are recorded in `benchmark_cases.json` and verified by `score_claims.ts`. They are prior knowledge, not results produced under the proposed registration.

| Packet copy | Original path relative to the workspace root | Scope |
| --- | --- | --- |
| `origin_600_report_v1.md` | `studies/foreign_origin_amplification_600/REPORT_v1.md` | Selected visible-repost displayed-country pilot; original screenshot audit was incomplete. |
| `matched_feed_2023_heterogeneity_report.md` | `studies/political_recommendation_amplification/public_results/heterogeneity/report.md` | Public, anonymized matched-feed analysis for 2023. |
| `matched_feed_2024_synthesis_report.md` | `studies/political_recommendation_amplification/public_results/synthesis/report.md` | Separate public matched-feed analysis for 2024. |

The origin report contains absolute links to chart and table files in its original working environment. Those linked files are not in this packet, and the links will not resolve after extraction. The report is included so that its benchmark evidence can be inspected, not as a complete archive of the pilot's raw data. The two matched-feed reports likewise do not supply their underlying public datasets in this packet. Reviewers should use the report's source and methods references when evaluating any empirical claim.
