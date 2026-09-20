# X interface access preflight, 2026-09-20 UTC

Status: **failed before sampling; no replication observations collected**. This read-only check followed the [low-cost replication protocol](../LOW_COST_REPLICATION_PROTOCOL.md). The test account was `@AOC`, a public political account outside the historical publisher target frame; it is excluded from any analysis sample.

| Required check | Observed result |
| --- | --- |
| Browser and login state | Codex in-app browser, English interface, signed out of X. |
| Public profile | `https://x.com/AOC` rendered a profile and public post links. |
| Public About panel | Selecting `Joined April 2010` / `x.com/AOC/about` redirected to X's login flow. The displayed-country field could not be inspected. |
| Visible repost positions | Not tested after the required account-panel check failed. |
| Screenshot capture | Not attempted; no observation panel was available. |
| Access-control response | Login was required. No credentials were entered and no account was created. |
| External spend | $0. |

The planned replication must stop at this preflight gate. A valid collection run requires an authorized X session in which both repost positions and the public About panel are accessible, plus a prespecified roster, screenshot archive, and two independent reviewers. The old pilot's account data cannot substitute for this new capture. If access is later restored, run a fresh dated preflight on accounts excluded from the sample before freezing posts or inspecting origin panels.
