# Foreign Influence Claim Chain Standard

FICCS is a prospective study of how public institutions move from observable social-media evidence to claims about foreign influence. It treats each public claim as a chain of separately testable propositions rather than a single binary label.

## Status

Protocol version `0.1.0`, dated 2026-09-27, is frozen in the [immutable `v0.6.0-ficcs-preregistration` release](https://github.com/jcatster7/foreign-influence-evidence-observatory/releases/tag/v0.6.0-ficcs-preregistration). The [immutable v0.6.1 amendment](https://github.com/jcatster7/foreign-influence-evidence-observatory/releases/tag/v0.6.1-ficcs-source-frame-amendment) supplies the omitted source-ordering seed and byte serialization. The [immutable v0.7.0 source-frame release](https://github.com/jcatster7/foreign-influence-evidence-observatory/releases/tag/v0.7.0-ficcs-source-frame-freeze) freezes 60 eligible documents before any claim extraction, independent coding, adjudication, or stress-test prediction.

## Files

- `PREREGISTRATION.md`: research questions, sampling plan, coding rules, analyses, and release gates.
- `claim.schema.json`: machine-readable schema for one public claim and its evidence chain.
- `source_frame.schema.json`: schema for candidate-source enumeration before claim sampling.
- `REGISTRATION_STATUS.json`: release timestamp, commit, immutability state, and packet digest.
- `AMENDMENT_v0.6.1_SOURCE_FRAME.md`: prospective source canonicalization and deterministic ordering specification.
- `source_candidates_v1.jsonl`: 62 enumerated candidates with 60 eligible and two documented exclusions; it retains null ordering keys as the pre-freeze disposition file.
- `source_preflight_v1.jsonl`: one access result, resolved URL, response digest, and retrieval timestamp for every candidate; it stores no source body text.
- `source_eligibility_v1.jsonl`: screening audit trail, including reviewer identity, verification method, basis, and an explicit statement that no claim coding occurred.
- `source_frame_v1.jsonl`: immutable, deterministically ordered source frame containing all eligible and excluded dispositions.
- `SOURCE_FRAME_STATUS.json`: immutable release identity and verified local and release-asset digests.
- `claim_selection_queue_v1.jsonl`: five complete round-robin passes over the frozen eligible frame; traversal continues until each stratum has 25 selected claims or a document is recorded as exhausted.
- `claim_extraction.schema.json`: pre-coding schema that keeps verbatim claim selection separate from evidence decisions.
- `claim_extractions_v1.jsonl`: source-located atomic claims selected so far; every record explicitly states that independent coding has not started.

The candidate file is the pre-order disposition record and is not used directly for sampling. Run `node --experimental-strip-types audit_ficcs_candidates.ts` and `node --experimental-strip-types audit_ficcs_eligibility.ts` to verify complete dispositions and the 60-document minimum. Run `node --experimental-strip-types audit_ficcs_source_frame.ts` to independently recompute every registered order key and the frozen frame digest.

Run `node --experimental-strip-types audit_ficcs_preflight.ts` to verify complete preflight coverage. A non-success response records an access-control or network observation from the automated client; it is not itself an eligibility decision. Such records require verification through an inspectable publisher page, archive, or metadata source before disposition.

Run `node --experimental-strip-types audit_ficcs_claim_queue.ts` to verify round-robin traversal and `node --experimental-strip-types audit_ficcs_extractions.ts` to verify source-frame linkage, quotation limits, atomic-claim metadata, and the separation between selection and independent coding.

The existing observatory provides definitions and prior-known examples. Those materials are development inputs, not confirmatory FICCS observations.
