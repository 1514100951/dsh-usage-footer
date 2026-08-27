// Unit test for the balance-snapshot fallback in dsh-usage-status.
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
let r = computeTodaySpend(path, info(110), now);
console.log("first read:", JSON.stringify(r));
if (r.amount !== 0) throw new Error("first read must anchor at 0");

// 2. same-day consumption (realistic: total = toppedUp + granted)
r = computeTodaySpend(path, info(108.77, "100", "8.77"), now + 60_000);
console.log("spend 1.23:", r.amount);
if (r.amount !== 1.23) throw new Error("expected 1.23");

// 3. top-up inflates balance, so the estimate is clamped to 0
r = computeTodaySpend(path, info(113.42, "5", "0"), now + 120_000);
console.log("after top-up (+5):", r.amount);
if (r.amount !== 0) throw new Error("balance-delta estimate must not go negative");

// 4. next day rolls the baseline over to 0
const tomorrow = now + 26 * 3600e3; // may cross the Beijing day boundary depending on now
r = computeTodaySpend(path, info(108.77, "100", "8.77"), tomorrow);
console.log("next day:", JSON.stringify(r));
if (r.amount !== 0) throw new Error("day rollover must reset to 0");
const stored = JSON.parse(readFileSync(path, "utf8"));
if (stored.date === new Date(now + 8 * 3600e3).toISOString().slice(0, 10)) throw new Error("baseline date should have advanced");

// 5. corruption in the file re-anchors gracefully
writeFileSync(path, "{broken");
r = computeTodaySpend(path, info(108.77, "100", "8.77"), now + 5 * 60_000);
console.log("after corrupted file:", r.amount);
if (r.amount !== 0) throw new Error("corrupted file must re-anchor at 0");

rmSync(dir, { recursive: true, force: true });
console.log("ALL BASELINE TESTS PASSED");
