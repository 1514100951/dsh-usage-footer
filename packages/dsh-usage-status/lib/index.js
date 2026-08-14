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
 *     usageAmount: <raw data> | null,    // platform endpoint, only when
 *     usageCost:   <raw data> | null,    // DEEPSEEK_PLATFORM_TOKEN is set
 *     errors: string[]
 *   }
 *
 * DEEPSEEK_API_KEY      → official balance API (api.deepseek.com/user/balance).
 * DEEPSEEK_PLATFORM_TOKEN → private platform endpoints (platform.deepseek.com
 *                         /api/v0/usage/{amount,cost}), browser-session token
 *                         required; an API key is rejected there (code 40003).
 *
 * Responses are cached for 30s so the browser footer polling stays cheap, and
 * the route refuses any non-loopback peer (the deployment binds 127.0.0.1).
 */

import z from "@deepseek-ai/schemastery";

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

/** Query DeepSeek for the account figures this route publishes. */
async function queryUsageStatus(credentials) {
  const now = new Date();
  const result = {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    balance: null,
    usageAmount: null,
    usageCost: null,
    errors: []
  };

  const apiKey = await credentials.resolve(API_KEY_REF).catch(() => undefined);
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
    } else {
      result.errors.push("balance-unavailable");
    }
  }

  const platformToken = await credentials.resolve(PLATFORM_TOKEN_REF).catch(() => undefined);
  if (platformToken?.value) {
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const headers = {
      authorization: `Bearer ${platformToken.value}`,
      accept: "application/json"
    };
    const [amount, cost] = await Promise.all([
      fetchJson(`https://platform.deepseek.com/api/v0/usage/amount?month=${month}&year=${year}`, headers, FETCH_TIMEOUT_MS),
      fetchJson(`https://platform.deepseek.com/api/v0/usage/cost?month=${month}&year=${year}`, headers, FETCH_TIMEOUT_MS)
    ]);
    if (amount && !amount.failed && amount.code === 0) result.usageAmount = amount.data ?? amount;
    else result.errors.push("usage-amount-unavailable");
    if (cost && !cost.failed && cost.code === 0) result.usageCost = cost.data ?? cost;
    else result.errors.push("usage-cost-unavailable");
  }

  return result;
}

export const inject = ["credentials", "webServer"];

export function apply(ctx) {
  const cache = new Map(); // key -> { at, value }
  // Settings registration rides the optional-settings seam: absent settings
  // service, the feature simply stays always-on with no toggle surface.
  let usageScope;
  ctx.inject(["settings"], (settingsCtx) => {
    usageScope = settingsCtx.settings.register(USAGE_SETTINGS_NS, USAGE_SETTINGS_SCHEMA);
  });
  ctx.effect(() => {
    const disposeRoute = ctx.webServer.register({
      kind: "exact",
      path: ROUTE_PATH,
      handler: async (req, res) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          res.writeHead(405);
          res.end();
          return;
        }
        const remote = req.socket?.remoteAddress ?? "";
        if (!isLoopback(remote)) {
          res.writeHead(403);
          res.end();
          return;
        }
        if (usageScope !== undefined && usageScope.get().enabled === false) {
          sendJson(res, 200, { disabled: true });
          return;
        }
        const cached = cache.get("status");
        if (cached !== undefined && Date.now() - cached.at < CACHE_TTL_MS) {
          sendJson(res, 200, cached.value);
          return;
        }
        const value = await queryUsageStatus(ctx.credentials);
        cache.set("status", { at: Date.now(), value });
        sendJson(res, 200, value);
      }
    });
    return () => {
      disposeRoute();
      cache.clear();
    };
  }, "usage-status: /usage-status route");
}
