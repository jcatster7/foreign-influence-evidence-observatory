# Exploratory search status

As of 2026-09-19. This is **pre-registration scoping**, not the final systematic review or a PRISMA flow count.

## Reproducible discovery pass

| Source | Exact searches and response hashes | Retrieved | Unique within source | Preliminary full-text candidates |
| --- | --- | ---: | ---: | ---: |
| Crossref title search, first 30/query | `searches/crossref_initial_2026-09-19.json` | 150 | 150 | 25 |
| OpenAlex title/abstract/full-text Boolean search, first 50/query | `searches/openalex_initial_2026-09-19.json` | 250 | 239 | 38 |

The two sources overlap on 15 DOI records. Across them, 364 distinct DOI strings were retrieved, and 55 distinct DOI strings received preliminary full-text retrieval decisions. These counts are discovery diagnostics, not eligible-study counts. Search ranking and top-N limits can miss relevant work; Crossref's broad title matching produced an especially poor fifth query. The frozen registered review must search the full result sets or declare a defensible cutoff, deduplicate by DOI and source dataset, and add platform archives plus citation chasing.

Every response has a retrieval timestamp, exact URL, reported result count, and SHA-256. `search_crossref.ts` and `search_openalex.ts` reproduce the acquisition. `screen_crossref_titles.ts` and `screen_openalex_titles.ts` reproduce the provisional single-reviewer title decisions. Full-text review and second-reviewer calibration have not happened for most candidates; decisions may be reversed with a logged reason.

`EVIDENCE_MAP_SEED.csv` is a lead register, not a final coded synthesis. `EDGE_MAP_SEED.csv` separately codes nine provisional source-to-claim links as causal tests, measured associations, proxy-only links, or untested links; it is not a final causal synthesis. `EVIDENCE_MAP_SEED.csv` uses `*_evidence` fields to distinguish `supported` by a direct measure, `proxy`, `platform_disclosure`, `measurement_validation`, and `unknown`. These are evidence-stage descriptions, not the benchmark's adjudicated claim labels. Each row still needs extraction, bias assessment, and an independent-dataset check before it enters a published map.

## High-priority primary sources already inspected

| Source | Why it matters | Boundary |
| --- | --- | --- |
| [Rogers and Righetti 2025](https://journals.sagepub.com/doi/10.1177/29768624251369784) | Facebook media groups and an influence operation showed similar high coordination signatures. | Coordinated behavior alone does not establish deception. |
| [Luceri et al. 2026](https://ojs.aaai.org/index.php/ICWSM/article/view/42711) | TikTok video-first study examines coordination signals and finds some platform-native interactions can be organic. | Abstract inspected; full method/validation extraction pending. |
| [Eady et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9829855/) | Links platform-attributed IRA accounts to reconstructed potential 2016 Twitter timeline exposure and survey outcomes. | Authors could not observe which posts users actually saw; no ranked-versus-chronological comparison, and the reported null association is not proof of zero impact. |
| [Huszár et al. 2021](https://www.pnas.org/doi/full/10.1073/pnas.2025334119) | Platform randomized holdback directly estimates ranking amplification of political source groups. | Not a foreign-operation account study; aggregate data require author request. |
| [Rauchfleisch and Kaiser 2020](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0241045) | Empirical bot-detector validation shows prevalence, temporal drift, and false-positive problems. | Historical tool/version and samples; do not transfer its error rates to 2026 detectors. |
| [Seçkin et al. 2025](https://ojs.aaai.org/index.php/ICWSM/article/view/35958) | Publishes a 26-campaign dataset with platform-attributed positives and time/topic comparison data. | [Files are restricted](https://zenodo.org/records/14189053); access requires academic affiliation and one file per researcher per day. Topical controls are not independently verified negatives. |

## Expanded OpenAlex harvest (incomplete)

A second scoping pass uses five fixed, narrower Boolean queries in `search_openalex_full.ts`, filtered through 2026-09-19 and paged by OpenAlex cursor at 100 records per call. Each acquired page is checkpointed separately with its exact URL, timestamp, raw-response SHA-256, result count, and cursor. On 2026-09-20 UTC, the keyless API returned HTTP 429 during query 5. The script stopped without a purchase; it can resume from saved pages.

| Query | Reported matching records | Retrieved | Status |
| --- | ---: | ---: | --- |
| Foreign influence and social media/platform | 2,169 | 2,169 | Complete cursor chain |
| Coordinated inauthentic behavior and platform | 657 | 657 | Complete cursor chain |
| Information operations, social media, exposure/recommendation | 2,381 | 2,381 | Complete cursor chain |
| Political/election bot detection validation | 1,386 | 1,386 | Complete cursor chain |
| Political/election algorithmic amplification and platform | 2,830 | 2,200 | Incomplete; 630 records remain at snapshot count |

The 8,793 retrieved rows contain 8,025 unique OpenAlex IDs and 6,900 unique DOI strings; these are partial-harvest diagnostics, not screened or eligible-study counts. OpenAlex counts may change before resumption. `summarize_openalex_full.ts` deliberately refuses to create a completed summary until all five cursor chains terminate. The current source-by-source scoping extractions are in `SOURCE_EXTRACTIONS.md`.

## Reviewer queue from the partial harvest

`prepare_screening_queue.ts` deduplicates the 8,793 saved OpenAlex rows into 8,025 distinct OpenAlex IDs, then collapses 39 duplicate-DOI records to 7,986 screening records, and writes `searches/openalex_partial_screening_queue.jsonl`. All rows remain `unscreened`. A deterministic SHA-256 selection assigns 1,599 records (20% within each primary-query stratum, rounded up) to the planned dual-review calibration sample. A title-keyword score orders work and has **no exclusion authority**; 195 records score at least 3. The queue must be regenerated after query 5 completes and again after the registered search. Its current counts are not PRISMA screening decisions.

`audit_screening.ts` validates reviewer decisions in this pre-registration queue and currently reports `ready_for_final_study_count: false`: the fifth query is incomplete, all 7,986 records lack title decisions, and 1,599 calibration records lack a second reviewer. It can also inspect a registered queue and validate that queue against its frozen SHA-256. The final-count flag remains false by design even if the indexed queue is screened, because supplemental sources, publication-to-dataset merges, and dual-coded extractions are separate release requirements. A fixture confirmed that a record advanced to full text also fails the indexed screening gate until two full-text decisions exist.

The queue surfaced [Cirone and Hobbs 2023](https://www.cambridge.org/core/journals/political-science-research-and-methods/article/asymmetric-flooding-as-a-tool-for-foreign-influence-on-social-media/1D007EBDEF5D511812B615B9F6D61B02), a descriptive analysis of the Twitter-disclosed IRA archive. It is provisionally extracted in `SOURCE_EXTRACTIONS.md`; attribution corpus overlap with Eady et al. is flagged.

## Prior-vault reconciliation

Older notes in the canonical `~/foltz-research/inbox/` identify additional methods and study leads. The [Recabarren et al. USENIX study](https://www.usenix.org/system/files/usenixsecurity23-recabarren.pdf) was checked against its primary paper and added to the provisional extractions. An older 60-event displayed-origin pilot is described in a vault note, but its canonical study manifest and event data are cloud-backed/unreadable here; its numerical claims are **not admitted** to this map until the manifest and raw evidence can be inspected. The two-account conflict pilot remains a pipeline diagnostic, not an influence finding.

## Costs

No paid service or purchase was used. OpenAlex reported $0.005 as an API metering estimate across five keyless calls; its [documentation](https://help.openalex.org/api/) says basic keyless use is free. Actual external spend remains $0.
