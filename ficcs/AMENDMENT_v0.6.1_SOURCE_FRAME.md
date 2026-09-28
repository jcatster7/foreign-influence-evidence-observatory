# FICCS source-frame ordering amendment

Version 0.6.1, 2026-09-27. Prospective amendment to [`v0.6.0-ficcs-preregistration`](https://github.com/jcatster7/foreign-influence-evidence-observatory/releases/tag/v0.6.0-ficcs-preregistration).

## Reason

The registered protocol says to assign a SHA-256-derived random key using a registered seed string, but it does not provide the seed or exact byte serialization. Without those details, source ordering would not be reproducible. This amendment supplies them before creating any FICCS source-frame record, sampling any claim, or coding any claim.

## Prospective state

At this amendment's freeze point:

- source-frame records: 0
- sampled corpus claims: 0
- independent claim codings: 0
- adjudicated claims: 0
- stress-test predictions: 0

Previously reviewed observatory sources remain prior knowledge and do not count as FICCS source-frame records until entered after this amendment under the rules below.

## Canonicalization

For each eligible source document:

1. Resolve redirects and record the stable HTTPS document URL controlled by the publishing institution when available.
2. Remove a fragment and known tracking parameters (`utm_*`, `gclid`, `fbclid`), preserving parameters needed to identify the document or language.
3. Lowercase only the URL scheme and host. Preserve path and retained query-string case.
4. Remove the default port and a trailing `/` unless the path is exactly `/`.
5. Sort retained query parameters first by name and then by value using Unicode code-point order.
6. Store the result as `canonical_url` in UTF-8 NFC normalization.

Documents with different URLs but substantively identical text receive one `duplicate_family_id`. The earliest accountable publication is the canonical document; later syndications remain in the disposition log but cannot add an independent primary claim.

## Registered order key

The exact seed string is:

`FICCS-v0.6.1-source-frame-order-2026-09-27`

For each record, compute:

`frozen_order_key = lowercase_hex(SHA-256(UTF8(seed + "\n" + source_type + "\n" + canonical_url)))`

There is no trailing newline. `source_type` is exactly one of `research`, `platform`, `government`, or `journalism`. Sort within each stratum by ascending `frozen_order_key`, breaking the practically impossible hash tie by ascending `canonical_url` Unicode code-point order.

## Frame freeze and sampling

Complete eligibility and duplicate-family decisions for all enumerated candidates before calculating order keys. Freeze the source-frame JSON Lines file and its SHA-256 before extracting primary claims. The frame may contain pending or excluded records, but only records marked `eligible` enter ordered sampling.

If a source becomes inaccessible after frame freeze, retain its position and mark the disposition; do not replace it by changing the hash order. Continue to the next eligible record. Newly discovered documents enter a separately versioned supplemental frame and cannot alter the confirmatory primary-corpus order without a prospective amendment.

All other v0.6.0 rules remain unchanged.
