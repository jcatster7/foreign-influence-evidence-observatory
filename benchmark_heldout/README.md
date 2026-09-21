# Held-out benchmark intake

This directory contains the prospective, sealed-label held-out design registered in `registration/AMENDMENT_v0.4.0_HELDOUT.md`.

Candidate files are JSON Lines with one evidence-bundle record per line. Validate them against `candidate.schema.json` and run `assign_heldout_split.ts`. Reference labels and nonces must never appear in the candidate file. The `reference_commitment_sha256` is computed from the exact canonical reference-record bytes followed by a null byte and at least 128 bits of random nonce. The nonce remains private until predictions are frozen.

No real candidate pool, split, reference label, nonce, or prediction exists yet. Files produced from test fixtures must stay outside the repository.
