# Foreign Influence Claim Chain Standard

FICCS is a prospective study of how public institutions move from observable social-media evidence to claims about foreign influence. It treats each public claim as a chain of separately testable propositions rather than a single binary label.

## Status

Protocol version `0.1.0`, dated 2026-09-27, is frozen in the [immutable `v0.6.0-ficcs-preregistration` release](https://github.com/jcatster7/foreign-influence-evidence-observatory/releases/tag/v0.6.0-ficcs-preregistration). The [immutable v0.6.1 amendment](https://github.com/jcatster7/foreign-influence-evidence-observatory/releases/tag/v0.6.1-ficcs-source-frame-amendment) supplies the omitted source-ordering seed and byte serialization. Both releases preceded any source-frame record, claim, independent coding, adjudication, or stress-test prediction.

## Files

- `PREREGISTRATION.md`: research questions, sampling plan, coding rules, analyses, and release gates.
- `claim.schema.json`: machine-readable schema for one public claim and its evidence chain.
- `source_frame.schema.json`: schema for candidate-source enumeration before claim sampling.
- `REGISTRATION_STATUS.json`: release timestamp, commit, immutability state, and packet digest.
- `AMENDMENT_v0.6.1_SOURCE_FRAME.md`: prospective source canonicalization and deterministic ordering specification.
- `source_candidates_v1.jsonl`: post-registration candidate enumeration; every record remains pending and has no ordering key.
- `source_preflight_v1.jsonl`: one access result, resolved URL, response digest, and retrieval timestamp for every candidate; it stores no source body text.

The candidate file is not the frozen source frame. Eligibility, publication metadata, canonical URLs, and duplicate families must be verified before running the registered frame builder. Run `node --experimental-strip-types audit_ficcs_candidates.ts` from the repository root to confirm that no sampling order or eligibility decision has been created prematurely.

Run `node --experimental-strip-types audit_ficcs_preflight.ts` to verify complete preflight coverage. A non-success response records an access-control or network observation from the automated client; it is not itself an eligibility decision. Such records require verification through an inspectable publisher page, archive, or metadata source before disposition.

The existing observatory provides definitions and prior-known examples. Those materials are development inputs, not confirmatory FICCS observations.
