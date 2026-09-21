# Observatory unblocking handoff

This is the minimum external work needed to advance the registered evidence map, benchmark, and replication. Do not send passwords, API keys, or private account credentials to reviewers or commit them to this repository.

## 1. Registered evidence-map screening

### Reviewer A

Send only:

- `outputs/01a0bc0d-6825-7f03-a634-a1c583c931ed/observatory_reviewer_A.xlsx`
- `REVIEWER_WORKFLOW.md`
- `SEARCH_PROTOCOL.md`

Expected SHA-256 for the blank workbook:

`07c4cdb93674f2107599c5965b16ccdf09936797324a885632787d86d158dbc0`

Reviewer A completes all 8,587 rows. Every row needs a decision, reason, UTC decision time, and source locator. Ambiguous records advance. Missing-title container records require constituent-work inspection and cannot be excluded merely because their OpenAlex title is blank.

### Reviewer B

Send only:

- `outputs/01a0bc0d-6825-7f03-a634-a1c583c931ed/observatory_reviewer_B_calibration.xlsx`
- `REVIEWER_WORKFLOW.md`
- `SEARCH_PROTOCOL.md`

Expected SHA-256 for the blank workbook:

`7b1884f33c256fe52636504cce15afd49d308f4d7059bd3a502cce210ce9470e`

Reviewer B completes the frozen 1,719-row calibration sample independently. Do not share Reviewer A's decisions or completed workbook until Reviewer B's initial decisions are returned and hash-locked.

Keep the real-name-to-alias mapping outside the public repository. No reviewer website account is required; the workbook contains source URLs.

### Return processing

Save returned workbooks under new names. Do not overwrite the blank copies. Validate each with `import_reviewer_workbook.py`, then run `compare_screening_decisions.ts`. The importer rejects partial or altered workbooks. The comparator creates a disagreement queue; it does not overwrite either initial judgment.

## 2. Independent benchmark adjudication

Send an independent reviewer:

- `outputs/01a0bc0d-6825-7f03-a634-a1c583c931ed/benchmark_independent_adjudication.xlsx`
- `BENCHMARK_ADJUDICATION_WORKFLOW.md`

Expected SHA-256 for the blank workbook:

`d611ff7f7a1bcc5da2d4d28a2f4160a77706a3cb44d9e8ed4600ac9bc34a889d`

Do not send `benchmark_cases.json`, scorer fixtures, the provisional benchmark card, or another reviewer's decisions. The workbook deliberately withholds all provisional labels. The reviewer must open each source, complete all 80 claim rows, and provide the identity alias, independence confirmation, conflict disclosure, and UTC completion time.

Validate the returned workbook with `import_benchmark_adjudication.py`. Run `compare_benchmark_adjudication.ts` only on the validated JSONL. Any disagreement requires a separate consensus label and rationale.

## 3. X replication access

Required website: `https://x.com/`

Justin must sign in personally in the browser session used for collection. Do not provide the X password, session cookie, recovery code, or two-factor token to Codex. No X API key or paid plan is required.

After sign-in, a fresh excluded-account preflight must confirm all of the following before sampling:

1. A public target profile loads.
2. Visible repost positions can be opened.
3. The public About panel displays a country, region, or explicit missing state without redirecting to login.
4. Permitted local screenshot capture works.
5. Browser, login state, language, URLs, and UTC time are logged.

If any check fails, stop without drawing the replication sample.

## Accounts and services requiring no action

| Service | Current state | Needed now |
| --- | --- | --- |
| OpenAlex | Registered acquisition complete using the supplied free key | Nothing |
| Crossref | Public metadata recovery complete | No account or key |
| GitHub | Repository and four immutable releases published | Nothing |
| OSF | Explicitly skipped | Nothing |
| Google Scholar | Supplemental manual source under the registered protocol | No login required for the current blocker |

## Current cost boundary

External spend is $0. The hard cap remains $20. Reviewer labor is an external human dependency but has no authorized cash allocation in the ledger. Do not purchase data, API access, or review services without recording the cost before commitment.
