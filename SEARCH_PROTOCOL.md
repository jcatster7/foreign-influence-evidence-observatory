# Search and screening protocol — registration candidate

Version 0.1, 2026-09-20. **Not registered.** The 2026-09-19/20 API acquisitions are exploratory, known before registration. This protocol specifies how the later registered review will be searched and screened; any registered changes must be logged as deviations.

## Indexed scholarly search

OpenAlex core works is the primary searchable index. Search all publication years through the final search date, recorded as a UTC calendar date in the registration. Run every query below with `filter=to_publication_date:<final_search_date>`, `per_page=100`, and cursor pagination until `next_cursor` is null. Select `id,display_name,doi,publication_year,publication_date,type,primary_location,abstract_inverted_index` in that order. Save every page's exact URL, fetch timestamp, raw-response SHA-256, reported count, next cursor, and selected metadata; retain raw page responses or a lossless response archive where allowed. A complete cursor chain with no repeated cursors is required before declaring the search complete. Search strings:

After the OSF registration is public, run `search_openalex_registered.ts` with the registration URL and the final UTC cutoff date. Before creating a run, it checks the public OSF Registrations API for an active, non-embargoed registration dated on or before the cutoff and records the verification time and registration date. It writes a `RUN.json`, each raw JSON response, and a paired checkpoint containing the response hash and cursor. A resumed run verifies its fixed query, URL, cursor, and raw-byte hash before accepting a checkpoint. An HTTP limit or safety cap leaves the run incomplete. The earlier `search_openalex_full.ts` and its derived page records are scoping material only; they did not retain the raw response bytes and cannot substitute for this registered acquisition.

Run `prepare_registered_queue.ts --run-dir=<completed registered run directory>` only after `RUN.json` says complete. The builder verifies the five frozen queries, each raw response hash and cursor chain, then writes a DOI/OpenAlex-deduplicated queue with title, reconstructed abstract, source-page provenance, and a deterministic 20% calibration sample within each primary-query stratum. It refuses to overwrite a queue or summary whose bytes differ from a regenerated version. The queue is an input to human screening, not a machine-made inclusion decision.

1. `"foreign influence" AND "social media" AND (Twitter OR Facebook OR TikTok OR Reddit OR YouTube)`
2. `"coordinated inauthentic behavior" AND (Twitter OR Facebook OR Instagram OR TikTok)`
3. `"information operations" AND "social media" AND (exposure OR recommendation)`
4. `"bot detection" AND (political OR election) AND validation`
5. `"algorithmic amplification" AND (political OR election) AND (Twitter OR Facebook OR TikTok OR YouTube)`

These families intentionally capture studies measuring separate links in the proposed evidence chain. Crossref is used for DOI metadata verification and targeted retrieval of titles identified through citation chasing. Google Scholar is a supplemental discovery source: run the same five strings, record date, exact query, the first 100 ranked results or all if fewer, and the ranking cutoff. Because Scholar's ranking and access can vary, report its results separately from the exhaustively paged OpenAlex set; do not describe Scholar as exhaustively searched.

## Platform and dataset sources

Search the public X information operations archive, Meta threat-report and indicator repository, Reddit suspicious accounts archive, and public transparency/research pages for TikTok and YouTube. For each, record the public index URL, access date, campaign/disclosure title, platform attribution wording, linked data availability, license, and whether the corpus has a defined denominator. Search open code/data repositories identified in eligible papers and disclosures. Distinguish a publisher's campaign claim from independently verified account operator identity. Archive only redistributable metadata and citations where source content is restricted.

## Citation chasing and deduplication

For each full-text-eligible paper, inspect references and OpenAlex citing works once. Record each added DOI/ID, parent paper, discovery date, and reason. Deduplicate first by normalized DOI, then OpenAlex ID, then manually by title and underlying dataset. Treat multiple papers using the same underlying participants, campaign archive, or platform experiment as one dataset ID for synthesis while preserving all publications as source records. Log every merge.

## Screening decision rules

A source enters full-text review if its title or abstract plausibly reports an empirical social-platform observation, platform enforcement corpus, or validation experiment relevant to any O/P/A/C/D/E/R/I claim. Ambiguous records advance; title-only exclusions require an explicit unrelated-topic or nonempirical reason. At full text, include only if platform, sampling/corpus basis, measured construct, and enough method detail to classify the construct are available. Keep method-only work as background, not an independent effect dataset. Record one primary exclusion reason per full-text exclusion: `not_social_platform`, `not_empirical`, `no_relevant_construct`, `insufficient_methods`, `duplicate_dataset`, `full_text_unavailable`, or `other_specified`.

Two reviewers independently screen a random 20% calibration sample from the deduplicated title/abstract set, stratified by query family; all uncertain or disputed decisions receive dual review. Log reviewer IDs, initial decisions, disagreement, adjudication, and rule changes before one-reviewer screening of the remainder. Full-text inclusion and the eight construct labels require two independent coders for every admitted dataset. Without that second coder, the map remains provisional and must not be reported as the registered review's final study count.

## Reporting and audit

Report records retrieved per source, duplicate publication records, title/abstract exclusions, full texts sought/unavailable/excluded, included publications, and independent dataset count. Keep distinct denominators for works, disclosures, campaigns, accounts, posts, and participants. Report protocol deviations and incomplete sources explicitly. Use PRISMA 2020 for flow and SWiM for outcomes that cannot be pooled. The 2026-09-19/20 scoping harvest and its source list are prior knowledge, not a confirmatory result.
