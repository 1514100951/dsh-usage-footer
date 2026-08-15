// Unit tests for the local-vs-official sync baseline comparison.
import { computeComparison, dayKey, monthKey } from "../packages/dsh-usage-status/lib/index.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const now = Date.now();
const official = {
  monthCost: 100,
  monthTokens: 1_000_000,
  todayCost: 20,
  todayTokens: 200_000,
  currency: "CNY"
};

const local = {
  month: { cost: 10, inputTokens: 100, cacheReadTokens: 900, cacheWriteTokens: 0, outputTokens: 200 },
  today: { cost: 2, inputTokens: 20, cacheReadTokens: 180, cacheWriteTokens: 0, outputTokens: 40 }
};

// No baseline: compare raw cumulative values.
const raw = computeComparison(local, official, null);
assert(raw.month.localCost === 10, "raw month local cost");
assert(raw.month.officialCost === 100, "raw month official cost");
assert(raw.today.localCost === 2, "raw today local cost");
assert(raw.today.officialCost === 20, "raw today official cost");

// With a baseline: only the delta since sync is compared.
const baseline = {
  syncedAt: new Date(now).toISOString(),
  monthKey: monthKey(now),
  today: dayKey(now),
  localMonthCost: 8,
  localMonthTokens: 1000,
  localTodayCost: 1,
  localTodayTokens: 100,
  officialMonthCost: 90,
  officialMonthTokens: 900_000,
  officialTodayCost: 18,
  officialTodayTokens: 180_000
};
const delta = computeComparison(local, official, baseline);
assert(delta.month.localCost === 2, "delta month local cost should be 10 - 8");
assert(delta.month.officialCost === 10, "delta month official cost should be 100 - 90");
assert(delta.today.localCost === 1, "delta today local cost should be 2 - 1");
assert(delta.today.officialCost === 2, "delta today official cost should be 20 - 18");
assert(delta.syncedAt === baseline.syncedAt, "syncedAt exposed");

// Stale baseline from a previous month should be ignored.
const stale = { ...baseline, monthKey: "2026-07", today: "2026-07-01" };
const staleDelta = computeComparison(local, official, stale);
assert(staleDelta.month.localCost === 10, "stale month baseline should be ignored");
assert(staleDelta.today.localCost === 2, "stale today baseline should be ignored");

console.log("ALL SYNC TESTS PASSED");
