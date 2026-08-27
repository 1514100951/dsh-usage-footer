/**
 * dsh-usage-status — host plugin for the DSH web surface.
 *
 * Registers one loopback-only HTTP route on the shared webserver:
 *
 *   GET /usage-status
 *
 * The handler resolves credentials through the harness credential provider
 * (never reading the secret file directly) and answers:
 *
 *   {
 *     month, year,                       // server-local "current month" facts
 *     balance: {                         // from https://api.deepseek.com/user/balance
 *       isAvailable, currency,
 *       totalBalance, grantedBalance, toppedUpBalance
 *     } | null,
 *     todaySpend: {                      // balance-snapshot delta (estimate)
 *       amount, currency, day,
 *       baselineAt, source: "estimate"
 *     } | null,                          // snapshot persisted in
 *                                        // $DSH_HOME/<baseline file>
 *     local: {                           // local ledger priced with official table
 *       totals, today, month, byModel
 *     },
 *     official: {                        // platform.deepseek.com, only when
 *       monthCost, monthTokens,          // DEEPSEEK_PLATFORM_TOKEN is set
 *       todayCost, todayTokens, currency
 *     } | null,
 *     comparison: {                      // local vs official (only when official exists)
 *       month: { localCost, officialCost, diff, diffPercent, currency },
 *       today: { localCost, officialCost, diff, diffPercent, currency }
 *     } | null,
 *     usageAmount: <raw data> | null,    // kept for backward compatibility
 *     usageCost:   <raw data> | null,
 *     errors: string[]
 *   }
 *
 * DEEPSEEK_API_KEY      → official balance API (api.deepseek.com/user/balance).
 * DEEPSEEK_PLATFORM_TOKEN → private platform endpoints (platform.deepseek.com
 *                         /api/v0/usage/{amount,cost}), browser-session token
 *                         required; an API key is rejected there (code 40003).
 *
 * The local ledger subscribes to DSH `session/event` and prices every
 * `assistant/message` that carries usage with the official DeepSeek price
 * table (including the 2026-08-17 peak/off-peak policy). It is the primary
 * source for "token/金额消耗" and is designed to stay available after the
 * user can no longer log into the DeepSeek platform.
 *
 * Responses are cached for 30s so the browser footer polling stays cheap, and
 * the route refuses any non-loopback peer (the deployment binds 127.0.0.1).
 */

import z from "@deepseek-ai/schemastery";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { UsageLedger } from "./ledger.js";
import { fetchOfficialUsage } from "./platform.js";
import { costOf, priceAt, dayKey, monthKey, zeroCounts, addCounts } from "./pricing.js";

const ROUTE_PATH = "/usage-status";
const CACHE_TTL_MS = 30_000;
const FETCH_TIMEOUT_MS = 8_000;

const API_KEY_REF = "DEEPSEEK_API_KEY";
const PLATFORM_TOKEN_REF = "DEEPSEEK_PLATFORM_TOKEN";

/** User setting: the self-service on/off switch rendered in Settings → General. */
const USAGE_SETTINGS_NS = "usage-footer";
const USAGE_SETTINGS_SCHEMA = z.object({
  enabled: z.boolean().default(true)
});

/** Baseline snapshot file name under $DSH_HOME (day-start balance). */
const BASELINE_FILENAME = "usage-footer-balance-baseline.json";
/** Local ledger file name under $DSH_HOME/storages. */
const LEDGER_FILENAME = "usage-footer-ledger.json";
/** Sync baseline file name under $DSH_HOME/storages. */
const SYNC_FILENAME = "usage-footer-sync-baseline.json";

/** Beijing date key (UTC+8, no DST) for the daily baseline rollover. */
function beijingDateKey(ts = Date.now()) {
  return new Date(ts + 8 * 3600e3).toISOString().slice(0, 10);
}

function loadBaseline(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function saveBaseline(path, value) {
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(value, null, 2));
  } catch {
    /* best-effort persistence; the in-memory baseline still works */
  }
}

