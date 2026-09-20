# Foreign Influence Evidence Observatory

**Status: preregistration packet prepared; review and benchmark provisional.** No final systematic study count, causal claim about foreign bots, or population false-positive rate is released here.

This project maps the evidence behind eight distinct social-media claims: account/operator origin (O), operation attribution (P), automation (A), coordination (C), deception (D), observed feed delivery (E), feed-selection increment (R), and audience impact (I). It keeps `unknown` as a valid result. A platform country label, bot score, coordinated posting pattern, potential timeline exposure, and matched-feed difference each answer different questions.

## Current materials

- [Preregistration draft](PREREGISTRATION_DRAFT.md), [exact search protocol](SEARCH_PROTOCOL.md), and [extraction codebook](EXTRACTION_CODEBOOK.md)
- [Source extractions](SOURCE_EXTRACTIONS.md), [provisional evidence map](EVIDENCE_MAP_SEED.csv), and [edge map](EDGE_MAP_SEED.csv)
- [Benchmark specification](BENCHMARK_SPEC.md), [nine provisional cases](benchmark_cases.json), [claim scorer](score_claims.ts), and [local report copies](sources/local_reports/README.md)
- [Low-cost displayed-country replication protocol](LOW_COST_REPLICATION_PROTOCOL.md)
- [Search status](SEARCH_STATUS.md), [budget ledger](BUDGET_LEDGER.csv), and [OSF registration packet](registration/OSF_REGISTRATION_PACKET.zip)

The 2026-09-19/20 scoping search collected 8,793 OpenAlex rows across five query families, but its fifth cursor stopped at a keyless API limit. The saved rows contain 7,986 distinct DOI-or-OpenAlex screening records after deduplication. Every record remains unscreened. Those numbers are acquisition diagnostics, **not** PRISMA inclusion counts. The registered search will be rerun after the OSF registration is submitted.

The registered acquisition script, `search_openalex_registered.ts`, requires the public OSF registration URL and a UTC cutoff date. It archives raw OpenAlex responses plus hash-checked checkpoints. The current scoping files do not include those raw response bytes.

## Claim boundary

The local 600-event visible-repost pilot reports differences in X-displayed country signals among selected positions. Its original screenshot audit was incomplete, and it cannot establish nationality, bot identity, coordination, foreign control, or recommendation amplification. Historical public matched-feed analyses measure aggregate feed composition under different outcomes and periods; they do not identify the reposters in the origin pilot. The source extractions identify these and other pieces without combining them into a claim that a platform amplified foreign bots.

The benchmark scores source-backed claim assertions. It separately counts unsupported assertions over `unknown` labels and assertions contradicted by a reviewed group case. The nine current cases are prior-known software checks, not an unseen held-out evaluation set. A population false-positive rate needs independently verified negatives; undisclosed or time/topic comparison accounts are not assumed negative.

## Reproduce the current checks

With Node.js 25 or a TypeScript runtime supporting type stripping:

```bash
node --experimental-strip-types score_claims.ts
node --experimental-strip-types prepare_screening_queue.ts
node --experimental-strip-types audit_screening.ts
```

The scorer self-check must pass. The screening audit applies only to the pre-registration OpenAlex queue and always reports `ready_for_final_study_count: false`; even a fully reviewed scoping queue cannot certify the registered review. Search acquisition scripts use public Crossref and OpenAlex endpoints; consult `SEARCH_STATUS.md` before rerunning because the current keyless OpenAlex quota was exhausted. Source pages may change, so preserve dates, URLs, and response hashes.

## Release conditions and cost

The final map requires a complete registered search, documented publication-to-dataset deduplication, two-coder full-text inclusion and construct labels, risk-of-bias judgments, and a PRISMA flow. The public benchmark additionally requires source/license checks, an adjudicated sample, campaign-level splits, and a bias card. The replication protocol requires a newly archived sample and agreement/missingness audit before a replication result can be claimed.

External spend is tracked in `BUDGET_LEDGER.csv`, currently **$0** against a hard **$20** cap. Public metadata and local tools are the default. No paid API is required.

[Reuse terms](LICENSE.md) distinguish original code and protocol text from third-party metadata, articles, and local source reports.

## Reporting standards and primary references

- [PRISMA 2020](https://www.prisma-statement.org/prisma-2020)
- [SWiM guidance](https://www.bmj.com/content/368/bmj.l6890)
- [OpenAlex API documentation](https://help.openalex.org/api/)
- [OSF registration guidance](https://help.osf.io/article/330-welcome-to-registrations)
