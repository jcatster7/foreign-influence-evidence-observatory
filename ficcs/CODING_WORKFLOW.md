# FICCS independent coding workflow

Version 1.0.0. This workflow prepares independent human coding; it does not create evidence decisions.

1. Assign the Reviewer A and Reviewer B workbooks to two people who have not seen each other's decisions.
2. Each reviewer enters an identifier, conflict disclosure, independence attestation, and completion timestamp on `Summary`.
3. Complete every yellow cell in `Constructs`, `Edges`, and `Consequences` after checking the cited source.
4. Preserve each returned workbook unchanged. Import it with `import_ficcs_coding.py`; the importer rejects altered identifiers, missing rows, invalid labels, and incomplete attestations.
5. Run `compare_ficcs_codings.ts` on the two validated JSON files. Freeze the originals and comparison report before adjudication.
6. A third reviewer or documented consensus process resolves the generated disagreement queue. Never overwrite either independent file.

The workbooks cover all eight constructs and the seven preregistered priority edges. Any additional directed relationship discovered during review must be recorded during adjudication with its source locator and rationale.