function loadSyncBaseline(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function saveSyncBaseline(path, value) {
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(value, null, 2));
  } catch {
    /* best-effort persistence */
  }
}

function round6(value) {
  return Math.round(value * 1e6) / 1e6;
}

function parseMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Today's spend estimate from a day-start balance snapshot.
 *
 * 注意：DeepSeek 的 `total_balance = topped_up_balance + granted_balance`，
 * 之前用“余额差 + 充值/赠送修正”会把消费完全抵消成 0。这里改为简单的
 * `max(0, 当天期初余额 − 当前余额)`，只作为没有平台 token 时的估算值；
 * 精确金额请以本地账本（`local`）或平台官方数据（`official`）为准。
 */
function computeTodaySpend(baselinePath, info, now) {
  const day = beijingDateKey(now);
  const currentTotal = parseMoney(info.total_balance);
  const baseline = loadBaseline(baselinePath);
  if (baseline === null || baseline.date !== day) {
    const next = {
      date: day,
      at: new Date(now).toISOString(),
      total: currentTotal,
      toppedUp: parseMoney(info.topped_up_balance),
      granted: parseMoney(info.granted_balance)
    };
    saveBaseline(baselinePath, next);
    return { amount: 0, currency: typeof info.currency === "string" ? info.currency : null, day, baselineAt: next.at, source: "estimate" };
  }
  const amount = Math.max(0, Math.round((baseline.total - currentTotal) * 100) / 100);
  return { amount, currency: typeof info.currency === "string" ? info.currency : null, day, baselineAt: baseline.at, source: "estimate" };
}

/** Accept only loopback peers: this route answers account data, never LAN peers. */
function isLoopback(address) {
  if (address === undefined) return false;
  if (address === "127.0.0.1" || address === "::1") return true;
  return /^::ffff:127\.0\.0\.1$/.test(address);
}

/** Bounded fetch returning parsed JSON, or a diagnostic object on failure. */
async function fetchJson(url, headers, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      return { failed: true, status: response.status };
    }
    return await response.json();
  } catch (error) {
    return { failed: true, status: 0, reason: String(error?.message ?? error) };
  } finally {
    clearTimeout(timer);
  }
}

function sendJson(res, code, value) {
  const body = JSON.stringify(value);
  res.writeHead(code, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body)
  });
  res.end(body);
}

/** 本地与官方“自同步起点以来的增量”对比。 */
function computeComparison(local, official, syncBaseline) {
  const now = Date.now();
  const currentDay = dayKey(now);
  const currentMonth = monthKey(now);
  const monthBase = syncBaseline !== null && syncBaseline.monthKey === currentMonth ? syncBaseline : null;
  const todayBase = syncBaseline !== null && syncBaseline.today === currentDay ? syncBaseline : null;
  const monthLocal = (local.month.cost ?? 0) - (monthBase?.localMonthCost ?? 0);
  const monthOfficial = official.monthCost - (monthBase?.officialMonthCost ?? 0);
  const todayLocal = (local.today.cost ?? 0) - (todayBase?.localTodayCost ?? 0);
  const todayOfficial = official.todayCost - (todayBase?.officialTodayCost ?? 0);
  return {
    month: {
      localCost: round6(monthLocal),
      officialCost: round6(monthOfficial),
      diff: round6(monthLocal - monthOfficial),
      diffPercent: monthOfficial > 0 ? ((monthLocal - monthOfficial) / monthOfficial) * 100 : null,
      currency: official.currency
    },
    today: {
      localCost: round6(todayLocal),
      officialCost: round6(todayOfficial),
      diff: round6(todayLocal - todayOfficial),
      diffPercent: todayOfficial > 0 ? ((todayLocal - todayOfficial) / todayOfficial) * 100 : null,
      currency: official.currency
    },
    syncedAt: syncBaseline?.syncedAt ?? null
  };
}

