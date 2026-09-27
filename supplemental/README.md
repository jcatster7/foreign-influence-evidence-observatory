# Supplemental living literature update

This directory contains post-registration discoveries. It does not modify the frozen search corpus, screening queue, PRISMA denominator, provisional seed map, or benchmark labels.

`LIVING_UPDATE_2026-09-27.csv` records four studies discovered on 2026-09-27 from official ICWSM article pages. Each row applies the observatory's eight-construct boundary:

- `O`: account or operator origin
- `P`: operation attribution
- `A`: automation
- `C`: coordination
- `D`: deception
- `E`: observed feed delivery
- `R`: recommendation increment
- `I`: audience impact

The update supplies candidates for later duplicate checking and independent screening. It is not a final evidence-map addition. Article-page abstracts were reviewed; full-text extraction and independent coding remain pending.

Run `node --experimental-strip-types audit_living_update.ts` from the repository root to validate the controlled vocabulary, DOI and record uniqueness, source URLs, and required boundary notes.
