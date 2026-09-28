# FICCS independent coding workflow

Version 1.0.0. This workflow prepares independent human coding; it does not create evidence decisions.

1. Assign the Reviewer A and Reviewer B workbooks to two people who have not seen each other's decisions.
2. Each reviewer enters an identifier, conflict disclosure, independence attestation, and completion timestamp on `Summary`.
3. Complete every yellow cell in `Constructs`, `Edges`, and `Consequences` after checking the cited source.
4. Preserve each returned workbook unchanged. Import it with `import_ficcs_coding.py`; the importer rejects altered identifiers, missing rows, invalid labels, and incomplete attestations.
5. Run `compare_ficcs_codings.ts` on the two validated JSON files. Freeze the originals and comparison report before adjudication.
6. A third reviewer or documented consensus process resolves the generated disagreement queue. Never overwrite either independent file.
7. Record one resolution per disagreement under `adjudication-resolution.schema.json`, then run `finalize_ficcs_adjudication.ts`. It embeds row-level hashes for both originals and rejects missing, duplicate, or surplus resolutions.
8. Run `analyze_ficcs_adjudicated.ts` only against the validated adjudicated file. It computes construct and edge summaries, unsupported assertion proportions, and institutional-consequence counts while explicitly refusing to label them a detector false-positive rate.
9. Run `fit_ficcs_confirmatory_model.py --decisions=<adjudicated.jsonl>`. It produces deterministic document-clustered bootstrap intervals and the preregistered binomial source-type model with document-clustered robust uncertainty. If the outcome has no variation or the model is singular, it records the failure and returns the registered stratified-estimate fallback.

The workbooks cover all eight constructs and the seven preregistered priority edges. Any additional directed relationship discovered during review must be recorded during adjudication with its source locator and rationale.
