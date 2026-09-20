# Prospective processing amendment: preserve missing OpenAlex titles

Prepared 2026-09-20 UTC after completion of the [v0.3.1 registered harvest](https://github.com/jcatster7/foreign-influence-evidence-observatory/releases/tag/v0.3.1-preregistration-amendment) and **before generation of a screening queue or any registered screening decisions**. The harvested raw responses and checkpoints remain unchanged.

The frozen `prepare_registered_queue.ts` halted at `q1_p007` because it treated a null `display_name` as an invalid work. An audit of all 96 saved raw pages found 160 returned rows with a null title. This is missing source metadata, not an eligibility decision. There is currently no registered screening queue and no registered reviewer decision.

Use `prepare_registered_queue_v032.ts` for this completed run. It retains every valid OpenAlex work ID with a null title as an empty title string in the queue, records the raw-row and final-record missing-title counts, and uses a nonempty title if another row for the same OpenAlex ID or DOI supplies one. The record stays `unscreened`; reviewers must retrieve missing metadata or advance an ambiguous record to full text under the frozen protocol. No title is invented and no record is excluded because its title is absent.

All five search queries, cutoff, acquired bytes, page hashes, DOI deduplication, calibration sampling hash and fraction, screening decisions, extraction rules, benchmark rules, and $20 cap remain unchanged. The original v0.3.1 script and packet remain available for audit. Publish this amendment and the exact new builder hash in an immutable release before running the amended builder. Document any later metadata recovery with a source locator and timestamp; do not overwrite the raw OpenAlex response.