/** Query DeepSeek for the account figures this route publishes. */
async function queryUsageStatus(ctx, baselinePath, ledger, syncBaseline) {
  const now = new Date();
  const result = {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    balance: null,
    todaySpend: null,
    local: ledger.snapshot(),
    official: null,
    comparison: null,
    sync: syncBaseline ?? null,
    usageAmount: null,
    usageCost: null,
    errors: []
  };

  const apiKey = await ctx.credentials.resolve(API_KEY_REF).catch(() => undefined);
  if (apiKey?.value) {
    const balance = await fetchJson("https://api.deepseek.com/user/balance", {
      authorization: `Bearer ${apiKey.value}`,
      accept: "application/json"
    }, FETCH_TIMEOUT_MS);
    const info = balance?.balance_infos?.[0];
    if (info !== undefined) {
      result.balance = {
        isAvailable: balance.is_available === true,
        currency: typeof info.currency === "string" ? info.currency : null,
        totalBalance: String(info.total_balance ?? ""),
        grantedBalance: String(info.granted_balance ?? ""),
        toppedUpBalance: String(info.topped_up_balance ?? "")
      };
      if (baselinePath !== undefined) {
        result.todaySpend = computeTodaySpend(baselinePath, info, now.getTime());
      }
    } else {
      result.errors.push("balance-unavailable");
    }
  }

  const platformToken = await ctx.credentials.resolve(PLATFORM_TOKEN_REF).catch(() => undefined);
  if (platformToken?.value) {
    const official = await fetchOfficialUsage(platformToken.value, now);
    if (official !== null) {
      result.official = official;
      result.comparison = computeComparison(result.local, official, syncBaseline);
    } else {
      result.errors.push("official-usage-unavailable");
    }
  }

  return result;
}

export const name = "dsh-usage-footer";

/** 创建/更新“本地 vs 官方”同步起点。 */
async function createSyncBaseline(ctx, ledger, syncPath) {
  const platformToken = await ctx.credentials.resolve(PLATFORM_TOKEN_REF).catch(() => undefined);
  if (!platformToken?.value) return { ok: false, status: 400, error: "no-platform-token" };
  const now = new Date();
  const official = await fetchOfficialUsage(platformToken.value, now);
  if (official === null) return { ok: false, status: 502, error: "official-unavailable" };
  const local = ledger.snapshot();
  const baseline = {
    syncedAt: now.toISOString(),
    monthKey: monthKey(now.getTime()),
    today: dayKey(now.getTime()),
    localMonthCost: local.month.cost ?? 0,
    localMonthTokens: (local.month.inputTokens ?? 0) + (local.month.cacheReadTokens ?? 0) + (local.month.cacheWriteTokens ?? 0) + (local.month.outputTokens ?? 0),
    localTodayCost: local.today.cost ?? 0,
    localTodayTokens: (local.today.inputTokens ?? 0) + (local.today.cacheReadTokens ?? 0) + (local.today.cacheWriteTokens ?? 0) + (local.today.outputTokens ?? 0),
    officialMonthCost: official.monthCost,
    officialMonthTokens: official.monthTokens,
    officialTodayCost: official.todayCost,
    officialTodayTokens: official.todayTokens
  };
  saveSyncBaseline(syncPath, baseline);
  return { ok: true, status: 200, baseline };
}

export const inject = ["credentials", "webServer"];

export { computeTodaySpend, UsageLedger, costOf, priceAt, dayKey, monthKey, zeroCounts, addCounts, computeComparison, createSyncBaseline };

