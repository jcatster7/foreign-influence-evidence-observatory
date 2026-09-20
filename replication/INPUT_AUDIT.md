# Origin-pilot inputs available for replication planning

Status: historical pilot frame recovered; **no new replication sample or result**. Audited 2026-09-20 UTC. The canonical iCloud files under `studies/foreign_origin_amplification_600/` remain `compressed,dataless`; reading `MANIFEST.md` timed out and a direct hydration request failed. Therefore these recovery copies cannot yet be byte-compared with the canonical study manifest.

| Recovery copy under `~/.codex/recovery/foreign_origin_amplification_600/` | SHA-256 | Checked structure |
| --- | --- | --- |
| `protocol.md` | `2379c0db6d754401e45b2c1bc46af433acf39babfa11c498156fd604b8bd7fb6` | States 20 targets, 50 posts, 12 fixed repost positions per post, and displayed-country categories. |
| `target_roster.csv` | `d8603e76455a921abb8fadfe34f57c6dfdb9643e591a52eab69a08a7e3a5205e` | 20 unique stable account IDs; 10 `far_left`, 10 `far_right`. The recovery script embeds this CSV and checks that exact hash. |
| `targets.csv` | `0be8affa0e186e31ba397a1906dbb6f1e9d7ebc78d06c1b05816dbf7ea496af9` | 50 unique post IDs; 25 per stratum. The recovery script reconstructs these rows from a local session record and checks that exact hash. |

The [public historical frame](historical_pilot_target_frame.csv) is a 20-row reduction of the recovered roster to stable ID, public handle, and pilot stratum, SHA-256 `0ad2f614bb0dd310cddf7ffc903b01e29141817728a0e1d9945644e1d5defb6f`. It excludes old bias scores, follower counts, and observations. It documents the prior sample frame and is **not** a newly validated roster. The recovery scripts and matching file sizes support provenance, but do not replace a readable canonical manifest or independent validation of the 2026 ratings and active profiles.

The original protocol used Ad Fontes score and category thresholds, current activity, a 30-day post window, deterministic third-post assignment, and fixed visible repost positions. A new replication must freeze its own target eligibility and rating date, window, seed, capture interface, replacement rules, and screenshot audit **before** looking at new origin panels. The historical 20 handles can be candidates, subject to current eligibility checks. If the roster or X interface cannot be validated, record that limitation and do not claim replication from the old 600 observations.

The [2026-09-20 access preflight](ACCESS_PREFLIGHT_2026-09-20.md) failed because the public About panel redirected to X login in the available signed-out browser. No new sample was drawn. Next gate: hydrate and read the canonical manifest, check recovery hashes against it, obtain an authorized X session that passes a fresh preflight, and obtain an independent second reviewer. Until those conditions hold, the low-cost protocol remains unexecuted and external spend remains $0.
