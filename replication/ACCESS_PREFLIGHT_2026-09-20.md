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

## Recheck, 2026-09-21 UTC

The same excluded test account and Codex in-app browser were checked again while signed out. The public profile and visible post interface rendered. Selecting `Joined April 2010` / `x.com/AOC/about` redirected to `x.com/i/jf/onboarding/web?...mode=login`. The required About panel remained inaccessible, so the check stopped before inspecting repost positions or collecting any observations. External spend remained $0.

## Authorized-session preflight, 2026-09-21 16:48 UTC

Status: **passed for sampling preparation; no target-roster account, sample, or origin observation inspected**.

The preflight used an authorized signed-in Chrome session in English. The signed-in account identifier is not recorded in the public repository. Both test accounts were selected before the check and are excluded from the historical target frame and any replication analysis.

| Required check | Observed result |
| --- | --- |
| Public profile | `https://x.com/AOC` loaded with public posts and post URLs. |
| Public About panel | `https://x.com/AOC/about` loaded without a login redirect. Its visible panel contained join, verification, affiliation, and username-history fields but no country/region field. This is a recordable field-absence outcome, not a US value. |
| Country-field rendering | `https://x.com/BBCWorld/about` loaded and visibly displayed `Account based in United Kingdom`, confirming that the field is exposed when present. |
| Visible repost positions | `https://x.com/AOC/status/2085031750896341295/retweets` loaded a visible ordered list of accounts under `Users who reposted this post`. |
| Screenshot capture | A local browser screenshot of the excluded-account repost list completed successfully. It is a preflight artifact and is not an analysis observation. |
| Interface language and login state | English; authorized signed-in Chrome session. |
| External spend | $0. |

The access preflight now passes. Sampling still cannot begin until an exact target eligibility rule, post window, selection positions, privacy boundary, and capture dates are frozen prospectively. Independent review remains required. The absent AOC country field also confirms that a loaded About panel without a country/region field must be coded as `unresolved` with reason `country_field_absent`, never as `displayed_us`.
