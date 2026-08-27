// Unit tests for the official DeepSeek pricing engine used by the local ledger.
import { priceAt, costOf, dayKey, monthKey, OFFICIAL_PRICING_POLICIES } from "../lib/pricing.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Beijing 2026-08-15 12:00 = 2026-08-15T04:00:00Z, before peak pricing rollout.
const beforeRollout = Date.UTC(2026, 7, 15, 4, 0, 0);
// Beijing 2026-08-17 10:00 = 2026-08-17T02:00:00Z, peak hour after rollout.
const peakAfterRollout = Date.UTC(2026, 7, 17, 2, 0, 0);
// Beijing 2026-08-17 13:00 = 2026-08-17T05:00:00Z, off-peak after rollout.
const offPeakAfterRollout = Date.UTC(2026, 7, 17, 5, 0, 0);

const proBefore = priceAt("deepseek-v4-pro", beforeRollout);
assert(proBefore.cny.input === 3, "pre-rollout pro input should be 3 CNY");
assert(proBefore.cny.cacheRead === 0.025, "pre-rollout pro cache read should be 0.025 CNY");
assert(proBefore.cny.output === 6, "pre-rollout pro output should be 6 CNY");
assert(proBefore.mode === "flat", "pre-rollout should be flat");

const proPeak = priceAt("deepseek-v4-pro", peakAfterRollout);
assert(proPeak.cny.input === 9, "peak pro input should be 9 CNY");
assert(proPeak.cny.cacheRead === 0.3, "peak pro cache read should be 0.3 CNY");
assert(proPeak.cny.output === 27, "peak pro output should be 27 CNY");
assert(proPeak.mode === "peak", "peak should be peak");

const proOff = priceAt("deepseek-v4-pro", offPeakAfterRollout);
assert(proOff.cny.input === 4.5, "off-peak pro input should be 4.5 CNY");
assert(proOff.cny.cacheRead === 0.15, "off-peak pro cache read should be 0.15 CNY");
assert(proOff.cny.output === 13.5, "off-peak pro output should be 13.5 CNY");
assert(proOff.mode === "offPeak", "off-peak should be offPeak");

const flashPeak = priceAt("deepseek-v4-flash", peakAfterRollout);
assert(flashPeak.cny.input === 3, "peak flash input should be 3 CNY");
assert(flashPeak.cny.output === 9, "peak flash output should be 9 CNY");

// costOf: cacheWrite is billed as cache-miss input.
const usage = { uncachedInputTokens: 1000, cacheReadTokens: 500, cacheWriteTokens: 200, outputTokens: 300 };
const sample = costOf(usage, proOff);
assert(sample.inputTokens === 1000, "input tokens preserved");
assert(sample.cacheWriteTokens === 200, "cache write tokens preserved");
const expectedCost = ((1000 + 200) * 4.5 + 500 * 0.15 + 300 * 13.5) / 1e6;
assert(Math.abs(sample.cost - expectedCost) < 1e-12, `cost mismatch: ${sample.cost} vs ${expectedCost}`);

// Date keys use the server local timezone (same as the ledger day rollover).
assert(typeof dayKey(Date.now()) === "string" && dayKey(Date.now()).length === 10, "dayKey format");
assert(monthKey(Date.now()).length === 7, "monthKey format");
assert(Array.isArray(OFFICIAL_PRICING_POLICIES) && OFFICIAL_PRICING_POLICIES.length >= 3, "pricing policies present");

console.log("ALL PRICING TESTS PASSED");
