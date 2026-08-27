// Unit test for the balance-snapshot math in dsh-usage-status.
import { computeTodaySpend } from "../lib/index.js";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "usage-baseline-"));
const path = join(dir, "baseline.json");
const now = Date.now();
const info = (total, toppedUp = "0", granted = "0") => ({
  total_balance: String(total),
  topped_up_balance: String(toppedUp),
  granted_balance: String(granted),
  currency: "CNY"
});

// 1. first read anchors the baseline, spend = 0
let r = computeTodaySpend(path, info(109.65), now);
console.log("first read:", JSON.stringify(r));
if (r.amount !== 0) throw new Error("first read must anchor at 0");

// 2. same-day consumption
r = computeTodaySpend(path, info(108.42), now + 60_000);
console.log("spend 1.23:", r.amount);
if (r.amount !== 1.23) throw new Error("expected 1.23");

// 3. top-up of 5 (no spend) — correction cancels it
r = computeTodaySpend(path, info(113.42, "5", "0"), now + 120_000);
console.log("after top-up (+5):", r.amount);
if (r.amount !== 1.23) throw new Error("top-up must not inflate spend");

// 4. top-up + more spending of 0.5
r = computeTodaySpend(path, info(112.92, "5", "0"), now + 180_000);
console.log("top-up + 0.5 spend:", r.amount);
if (r.amount !== 1.73) throw new Error("expected 1.73");

// 5. grant of 2 (no spend)
r = computeTodaySpend(path, info(114.92, "5", "2"), now + 240_000);
console.log("after grant (+2):", r.amount);
if (r.amount !== 1.73) throw new Error("grant must not inflate spend");

// 6. next day rolls the baseline over to 0
const tomorrow = now + 26 * 3600e3; // may cross the Beijing day boundary depending on now
r = computeTodaySpend(path, info(114.92, "5", "2"), tomorrow);
console.log("next day:", JSON.stringify(r));
if (r.amount !== 0) throw new Error("day rollover must reset to 0");
const stored = JSON.parse(readFileSync(path, "utf8"));
if (stored.date === new Date(now + 8 * 3600e3).toISOString().slice(0, 10)) throw new Error("baseline date should have advanced");

// 7. corruption in the file re-anchors gracefully
writeFileSync(path, "{broken");
r = computeTodaySpend(path, info(114.92, "5", "2"), now + 5 * 60_000);
console.log("after corrupted file:", r.amount);
if (r.amount !== 0) throw new Error("corrupted file must re-anchor at 0");

rmSync(dir, { recursive: true, force: true });
console.log("ALL BASELINE TESTS PASSED");
