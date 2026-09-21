import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const FRAME_PATH = resolve(folder, 'replication', 'historical_pilot_target_frame.csv');
const FRAME_SHA256 = '0ad2f614bb0dd310cddf7ffc903b01e29141817728a0e1d9945644e1d5defb6f';
const WINDOW_START = Date.parse('2026-08-22T00:00:00Z');
const WINDOW_END = Date.parse('2026-09-20T23:59:59Z');
const SELECTED_RANKS = [1, 3, 5];
const REPOST_POSITIONS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];

type Stratum = 'far_left' | 'far_right';
type Post = { post_id: string; posted_at_utc: string; url: string; original_post: true; reply: false; repost: false };
type Inventory = { target_account_id: string; target_handle: string; pilot_stratum: Stratum; profile_checked_at_utc: string;
  profile_accessible: boolean; qualifying_posts: Post[]; exclusion_reason: string | null };

function argument(name: string): string {
  const prefix = `--${name}=`;
  const value = process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length);
  assert(value, `missing --${name}=...`);
  return resolve(value);
}

const hash = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex');
const inventoryPath = argument('inventory');
const outputPath = argument('out');
const summaryPath = argument('summary');
const frameBytes = readFileSync(FRAME_PATH);
assert.equal(hash(frameBytes), FRAME_SHA256, 'historical target frame changed');
const frameRows = frameBytes.toString('utf8').trim().split(/\r?\n/).slice(1).map((line) => {
  const [target_account_id, target_handle, pilot_stratum] = line.split(',');
  return { target_account_id, target_handle, pilot_stratum: pilot_stratum as Stratum };
});
assert.equal(frameRows.length, 20, 'expected 20 historical targets');
const frameById = new Map(frameRows.map((item) => [item.target_account_id, item]));

const inventoryBytes = readFileSync(inventoryPath);
const rows = inventoryBytes.toString('utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line) as Inventory & Record<string, unknown>);
assert.equal(rows.length, 20, 'inventory must contain all 20 historical targets');
const allowed = ['exclusion_reason', 'pilot_stratum', 'profile_accessible', 'profile_checked_at_utc', 'qualifying_posts', 'target_account_id', 'target_handle'];
const postAllowed = ['original_post', 'post_id', 'posted_at_utc', 'reply', 'repost', 'url'];
const seenTargets = new Set<string>();
const seenPosts = new Set<string>();
const plan: Array<Record<string, unknown>> = [];
const eligible: Record<Stratum, number> = { far_left: 0, far_right: 0 };

for (const item of rows) {
  assert.deepEqual(Object.keys(item).sort(), allowed, `inventory schema mismatch: ${item.target_account_id}`);
  assert(/^[0-9]+$/.test(item.target_account_id), `invalid target id: ${item.target_account_id}`);
  assert(/^[A-Za-z0-9_]{1,15}$/.test(item.target_handle), `invalid target handle: ${item.target_handle}`);
  assert(item.pilot_stratum === 'far_left' || item.pilot_stratum === 'far_right', `invalid stratum: ${item.target_account_id}`);
  assert.equal(typeof item.profile_accessible, 'boolean', `invalid profile access state: ${item.target_handle}`);
  assert(Array.isArray(item.qualifying_posts), `qualifying_posts must be an array: ${item.target_handle}`);
  assert(!seenTargets.has(item.target_account_id), `duplicate target: ${item.target_account_id}`);
  seenTargets.add(item.target_account_id);
  const frame = frameById.get(item.target_account_id);
  assert(frame, `target outside historical frame: ${item.target_account_id}`);
  assert.equal(item.target_handle, frame.target_handle, `handle mismatch: ${item.target_account_id}`);
  assert.equal(item.pilot_stratum, frame.pilot_stratum, `stratum mismatch: ${item.target_account_id}`);
  assert(!Number.isNaN(Date.parse(item.profile_checked_at_utc)) && item.profile_checked_at_utc.endsWith('Z'), `invalid profile time: ${item.target_handle}`);
  for (const post of item.qualifying_posts) {
    assert.deepEqual(Object.keys(post).sort(), postAllowed, `post schema mismatch: ${post.post_id}`);
    assert(/^[0-9]+$/.test(post.post_id), `invalid post id: ${post.post_id}`);
    assert(!seenPosts.has(post.post_id), `duplicate post id: ${post.post_id}`);
    seenPosts.add(post.post_id);
    const time = Date.parse(post.posted_at_utc);
    assert(!Number.isNaN(time) && post.posted_at_utc.endsWith('Z'), `invalid post time: ${post.post_id}`);
    assert(time >= WINDOW_START && time <= WINDOW_END, `post outside fixed window: ${post.post_id}`);
    assert.equal(post.url.toLowerCase(), `https://x.com/${item.target_handle}/status/${post.post_id}`.toLowerCase(), `post URL mismatch: ${post.post_id}`);
    assert.equal(post.original_post, true); assert.equal(post.reply, false); assert.equal(post.repost, false);
  }
  const sorted = [...item.qualifying_posts].sort((a, b) => Date.parse(b.posted_at_utc) - Date.parse(a.posted_at_utc) || b.post_id.localeCompare(a.post_id));
  assert.deepEqual(item.qualifying_posts.map((post) => post.post_id), sorted.map((post) => post.post_id), `posts not newest-first: ${item.target_handle}`);
  const isEligible = item.profile_accessible && item.qualifying_posts.length >= 5;
  if (isEligible) {
    assert.equal(item.exclusion_reason, null, `eligible target has exclusion reason: ${item.target_handle}`);
    eligible[item.pilot_stratum]++;
    for (const rank of SELECTED_RANKS) {
      const post = item.qualifying_posts[rank - 1];
      plan.push({ target_account_id: item.target_account_id, target_handle: item.target_handle,
        pilot_stratum: item.pilot_stratum, qualifying_rank: rank, post_id: post.post_id,
        posted_at_utc: post.posted_at_utc, post_url: post.url, repost_positions: REPOST_POSITIONS });
    }
  } else {
    assert(typeof item.exclusion_reason === 'string' && item.exclusion_reason.trim(), `ineligible target lacks exclusion reason: ${item.target_handle}`);
  }
}
assert.equal(seenTargets.size, frameById.size, 'inventory omits a historical target');
assert(eligible.far_left >= 8, `far_left sample gate failed: ${eligible.far_left} eligible targets`);
assert(eligible.far_right >= 8, `far_right sample gate failed: ${eligible.far_right} eligible targets`);

plan.sort((a, b) => String(a.pilot_stratum).localeCompare(String(b.pilot_stratum)) ||
  String(a.target_handle).localeCompare(String(b.target_handle)) || Number(a.qualifying_rank) - Number(b.qualifying_rank));
const output = plan.map((item) => JSON.stringify(item)).join('\n') + '\n';
writeFileSync(outputPath, output);
const summary = {
  protocol: 'v0.5.0-replication-sample-amendment',
  target_frame_sha256: FRAME_SHA256,
  inventory_sha256: hash(inventoryBytes),
  sample_plan_sha256: hash(output),
  fixed_post_window_utc: { start: '2026-08-22T00:00:00Z', end: '2026-09-20T23:59:59Z' },
  selected_qualifying_ranks: SELECTED_RANKS,
  selected_repost_positions: REPOST_POSITIONS,
  eligible_targets: eligible,
  selected_posts: plan.length,
  planned_events: plan.length * REPOST_POSITIONS.length,
  replacements_allowed: false,
  origin_fields_present_in_inventory: false,
  sample_frozen: true,
  observations_collected: 0,
};
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
