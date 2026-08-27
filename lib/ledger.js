/**
 * 本地用量/费用账本。
 *
 * 订阅 DSH `session/event`，对每条带 usage 的 `assistant/message` 按官方价格
 * 引擎计价，累计到内存，并持久化到 `$DSH_HOME/storages/usage-footer-ledger.json`。
 *
 * 幂等：以 `sessionId + messageId` 为唯一键，DSH 重启后如果重放历史事件也不会
 * 重复累计。当前版本保存聚合结果与已见键；后续如需“改价后重估历史”，可扩展为
 * 保存逐条流水。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { dirname } from "node:path";
import { dayKey, monthKey, zeroCounts, addCounts } from "./pricing.js";

const LEDGER_VERSION = 1;

export class UsageLedger {
  constructor(path, debounceMs = 1000) {
    this.path = path;
    this.debounceMs = debounceMs;
    this.seenKeys = new Set();
    this.totals = zeroCounts();
    this.byDay = new Map();
    this.byModel = new Map();
    this.writeTimer = null;
    this.load();
  }

  /** 从磁盘加载。 */
  load() {
    try {
      if (!existsSync(this.path)) return;
      const raw = JSON.parse(readFileSync(this.path, "utf8"));
      if (raw?.version !== LEDGER_VERSION) return;
      if (Array.isArray(raw.seenKeys)) this.seenKeys = new Set(raw.seenKeys);
      if (raw.totals && typeof raw.totals === "object") this.totals = { ...zeroCounts(), ...raw.totals };
      if (raw.byDay && typeof raw.byDay === "object") {
        this.byDay = new Map(Object.entries(raw.byDay).map(([k, v]) => [k, { ...zeroCounts(), ...v }]));
      }
      if (raw.byModel && typeof raw.byModel === "object") {
        this.byModel = new Map(Object.entries(raw.byModel).map(([k, v]) => [k, { ...zeroCounts(), ...v }]));
      }
    } catch {
      // 账本损坏时从空账本开始，不阻断启动。
    }
  }

  /** 是否已记录过该消息。 */
  has(sessionId, messageId) {
    return this.seenKeys.has(`${sessionId}\n${messageId}`);
  }

  /** 更新持久化路径（例如 dshHomePath 服务就绪后）。 */
  setPath(path) {
    if (path === this.path) return;
    this.path = path;
    if (this.seenKeys.size === 0 && this.totals.calls === 0) this.load();
  }

  /** 记一笔（幂等）。 */
  record(entry) {
    const key = `${entry.sessionId}\n${entry.messageId}`;
    if (this.seenKeys.has(key)) return false;
    this.seenKeys.add(key);

    addCounts(this.totals, entry);
    const day = dayKey(entry.time);
    const dayCounts = this.byDay.get(day) ?? zeroCounts();
    addCounts(dayCounts, entry);
    this.byDay.set(day, dayCounts);

    const model = entry.model || "unknown";
    const modelCounts = this.byModel.get(model) ?? zeroCounts();
    addCounts(modelCounts, entry);
    this.byModel.set(model, modelCounts);

    this.scheduleWrite();
    return true;
  }

  /** 聚合视图。 */
  snapshot() {
    const now = Date.now();
    const todayKey = dayKey(now);
    const monthKeyValue = monthKey(now);
    const today = this.byDay.get(todayKey) ?? zeroCounts();
    const month = zeroCounts();
    for (const [key, counts] of this.byDay) {
      if (key.startsWith(`${monthKeyValue}-`)) addCounts(month, counts);
    }
    return {
      totals: { ...this.totals },
      today: { date: todayKey, ...today },
      month: { key: monthKeyValue, ...month },
      byModel: Object.fromEntries([...this.byModel.entries()].sort((a, b) => b[1].cost - a[1].cost))
    };
  }

  /** 防抖写盘。 */
  scheduleWrite() {
    if (this.writeTimer !== null) return;
    this.writeTimer = setTimeout(() => {
      this.writeTimer = null;
      this.flushSync();
    }, this.debounceMs);
    if (typeof this.writeTimer.unref === "function") this.writeTimer.unref();
  }

  /** 立即同步落盘。 */
  flushSync() {
    try {
      mkdirSync(dirname(this.path), { recursive: true });
      const body = JSON.stringify({
        version: LEDGER_VERSION,
        seenKeys: [...this.seenKeys],
        totals: this.totals,
        byDay: Object.fromEntries(this.byDay),
        byModel: Object.fromEntries(this.byModel)
      }, null, 2);
      const tmp = `${this.path}.tmp`;
      writeFileSync(tmp, body, "utf8");
      renameSync(tmp, this.path);
    } catch {
      // best-effort
    }
  }

  /** 停止定时器并落盘。 */
  dispose() {
    if (this.writeTimer !== null) {
      clearTimeout(this.writeTimer);
      this.writeTimer = null;
    }
    this.flushSync();
  }
}
