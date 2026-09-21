# Prospective benchmark amendment: sealed-label held-out evaluation

Prepared 2026-09-21 UTC after assembly of the ten prior-known provisional cases and **before selecting any held-out case, creating any held-out reference label, or scoring any held-out prediction**. This amendment extends only the benchmark protocol. It does not change the registered evidence-map search, screening, extraction, or synthesis rules.

## Purpose

The current cases are author-selected software checks and cannot estimate generalization. The final benchmark will add a prospectively selected held-out partition whose reference labels remain sealed until predictions are frozen. Dataset and collection-period groups, rather than rows, are assigned together.

## Candidate eligibility

A candidate is one evidence bundle for one exact O/P/A/C/D/E/R/I claim. It must have:

- a unique case ID and a dataset/time group;
- an inspectable evidence bundle with a SHA-256 digest;
- two independent labels and completed consensus, stored outside the public candidate file;
- a source-rights decision permitting the proposed repository use;
- a SHA-256 commitment to the canonical reference record plus a secret random nonce;
- no overlap with the ten prior-known cases, their dataset/time groups, or any source used to design a scorer fixture.

The public candidate file contains the commitment, never the label or nonce. Absence from a platform disclosure is not a negative label. `unknown` remains a reference outcome. No account-level accusation may enter through a proxy-only bundle.

## Pool closure

Freeze the candidate pool only after every admitted candidate has completed independent coding and rights review and the pool contains at least 24 distinct dataset/time groups, four platforms, and four primary claim dimensions. Do not stop because the observed labels, expected method performance, or tentative split appears favorable. Publish the candidate-file hash before assignment.

## Deterministic group split

Run the registered `assign_heldout_split.ts` without modification. It uses the public salt `foreign-influence-observatory-heldout-v0.4.0`, assigns exactly `ceil(25% × eligible groups)` to held out, and keeps every case from the same dataset/time group together. The deterministic coverage rule first selects groups from three platforms, then adds groups until at least three primary claims are represented, then fills remaining held-out positions by hash rank. The remaining groups form the development partition.

The script refuses candidate files containing reference labels or nonces and fails unless the minimum pool, platform, claim, coding, rights, and prior-known exclusion conditions hold. Preserve the candidate bytes, split output, summary, and hashes. Once a passing split is published, do not rerun it with a modified pool.

## Sealed prediction and reveal order

1. Publish the passing split manifest and evidence bundles without reference labels or nonces.
2. Run each evaluated method once on the held-out evidence bundles. Freeze its exact version, configuration, predictions, timestamp, and prediction-file SHA-256.
3. Only after all planned predictions are frozen, publish the canonical reference records and nonces.
4. Verify every published reference record against its preregistered commitment before scoring.
5. Score supported, contradicted, and unknown claim slots separately. Report assertion coverage, unsupported assertions, unknown promotions, and contradicted-claim assertions. Do not report a population false-positive rate without a separately justified verified-negative denominator.

## Release gate

Freezing this protocol does not itself establish a held-out split. `held_out_campaign_period_split_established` remains false until a real candidate pool passes the registered script and the resulting split and hashes are published. `unseen_predictions_scored` remains false until predictions are frozen before label reveal, commitments verify, and scoring completes.

This amendment uses public metadata and local computation. It changes no external-spend authorization; the project cap remains $20 and current spend remains $0.
