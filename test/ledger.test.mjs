// Unit tests for the local usage/cost ledger.
import { UsageLedger } from "../packages/dsh-usage-status/lib/ledger.js";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const dir = mkdtempSync(join(tmpdir(), "usage-ledger-"));
const path = join(dir, "ledger.json");
const ledger = new UsageLedger(path, 0);

const now = Date.now();
const base = {
  sessionId: "s1",
  time: now,
  provider: "deepseek",
  model: "deepseek-v4-pro",
  inputTokens: 1000,
  cacheReadTokens: 500,
  cacheWriteTokens: 200,
  outputTokens: 300,
  cost: 0.00675,
  costUsd: 0.00099
};

const first = ledger.record({ ...base, messageId: "m1" });
assert(first === true, "first record should be accepted");
const dup = ledger.record({ ...base, messageId: "m1" });
assert(dup === false, "duplicate message should be rejected");

const snapshot = ledger.snapshot();
assert(snapshot.totals.calls === 1, "totals calls should be 1");
assert(snapshot.totals.inputTokens === 1000, "totals input tokens");
assert(snapshot.today.cost === 0.00675, "today cost");
assert(snapshot.month.cost === 0.00675, "month cost");
assert(snapshot.byModel["deepseek-v4-pro"].calls === 1, "by model calls");

// Persist and reload.
ledger.flushSync();
assert(existsSync(path), "ledger file should exist");
const reloaded = new UsageLedger(path, 0);
assert(reloaded.snapshot().totals.calls === 1, "reloaded totals calls");
assert(reloaded.has("s1", "m1") === true, "reloaded seen key");

rmSync(dir, { recursive: true, force: true });
console.log("ALL LEDGER TESTS PASSED");
