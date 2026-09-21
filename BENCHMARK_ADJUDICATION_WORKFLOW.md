# Independent benchmark adjudication

The provisional labels in `benchmark_cases.json` are single-reviewer judgments. The benchmark cannot pass its independent-adjudication gate until a second person completes the blinded 80-row packet and every disagreement receives a documented consensus label.

## Reviewer procedure

1. Give the independent reviewer only `outputs/01a0bc0d-6825-7f03-a634-a1c583c931ed/benchmark_independent_adjudication.xlsx` and public source access. Do not give them `benchmark_cases.json`, the provisional card, scorer fixtures, or another reviewer's decisions.
2. The reviewer opens each cited source and completes all yellow fields. `unknown` is required whenever the evidence does not settle the exact claim at the stated unit.
3. The reviewer completes the identifier, independence confirmation, conflict disclosure, and UTC completion time on `Summary`.
4. Save the returned workbook under a new name. Preserve the blank workbook and its hash.

The packet contains 10 cases × 8 claim dimensions. Its manifest and the workbook manifest confirm that provisional labels are withheld and no reviewer decisions are present in the distributed blank copy.

## Validate the returned workbook

```bash
python3 import_benchmark_adjudication.py \
  --workbook=/path/to/completed.xlsx \
  --packet=benchmark_adjudication/independent_reviewer_packet.jsonl \
  --out=benchmark_adjudication/independent_decisions.jsonl
```

The importer rejects missing decisions, invalid labels, unchanged source checks, blank rationales, missing timestamps or attestations, altered metadata, reordered rows, and extra rows. It writes a hash manifest beside a complete decision file and refuses to overwrite a differing result.

## Compare and resolve disagreements

```bash
node --experimental-strip-types compare_benchmark_adjudication.ts \
  --decisions=benchmark_adjudication/independent_decisions.jsonl
```

The comparison reports exact agreement overall and by claim and writes a disagreement queue. Differences are not automatically resolved in favor of the provisional label. A consensus reviewer must inspect each disagreement, record the final label and rationale, and preserve the adjudication trail before the release gate can change to true.

No completed reviewer decisions currently exist. The blank workbook and importer tests are workflow validation, not evidence of independent agreement.