export function apply(ctx) {
  const cache = new Map(); // key -> { at, value }
  // Settings registration rides the optional-settings seam: absent settings
  // service, the feature simply stays always-on with no toggle surface.
  let usageScope;
  ctx.inject(["settings"], (settingsCtx) => {
    usageScope = settingsCtx.settings.register(USAGE_SETTINGS_NS, USAGE_SETTINGS_SCHEMA);
  });
  // Day-start balance snapshot path: $DSH_HOME/… when the home-path service
  // exists, else ~/.dsh/… as a fallback.
  let baselinePath = join(homedir(), ".dsh", BASELINE_FILENAME);
  let ledgerPath = join(homedir(), ".dsh", "storages", LEDGER_FILENAME);
  let syncPath = join(homedir(), ".dsh", "storages", SYNC_FILENAME);
  const ledger = new UsageLedger(ledgerPath);
  let syncBaseline = loadSyncBaseline(syncPath);
  ctx.inject(["dshHomePath"], (homeCtx) => {
    baselinePath = homeCtx.dshHomePath(BASELINE_FILENAME);
    ledgerPath = homeCtx.dshHomePath("storages", LEDGER_FILENAME);
    syncPath = homeCtx.dshHomePath("storages", SYNC_FILENAME);
    ledger.setPath(ledgerPath);
    syncBaseline = loadSyncBaseline(syncPath);
  });
  const headersBySession = new Map();

  // 实时记账：订阅 DSH 会话事件，对每条带 usage 的 assistant/message 计价。
  ctx.on("session/event", (session, event) => {
    try {
      if (usageScope !== undefined && usageScope.get().enabled === false) return;
      if (event?.type === "request/header" && event.data?.header?.config) {
        const header = event.data.header.config;
        if (typeof header.provider === "string" && typeof header.model === "string") {
          headersBySession.set(session.id, { provider: header.provider, model: header.model });
        }
        return;
      }
      if (event?.type !== "assistant/message") return;
      const data = event.data;
      if (data?.usage === void 0 || data.usage === null) return;
      const usage = data.usage;
      if (typeof usage.outputTokens !== "number" && typeof usage.inputTokens !== "number") return;
      const source = data.message?.source;
      const header = headersBySession.get(session.id);
      const provider = typeof source?.provider === "string" ? source.provider : header?.provider ?? "";
      const model = typeof source?.model === "string" ? source.model : header?.model ?? "unknown";
      const unit = priceAt(model, event.time ?? Date.now());
      const sample = costOf(usage, unit);
      ledger.record({
        sessionId: session.id,
        messageId: String(data.message?.id ?? `seq-${event.seq}`),
        time: event.time ?? Date.now(),
        provider,
        model,
        inputTokens: sample.inputTokens,
        cacheReadTokens: sample.cacheReadTokens,
        cacheWriteTokens: sample.cacheWriteTokens,
        outputTokens: sample.outputTokens,
        cost: sample.cost,
        costUsd: sample.costUsd
      });
    } catch (error) {
      ctx.logger?.warn?.(`[dsh-usage-footer] ledger record failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  ctx.effect(() => {
    const loopbackGuard = (req, res, next) => {
      const remote = req.socket?.remoteAddress ?? "";
      if (!isLoopback(remote)) {
        res.writeHead(403);
        res.end();
        return false;
      }
      return next();
    };
    const disposeStatusRoute = ctx.webServer.register({
      kind: "exact",
      path: ROUTE_PATH,
      handler: async (req, res) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          res.writeHead(405);
          res.end();
          return;
        }
        await loopbackGuard(req, res, async () => {
          if (usageScope !== undefined && usageScope.get().enabled === false) {
            sendJson(res, 200, { disabled: true });
            return;
          }
          const cached = cache.get("status");
          if (cached !== undefined && Date.now() - cached.at < CACHE_TTL_MS) {
            sendJson(res, 200, cached.value);
            return;
          }
          const value = await queryUsageStatus(ctx, baselinePath, ledger, syncBaseline);
          cache.set("status", { at: Date.now(), value });
          sendJson(res, 200, value);
        });
      }
    });
    const disposeSyncRoute = ctx.webServer.register({
      kind: "exact",
      path: "/usage-status/sync",
      handler: async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405);
          res.end();
          return;
        }
        await loopbackGuard(req, res, async () => {
          const result = await createSyncBaseline(ctx, ledger, syncPath);
          if (!result.ok) {
            sendJson(res, result.status, { ok: false, error: result.error });
            return;
          }
          syncBaseline = result.baseline;
          cache.clear();
          sendJson(res, 200, { ok: true, baseline: result.baseline });
        });
      }
    });
    return () => {
      disposeStatusRoute();
      disposeSyncRoute();
      cache.clear();
      ledger.dispose();
    };
  }, "usage-status: /usage-status routes");
}
