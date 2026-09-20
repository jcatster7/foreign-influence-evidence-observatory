# Independent screening workflow

Status: implementation guide for the frozen [search protocol](SEARCH_PROTOCOL.md). A complete registered OpenAlex queue and reviewer packets now exist under `searches/registered_openalex_2026-09-20_v0.3.1-preregistration-amendment/`, following the [missing-title processing amendment](registration/AMENDMENT_v0.3.2.md). No reviewer decisions exist yet. The earlier partial queue is for practice only and must never be reported as the registered review.

## Packet creation

After `prepare_registered_queue.ts` finishes, use its `screening_queue.jsonl` and `screening_queue_summary.json`:

```bash
node --experimental-strip-types make_reviewer_packets.ts --queue=/absolute/path/screening_queue.jsonl --summary=/absolute/path/screening_queue_summary.json --out-dir=/absolute/path/reviewer_packets
```

The generator checks the complete registered-queue status, queue SHA-256, unique record keys, row count, and the 20% calibration count in each of five primary-query strata. It writes the same deterministic shuffled order on every run, excluding the priority score and calibration flag from reviewer records. Reviewer A receives all rows; reviewer B receives the frozen calibration rows. The manifest records both packet hashes. Existing differing packets cause an error. Reviewer aliases are `A` and `B`; keep any real-name mapping outside the public repository.

The practice mode accepts only the partial preregistration queue and marks its output `practice_only`:

```bash
node --experimental-strip-types make_reviewer_packets.ts --queue=searches/openalex_partial_screening_queue.jsonl --summary=searches/openalex_partial_screening_queue_summary.json --out-dir=/tmp/observatory-practice-review --practice
```

The current practice queue produces 7,986 A records and 1,599 B records; 131 lack titles. These are workflow diagnostics, not eligible-study counts. Missing titles or abstracts require metadata retrieval or advancement to full text, with the source and reason logged. They are never silently excluded.

## Decisions and adjudication

Reviewers work independently until their initial decisions are locked. Each decision is one JSONL object with `record_key`, `reviewer_id`, `stage`, `decision`, `reason`, `decided_at_utc`, and `source_locator`, matching `audit_screening.ts`. At title/abstract stage, decisions are `retrieve_full_text`, `exclude`, or `background_method`. Use the exact exclusion rules in `SEARCH_PROTOCOL.md`. An ambiguous record advances. A title-only exclusion needs a specific unrelated-topic or nonempirical reason. A machine score never excludes a record.

After both calibration packets are complete, compare decisions and log disagreements, a third adjudication decision where needed, and any rule clarification before screening the rest. Give reviewer B every uncertain or disputed non-calibration record. Full-text inclusion and all eight construct labels require two independent coders for every admitted dataset. Keep original decisions and an adjudicated result; preserve publication-to-dataset merge decisions and risk-of-bias reasons. The platform disclosure and citation-chasing sources need parallel intake and full-text review before a final PRISMA flow or map.

Run `audit_screening.ts` with the registered queue, summary, and combined decision JSONL to verify the indexed screening gate. Its `ready_for_final_study_count` flag remains false because supplemental sources, dataset merges, and dual-coded extractions require separate verification. Do not publish a final study count or benchmark performance from these packets alone.

## Resource boundary

The cash budget remains $20 or less. Independent reviewer time is the main bottleneck and is not represented by the $0 external-spend ledger. If no second reviewer is available, release only a clearly labeled provisional map and disclose the unfulfilled preregistered gate.
