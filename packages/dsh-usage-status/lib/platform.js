/**
 * DeepSeek Platform 私有用量接口客户端。
 *
 * 仅在配置了 `DEEPSEEK_PLATFORM_TOKEN` 时使用，用于和本地账本做对比校验。
 * 这些接口是 platform.deepseek.com 控制台使用的私有接口，可能随时变化。
 */
const PLATFORM_USAGE_URL = "https://platform.deepseek.com/api/v0/usage";

/** 北京日期键（UTC+8，无夏令时），与 DeepSeek 平台日期口径一致。 */
function beijingDateKey(ts = Date.now()) {
  return new Date(ts + 8 * 3600e3).toISOString().slice(0, 10);
}

/** 平台接口请求头（与浏览器控制台请求保持一致，提高可用性）。 */
function platformHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    accept: "application/json",
    "x-app-version": "1.0.0",
    origin: "https://platform.deepseek.com",
    referer: "https://platform.deepseek.com/usage"
  };
}

function toFinite(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

function isTokenType(type) {
  if (typeof type !== "string") return false;
  return type.includes("TOKEN");
}

/** 从 amount 的 `usage` 数组中汇总 token 数（排除 REQUEST 等非 token 类型）。 */
function sumTokens(usageList) {
  let total = 0;
  for (const item of usageList || []) {
    if (!item || typeof item !== "object") continue;
    if (!isTokenType(item.type)) continue;
    const value = toFinite(item.amount);
    if (Number.isFinite(value)) total += value;
  }
  return total;
}

/** 从 cost 的 `usage` 数组中汇总金额。 */
function sumCost(usageList) {
  let total = 0;
  for (const item of usageList || []) {
    if (!item || typeof item !== "object") continue;
    const value = toFinite(item.cost ?? item.amount);
    if (Number.isFinite(value)) total += value;
  }
  return total;
}

/** 取 `biz_data` 容器：amount 接口是对象，cost 接口是数组。 */
function bizContainer(raw) {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * 解析一次 amount/cost 响应中的总览与按日数据。
 * @param payload - 平台接口 JSON。
 * @param kind - 'amount' | 'cost'
 * @returns {{ currency?: string, total: number, days: Map<string, number> }}
 */
function parseBiz(payload, kind) {
  const biz = bizContainer(payload?.data?.biz_data);
  if (!biz || typeof biz !== "object") return null;
  const totalArr = Array.isArray(biz.total) ? biz.total : [];
  const days = Array.isArray(biz.days) ? biz.days : [];
  let total = 0;
  const byDate = new Map();
  const sum = kind === "amount" ? sumTokens : sumCost;
  for (const modelEntry of totalArr) {
    if (!modelEntry || typeof modelEntry !== "object") continue;
    total += sum(modelEntry.usage);
  }
  for (const day of days) {
    if (!day || typeof day !== "object" || typeof day.date !== "string") continue;
    let dayTotal = 0;
    for (const modelEntry of day.data || []) {
      if (!modelEntry || typeof modelEntry !== "object") continue;
      dayTotal += sum(modelEntry.usage);
    }
    byDate.set(day.date, dayTotal);
  }
  return {
    currency: typeof biz.currency === "string" ? biz.currency : undefined,
    total,
    byDate
  };
}

/**
 * 拉取并解析平台本月 amount/cost。
 * @returns 成功时返回 `{ monthCost, monthTokens, todayCost, todayTokens, currency }`，
 *          任一接口失败返回 `null`。
 */
export async function fetchOfficialUsage(token, now = new Date()) {
  const beijing = beijingDateKey(now.getTime());
  const year = Number(beijing.slice(0, 4));
  const month = Number(beijing.slice(5, 7));
  const headers = platformHeaders(token);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const [amountResp, costResp] = await Promise.all([
      fetch(`${PLATFORM_USAGE_URL}/amount?month=${month}&year=${year}`, { headers, signal: controller.signal }),
      fetch(`${PLATFORM_USAGE_URL}/cost?month=${month}&year=${year}`, { headers, signal: controller.signal })
    ]);
    if (!amountResp.ok || !costResp.ok) return null;
    const [amountJson, costJson] = await Promise.all([amountResp.json(), costResp.json()]);
    if (amountJson?.code !== 0 || costJson?.code !== 0) return null;
    const amount = parseBiz(amountJson, "amount");
    const cost = parseBiz(costJson, "cost");
    if (amount === null || cost === null) return null;

    const today = beijing;
    return {
      monthCost: Math.round(cost.total * 1e6) / 1e6,
      monthTokens: Math.round(amount.total),
      todayCost: Math.round((cost.byDate.get(today) ?? 0) * 1e6) / 1e6,
      todayTokens: Math.round(amount.byDate.get(today) ?? 0),
      currency: cost.currency ?? "CNY"
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
