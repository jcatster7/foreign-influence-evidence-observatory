# Who received the ideological feed asymmetry, and what produced it?

## Result in one paragraph

The participant-equal conservative-minus-liberal algorithmic uplift was **2.161 [0.095, 4.226] percentage points** (estimate and 95% simultaneous max-*t* interval). The average was positive, but the individual distribution was nearly split: 51.0% positive, 46.5% negative, and a median of 0.500 points. Party-ID differences were unresolved. The source-type decomposition isolated the asymmetry in News accounts. Account-level contributions were concentrated, but zeroing the ten most repeated or ten most influential anonymous news accounts left a positive residual. All three ideology-label schemes gave a positive simultaneous interval, although their magnitudes and account-level agreement differed substantially.

Positive estimates mean conservative-source exposure increased more, or decreased less, in Algorithm than liberal-source exposure relative to Chronological. They do not mean conservative sources were the majority of either feed.

## Participant distribution

| Statistic | Conservative-relative uplift (pp) |
|---|---:|
| Mean | 2.161 |
| 5th percentile | -28.100 |
| 25th percentile | -9.000 |
| Median | 0.500 |
| 75th percentile | 12.000 |
| 95th percentile | 37.200 |
| Share positive | 51.0% |
| Share negative | 46.5% |

The 10%-trimmed mean was 1.311 pp with pointwise 95% interval [0.174, 2.433]. The positive mean therefore does not disappear after removing both tails, but it is not a uniform participant-level effect.

## Party-identification moderation

The dataset has party identification rather than a direct liberal–moderate–conservative scale. The groups below are therefore proxies, not interchangeable ideological identities.

| Baseline party-ID proxy | n | Estimate and simultaneous 95% CI (pp) |
|---|---:|---:|
| Republican | 160 | 3.340 [-1.313, 7.993] |
| Democrat | 410 | 1.467 [-1.568, 4.502] |
| Independent/other | 347 | 2.436 [-1.204, 6.077] |

All three pairwise group-difference intervals include zero. This dataset does not resolve whether the asymmetry was personalized by baseline party identification.

## Source-type decomposition

| Source-account type | Estimate and simultaneous 95% CI (pp) |
|---|---:|
| News | 3.013 [1.755, 4.271] |
| Political activist | -0.298 [-1.849, 1.253] |
| Entertainment | -0.575 [-1.472, 0.322] |
| Official | -0.077 [-0.610, 0.456] |
| Other | 0.097 [-0.114, 0.308] |

Only News has a simultaneous interval excluding zero. Within News:

| News matching category | Estimate and simultaneous 95% CI (pp) |
|---|---:|
| Hard-news match | 1.326 [0.498, 2.154] |
| Soft-news match | 0.001 [-0.009, 0.011] |
| Not matched to external outlet list | 1.686 [0.867, 2.506] |

“Not matched” means absent from the external outlet lookup, not unknown, foreign, or inauthentic.

## Anonymous news-account concentration

The paired sample contains 6,228 anonymous News accounts. The ten largest absolute account contributions explain 38.7% of absolute account movement and 52.1% of the signed net News asymmetry. This is meaningful concentration, but not single-account domination.

After zeroing the contributions of the ten most repeated News accounts, the residual was 1.557 pp [1.052, 2.081]. After zeroing the ten largest absolute contributors, it was 1.442 pp [0.953, 1.941].

| Anonymous rank | Slant label | Contribution (pp) | Rows | Participants | Mechanism |
|---:|---|---:|---:|---:|---|
| 1 (anon-341) | Liberal | 1.165 | 2,247 | 185 | lower liberal share in Algorithm |
| 2 (anon-443) | Liberal | 0.714 | 1,374 | 146 | lower liberal share in Algorithm |
| 3 (anon-2095) | Conservative | -0.612 | 1,403 | 104 | lower conservative share in Algorithm |
| 4 (anon-433) | Liberal | 0.406 | 815 | 137 | lower liberal share in Algorithm |
| 5 (anon-1929) | Conservative | -0.216 | 490 | 70 | lower conservative share in Algorithm |
| 6 (anon-19) | Liberal | 0.194 | 459 | 68 | lower liberal share in Algorithm |
| 7 (anon-95) | Liberal | -0.163 | 356 | 164 | higher liberal share in Algorithm |
| 8 (anon-956) | Conservative | -0.139 | 323 | 71 | lower conservative share in Algorithm |
| 9 (anon-1250) | Conservative | 0.127 | 215 | 96 | higher conservative share in Algorithm |
| 10 (anon-481) | Liberal | 0.096 | 139 | 46 | lower liberal share in Algorithm |

Account names and post text were removed by the data authors for respondent privacy. These ranks cannot be mapped back to public accounts from the released data. Contribution-zeroing retains the original feed denominators; its intervals are pointwise and conditional on full-sample selection. These are sensitivity checks rather than reranking counterfactuals or account-level tests.

## Ideology-label sensitivity

| Source ideology scheme | Estimate and simultaneous 95% CI (pp) | Labeled rows | Labeled accounts |
|---|---:|---:|---:|
| Llama 3 plus expert knowledge | 2.161 [0.095, 4.226] | 129,790 (48.3%) | 21,792 (33.4%) |
| Word-frequency ML classifier | 5.753 [3.746, 7.760] | 253,544 (94.4%) | 61,216 (93.9%) |
| Shared-URL score sign | 4.237 [1.492, 6.982] | 154,828 (57.7%) | 15,345 (23.5%) |

Direction survives all three label schemes, including simultaneous correction. Magnitude is label-sensitive: ML minus main is 3.593 [1.301, 5.884] pp. On commonly labeled rows, raw agreement was 64.5% for main versus ML. For the two stable source-account schemes, main-versus-URL account agreement was 66.5%.

## What the four diagnostic possibilities look like

1. **Broad system-wide asymmetry:** supported at the mean and after trimming, but not as a uniform participant effect; participant signs are nearly evenly divided.
2. **Personalization by user politics:** unresolved; all party-ID group contrasts include zero.
3. **A few sources dominate:** contributions are concentrated, but top-account zeroing does not erase the News result.
4. **A classification artifact:** direction is robust across three schemes, but estimated magnitude is materially label-dependent and agreement is only moderate.

## Scope limits

- Historical July-September 2023 exposure; not evidence about X in 2026.
- Source-account labels are not post-level ideology labels.
- Participant party identification is only a proxy for political ideology.
- Public data intentionally omit source names and post text, so anonymous account ranks cannot be identified publicly.
- Paired-feed differences are descriptive exposure contrasts and do not establish platform intent or persuasion.
- Alternative label schemes have materially different coverage and only moderate account-level agreement.

## Reproduction

Input archive SHA-256: `a10b69776d5eb73a5797d722079474511bcb4ef91995e264bb656c1b434b9d44`  
Stata member SHA-256: `13d1f5a4d9be63622140a641f5ad5eac8034d46639406ab740ec414144850731`  
Bootstrap: 5,000 participant-clustered draws, seed `20260911`. Simultaneous intervals cover the complete 19-estimate family.
