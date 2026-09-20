# Meta threat-index intake, 2026-09-20 UTC

Status: **registered supplemental-source leads, not included datasets or adjudicated construct labels**. This intake follows the [immutable v0.3.0 protocol](https://github.com/jcatster7/foreign-influence-evidence-observatory/releases/tag/v0.3.0-preregistration). The index is a partial indicator repository, not Meta's complete historical disclosure list or an account-level ground-truth file.

## Source and reproducibility

- Public index: <https://github.com/facebook/threat-research/blob/2d664e985e55fb754de7b1175f713e11f73cf8c8/index.json>
- Repository commit: `2d664e985e55fb754de7b1175f713e11f73cf8c8` (2026-08-27 09:09:47 UTC).
- Retrieved from `raw.githubusercontent.com/facebook/threat-research/main/index.json` on 2026-09-20 UTC; raw index SHA-256: `010f554aec9b191bcc780fba084582d6c725f0fb8a53c925d83417bb2cdbf5a0`.
- The index had 11 entries at retrieval. One entry was explicitly titled as coordinated inauthentic behavior from China and Russia. Other entries include malware and hacking indicators; this count is **not** the number of influence campaigns.
- The [repository README](https://github.com/facebook/threat-research) says its indicators are not a full historical view and that sharing or engaging with a listed link is insufficient to attribute an account to a campaign. Repository files are offered under its MIT license; the linked newsroom report and PDF need separate rights review before any redistribution.

## Candidate campaign records from the indexed CIB report

| Candidate ID | Source date and attribution wording | Public data and denominator | Review disposition |
| --- | --- | --- | --- |
| `meta-2022-09-china` | Meta's [2022-09-27 report](https://about.fb.com/news/2022/09/removing-coordinated-inauthentic-behavior-from-china-and-russia/) calls this a network that originated in China and describes cross-platform activity. | The index points to one indicator CSV for the **combined** China/Russia report. The newsroom article links a CIB PDF. The indicator file is not an account-level census or a feed-delivery denominator. | Candidate for full-text review; preserve Meta's campaign-level attribution and split from the Russian network only after checking the PDF and indicator rows. O, A, E, R, and I remain unknown at account/audience level. |
| `meta-2022-09-russia` | The same report calls this a network that originated in Russia; its December 15 update says Meta linked the network to two named companies. | Same combined indicator index entry. The report describes websites and cross-platform promotion, but public account, feed, and audience denominators need extraction from the PDF and any linked data. | Candidate for full-text review; test overlap with Doppelganger analyses and other platform disclosures before assigning a dataset ID. No account-level nationality, bot, recommendation, or impact inference from the index alone. |

Index entry ID: `2022_09_removing_coordinated_inauthentic_behavior_from_china_and_russia`; `reported_ds=2022-09-27`, `added_ds=2022-10-11`; one listed CSV path under `indicators/csv/`. The 2022 Meta report describes two unconnected networks, so report count and candidate campaign count have different denominators. The current intake does not reproduce indicator values or account identifiers.

The linked CIB PDF is approximately 27 MB. A 2026-09-20 retrieval attempt ended with a connection reset before a usable local copy was obtained; its full methods and denominators have **not** been inspected here. Next review: obtain and inspect that PDF and the indicator schema, record exact network-level counts and attribution methods, check campaign overlap, then obtain independent full-text and construct coding. No row in the final evidence map should be admitted from this intake alone.
