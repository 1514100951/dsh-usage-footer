window.__ModuleLoader__.load({
	id: "dsh-client-ui-usage-footer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		var react = require("react");
		var react_jsx_runtime = require("react/jsx-runtime");
		var runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		var primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		var jsx = react_jsx_runtime.jsx;
		var jsxs = react_jsx_runtime.jsxs;
		var Fragment = react_jsx_runtime.Fragment;
		//#region UsageWidget.css
		const css = ".uW_root{position:fixed;z-index:60;right:18px;bottom:24px}.uW_button{position:relative;width:42px;height:42px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);background:color-mix(in srgb,var(--dsw-specific-menu) 86%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:var(--dsw-shadow-lv2);color:var(--dsw-alias-label-secondary);cursor:pointer;display:grid;place-items:center;padding:0;transition:transform .16s var(--ds-ease-in-out),box-shadow .16s var(--ds-ease-in-out),color .16s var(--ds-ease-in-out)}.uW_button:hover{transform:scale(1.06);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-shadow-lv3)}.uW_button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.uW_ring{position:absolute;inset:-3px;border-radius:50%;pointer-events:none;border:1.5px solid transparent;transition:border-color .2s var(--ds-ease-in-out)}.uW_ring[data-bracket=\"peak\"]{border-color:color-mix(in srgb,#f2b04c 55%,transparent)}.uW_ring[data-bracket=\"idle\"]{border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 45%,transparent)}.uW_dot{position:absolute;top:-2px;right:-2px;width:9px;height:9px;border-radius:50%;border:2px solid var(--dsw-alias-bg-base);background:var(--dsw-alias-label-caption)}.uW_dot[data-bracket=\"peak\"]{background:#f2b04c;animation:uW-pulse 1.6s ease-in-out infinite}.uW_dot[data-bracket=\"idle\"]{background:var(--dsw-alias-state-success-primary)}.uW_dot[data-bracket=\"error\"]{background:var(--dsw-alias-state-error-primary)}@keyframes uW-pulse{0%,100%{box-shadow:0 0 0 0 rgba(242,176,76,.45)}50%{box-shadow:0 0 0 5px rgba(242,176,76,0)}}.uW_coin{width:22px;height:22px}.uW_panel{position:fixed;z-index:61;right:68px;bottom:74px;width:300px;max-height:calc(100vh - 90px);overflow-y:auto;box-sizing:border-box;border:1px solid var(--dsw-alias-border-inverted);border-radius:16px;background:color-mix(in srgb,var(--dsw-specific-menu) 92%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:var(--dsw-shadow-lv3);padding:14px 16px 12px;color:var(--dsw-alias-label-secondary);transition:opacity .16s var(--ds-ease-in-out),transform .16s var(--ds-ease-in-out);transform-origin:bottom right}.uW_panel[data-open=\"false\"]{opacity:0;transform:translateY(6px) scale(.98);pointer-events:none}.uW_head{display:flex;align-items:baseline;justify-content:space-between;gap:10px}.uW_label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}.uW_amount{font-size:24px;line-height:30px;font-weight:650;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;letter-spacing:-.01em}.uW_sub{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);margin-top:2px;font-variant-numeric:tabular-nums}.uW_divider{border:none;border-top:1px solid var(--dsw-alias-border-l2);margin:10px 0}.uW_bracketRow{display:flex;align-items:center;gap:8px}.uW_bracketDot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--dsw-alias-state-success-primary)}.uW_bracketDot[data-bracket=\"peak\"]{background:#f2b04c;animation:uW-pulse 1.6s ease-in-out infinite}.uW_bracketText{flex:1;min-width:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.uW_clock{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none}.uW_timeline{display:flex;gap:2px;margin-top:8px;height:8px}.uW_hour{flex:1;border-radius:2px;background:var(--dsw-alias-border-l2);min-width:0}.uW_hour[data-peak=\"true\"]{background:color-mix(in srgb,#f2b04c 62%,transparent)}.uW_hour[data-now=\"true\"]{outline:1.5px solid var(--dsw-alias-label-primary);outline-offset:1px}.uW_sectionLabel{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);margin:10px 0 6px;letter-spacing:.04em}.uW_totalRow{display:flex;align-items:baseline;justify-content:space-between;gap:10px}.uW_total{font-size:20px;line-height:26px;font-weight:650;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}.uW_totalHint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}.uW_bucket{margin-top:7px}.uW_bucketHead{display:flex;align-items:baseline;justify-content:space-between;gap:10px}.uW_bucketLabel{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.uW_bucketValue{font-size:12px;line-height:17px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none}.uW_bucketBar{height:3px;border-radius:2px;background:var(--dsw-alias-interactive-bg-hover);margin-top:3px;overflow:hidden}.uW_bucketFill{height:100%;border-radius:2px;background:var(--bucket-tint,var(--dsw-alias-label-secondary));transition:width .3s var(--ds-ease-in-out)}.uW_tintUncached{--bucket-tint:#60a5fa}.uW_tintCacheRead{--bucket-tint:var(--dsw-alias-state-success-primary)}.uW_tintCacheWrite{--bucket-tint:#a78bfa}.uW_tintOutput{--bucket-tint:var(--dsw-alias-label-secondary)}.uW_spendCell{border:1px solid color-mix(in srgb,#f2b04c 55%,transparent);border-radius:10px;padding:8px 10px;background:color-mix(in srgb,#f2b04c 10%,var(--dsw-alias-bg-layer-3));flex-direction:column;gap:3px;margin-bottom:8px}.uW_spendHead{display:flex;align-items:baseline;justify-content:space-between;gap:10px}.uW_spendLabel{flex:1;min-width:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}.uW_spendValue{flex:none;font-size:16px;line-height:22px;font-weight:650;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}.uW_spendSub{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}.uW_localCell{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:8px 10px;background:var(--dsw-alias-bg-layer-3);flex-direction:column;gap:3px;margin-bottom:8px}.uW_localHead{display:flex;align-items:baseline;justify-content:space-between;gap:10px}.uW_localLabel{flex:1;min-width:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}.uW_localTokens{flex:none;font-size:12px;line-height:17px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;font-weight:600}.uW_localCost{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}.uW_costGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.uW_costCell{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:8px 10px;background:var(--dsw-alias-bg-layer-3)}.uW_costCellLabel{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);display:flex;align-items:center;gap:5px}.uW_costCellValue{font-size:16px;line-height:22px;font-weight:600;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;margin-top:2px}.uW_costNote{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);margin-top:6px}.uW_footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding-top:8px;border-top:1px solid var(--dsw-alias-border-l2)}.uW_updated{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:none;border:none;padding:0;font:inherit}.uW_updated:hover{color:var(--dsw-alias-label-secondary);text-decoration:underline}.uW_hint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-caption)}.uT_row{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}.uT_rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}.uT_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.uT_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}.uT_selector{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}.uT_selector:hover{background:var(--dsw-alias-interactive-bg-hover)}.uT_chevron{flex:none}";
		const tagId = "dsh-client-ui-usage-footer/UsageWidget.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-client-ui-usage-footer";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		const NS = "usage-footer";
		const POLL_INTERVAL_MS = 60_000;
		const CLOCK_TICK_MS = 30_000;
		const STALE_MS = 45_000;
		const TODAY_KEY = "dsh-usage-footer.today.v1";
		// DeepSeek peak/off-peak pricing, CNY per million tokens, effective 2026-08-17.
		// Peak hours (Beijing time): 09:00-12:00, 14:00-18:00.
		const PRICING = {
			"deepseek-v4-pro": {
				offPeak: { hit: 0.15, miss: 4.5, output: 13.5 },
				peak: { hit: 0.3, miss: 9.0, output: 27.0 }
			},
			"deepseek-v4-flash": {
				offPeak: { hit: 0.05, miss: 1.5, output: 4.5 },
				peak: { hit: 0.1, miss: 3.0, output: 9.0 }
			}
		};
		const PEAK_HOURS = new Set([9, 10, 11, 14, 15, 16, 17]);
		const CURRENCY_SYMBOLS = { CNY: "¥", USD: "$", EUR: "€" };
		function formatTokens(n) {
			if (n >= 1e6) return trimZeros(n / 1e6, 1) + "M";
			if (n >= 1e3) return trimZeros(n / 1e3, 1) + "K";
			return String(n);
		}
		function trimZeros(value, maxDecimals) {
			let out = value.toFixed(maxDecimals);
			if (out.includes(".")) out = out.replace(/0+$/, "").replace(/\.$/, "");
			return out;
		}
		function formatMoney(amount) {
			if (!Number.isFinite(amount)) return "–";
			if (amount === 0) return "0";
			if (amount >= 0.01) return trimZeros(amount, 2);
			if (amount >= 0.001) return trimZeros(amount, 3);
			return trimZeros(amount, 4);
		}
		function moneyText(amount, currency) {
			const symbol = CURRENCY_SYMBOLS[currency];
			if (symbol !== undefined) return symbol + amount;
			return (currency ?? "") + " " + amount;
		}
		function totalTokens(usage) {
			return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens + usage.outputTokens;
		}
		function costEstimate(usage) {
			const price = PRICING["deepseek-v4-pro"];
			const read = usage.cacheReadTokens;
			const miss = usage.uncachedInputTokens + usage.cacheWriteTokens;
			const out = usage.outputTokens;
			const at = (bracket) => (read * bracket.hit + miss * bracket.miss + out * bracket.output) / 1e6;
			return { offPeak: at(price.offPeak), peak: at(price.peak) };
		}
		function costOfBuckets(buckets) {
			const price = PRICING["deepseek-v4-pro"];
			const read = buckets.cacheRead;
			const miss = buckets.uncached + buckets.cacheWrite;
			const out = buckets.output;
			const at = (bracket) => (read * bracket.hit + miss * bracket.miss + out * bracket.output) / 1e6;
			return { offPeak: at(price.offPeak), peak: at(price.peak) };
		}
		function toNumber(value) {
			if (typeof value === "number" && Number.isFinite(value)) return value;
			if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
			return undefined;
		}
		function findNumber(node, pattern, depth) {
			if (depth === undefined) depth = 0;
			if (node === null || node === undefined || depth > 4) return undefined;
			if (Array.isArray(node)) {
				for (const item of node) {
					const found = findNumber(item, pattern, depth + 1);
					if (found !== undefined) return found;
				}
				return undefined;
			}
			if (typeof node === "object") {
				for (const key of Object.keys(node)) {
					if (pattern.test(key)) {
						const direct = toNumber(node[key]);
						if (direct !== undefined) return direct;
					}
					const found = findNumber(node[key], pattern, depth + 1);
					if (found !== undefined) return found;
				}
			}
			return undefined;
		}
		/** Beijing (UTC+8, no DST) clock facts for the peak/off-peak bracket. */
		function beijingFacts(ts) {
			const minutesOfDay = (ts.getUTCHours() * 60 + ts.getUTCMinutes() + 480) % 1440;
			const hour = Math.floor(minutesOfDay / 60);
			const minute = minutesOfDay % 60;
			const isPeak = PEAK_HOURS.has(hour);
			let switchMinutes;
			if (minutesOfDay < 540) switchMinutes = 540 - minutesOfDay;
			else if (minutesOfDay < 720) switchMinutes = 720 - minutesOfDay;
			else if (minutesOfDay < 840) switchMinutes = 840 - minutesOfDay;
			else if (minutesOfDay < 1080) switchMinutes = 1080 - minutesOfDay;
			else switchMinutes = 540 + 1440 - minutesOfDay;
			const switchAt = (minutesOfDay + switchMinutes) % 1440;
			const switchHour = Math.floor(switchAt / 60);
			const switchMinute = switchAt % 60;
			const tomorrow = minutesOfDay + switchMinutes >= 1440;
			const clock = pad2(hour) + ":" + pad2(minute);
			const switchClock = pad2(switchHour) + ":" + pad2(switchMinute);
			return { clock, isPeak, switchClock, tomorrow, hour };
		}
		function pad2(n) {
			return n < 10 ? "0" + n : String(n);
		}
		function localDayKey() {
			const d = new Date();
			return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
		}
		function readTodayRecord() {
			try {
				const raw = window.localStorage.getItem(TODAY_KEY);
				if (raw === null) return null;
				const parsed = JSON.parse(raw);
				if (parsed !== null && typeof parsed === "object" && parsed.date === localDayKey()) return parsed;
			} catch {}
			return null;
		}
		function writeTodayRecord(record) {
			try {
				window.localStorage.setItem(TODAY_KEY, JSON.stringify(record));
			} catch {}
		}
		function emptyTodayRecord() {
			return { date: localDayKey(), uncached: 0, cacheRead: 0, cacheWrite: 0, output: 0 };
		}
		function todayBucketsOf(record) {
			if (record === null) return { uncached: 0, cacheRead: 0, cacheWrite: 0, output: 0 };
			return {
				uncached: typeof record.uncached === "number" ? record.uncached : 0,
				cacheRead: typeof record.cacheRead === "number" ? record.cacheRead : 0,
				cacheWrite: typeof record.cacheWrite === "number" ? record.cacheWrite : 0,
				output: typeof record.output === "number" ? record.output : 0
			};
		}
		/** Coin glyph: a token medallion with the currency notch. */
		function CoinGlyph() {
			return jsx("svg", {
				className: "uW_coin",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": true,
				children: [
					jsx("circle", { cx: 12, cy: 12, r: 8.6, stroke: "currentColor", strokeWidth: 1.6 }),
					jsx("path", {
						d: "M12 8.2v7.6M12 8.2c-1.9-.4-3.4.9-3.4 2.1 0 2.6 6.8 1.3 6.8 3.6 0 1.2-1.5 2.4-3.4 2-1.2-.3-2.3-1.1-2.3-2.1",
						stroke: "currentColor",
						strokeWidth: 1.3,
						strokeLinecap: "round"
					})
				]
			});
		}
		/** Bottom-right floating usage widget: button + hover popup. */
		function UsageWidget(props) {
			const { useProjection, useEnabled, t, sessionId } = props;
			const usage = typeof useProjection === "function" ? useProjection("tokenUsage") : undefined;
			const enabled = useEnabled((value) => value);
			const [status, setStatus] = react.useState(null);
			const [open, setOpen] = react.useState(false);
			const [pinned, setPinned] = react.useState(false);
			const [now, setNow] = react.useState(() => Date.now());
			const [today, setToday] = react.useState(() => todayBucketsOf(readTodayRecord()));
			const lastFetchAt = react.useRef(0);
			const lastUsage = react.useRef(null);
			const hoverTimer = react.useRef(null);
			const leaveTimer = react.useRef(null);
			const rootRef = react.useRef(null);
			const panelRef = react.useRef(null);
			const refresh = react.useCallback(async () => {
				try {
					const response = await fetch("/usage-status", { headers: { accept: "application/json" } });
					lastFetchAt.current = Date.now();
					setStatus(response.ok ? await response.json() : { failed: true });
				} catch {
					setStatus({ failed: true });
				}
			}, []);
			const syncBaseline = react.useCallback(async () => {
				try {
					const response = await fetch("/usage-status/sync", { method: "POST" });
					if (response.ok) refresh();
				} catch {}
			}, [refresh]);
			react.useEffect(() => {
				if (!enabled) return;
				refresh();
				const poll = setInterval(refresh, POLL_INTERVAL_MS);
				const tick = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
				return () => {
					clearInterval(poll);
					clearInterval(tick);
				};
			}, [refresh, enabled]);
			// Accumulate today's locally observed usage (per-session deltas,
			// persisted per local day; a new day resets the record).
			react.useEffect(() => {
				if (!enabled || usage === undefined) return;
				const record = readTodayRecord() ?? emptyTodayRecord();
				const last = lastUsage.current;
				if (last === null || last.sessionId !== sessionId) {
					lastUsage.current = { sessionId, usage };
					setToday(todayBucketsOf(record));
					return;
				}
				let changed = false;
				const deltas = {
					uncached: usage.uncachedInputTokens - last.usage.uncachedInputTokens,
					cacheRead: usage.cacheReadTokens - last.usage.cacheReadTokens,
					cacheWrite: usage.cacheWriteTokens - last.usage.cacheWriteTokens,
					output: usage.outputTokens - last.usage.outputTokens
				};
				for (const slot of ["uncached", "cacheRead", "cacheWrite", "output"]) {
					if (deltas[slot] > 0) {
						record[slot] += deltas[slot];
						changed = true;
					}
				}
				lastUsage.current = { sessionId, usage };
				if (changed) {
					writeTodayRecord(record);
					setToday(todayBucketsOf(record));
				}
			}, [usage, enabled, sessionId]);
			// Hover-open with grace timers; click pins until outside click.
			const clearTimers = () => {
				if (hoverTimer.current !== null) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
				if (leaveTimer.current !== null) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
			};
			const onEnter = () => {
				clearTimers();
				hoverTimer.current = setTimeout(() => {
					if (Date.now() - lastFetchAt.current > STALE_MS) refresh();
					setOpen(true);
				}, 120);
			};
			const onLeave = () => {
				clearTimers();
				leaveTimer.current = setTimeout(() => {
					if (!pinned) setOpen(false);
				}, 260);
			};
			const onButtonClick = () => {
				clearTimers();
				setPinned((value) => {
					const next = !value;
					setOpen(next);
					return next;
				});
			};
			react.useEffect(() => {
				if (!pinned) return;
				const onPointerDown = (event) => {
					if (rootRef.current !== null && rootRef.current.contains(event.target)) return;
					if (panelRef.current !== null && panelRef.current.contains(event.target)) return;
					setPinned(false);
					setOpen(false);
				};
				document.addEventListener("mousedown", onPointerDown);
				const onKeyDown = (event) => {
					if (event.key === "Escape") {
						setPinned(false);
						setOpen(false);
					}
				};
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("mousedown", onPointerDown);
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [pinned]);
			if (!enabled) return null;
			const facts = beijingFacts(new Date(now));
			const balance = status?.balance;
			const balanceUnavailable = status === null || status?.failed === true || status?.disabled === true;
			const bracket = balanceUnavailable && status !== null ? "error" : facts.isPeak ? "peak" : "idle";
			const total = usage !== undefined ? totalTokens(usage) : 0;
			const estimate = usage !== undefined && total > 0 ? costEstimate(usage) : null;
			const todayTotal = today.uncached + today.cacheRead + today.cacheWrite + today.output;
			const todayCost = todayTotal > 0 ? costOfBuckets(today) : { offPeak: 0, peak: 0 };
			const todaySpend = status !== null && status.todaySpend !== null && typeof status.todaySpend?.amount === "number"
				? status.todaySpend
				: null;
			const local = status?.local ?? null;
			const official = status?.official ?? null;
			const comparison = status?.comparison ?? null;
			const localMonth = local?.month ?? null;
			const localToday = local?.today ?? null;
			const localMonthTokens = localMonth ? localMonth.inputTokens + localMonth.cacheReadTokens + localMonth.cacheWriteTokens + localMonth.outputTokens : 0;
			const localTodayTokens = localToday ? localToday.inputTokens + localToday.cacheReadTokens + localToday.cacheWriteTokens + localToday.outputTokens : 0;
			const localMonthCost = localMonth?.cost ?? null;
			const localTodayCost = localToday?.cost ?? null;
			// 优先展示官方汇总；未配置平台 token 时展示本地账本汇总。
			const monthTokens = official?.monthTokens ?? (localMonthTokens > 0 ? localMonthTokens : undefined);
			const monthCost = official?.monthCost ?? (localMonthCost != null ? localMonthCost : undefined);
			const buckets = usage !== undefined && total > 0 ? [
				{ key: "uncached", tint: "uW_tintUncached", label: t("panel.inputUncached"), value: usage.uncachedInputTokens },
				{ key: "cacheRead", tint: "uW_tintCacheRead", label: t("panel.cacheRead"), value: usage.cacheReadTokens },
				{ key: "cacheWrite", tint: "uW_tintCacheWrite", label: t("panel.cacheWrite"), value: usage.cacheWriteTokens },
				{ key: "output", tint: "uW_tintOutput", label: t("panel.output"), value: usage.outputTokens }
			] : [];
			const panel = jsx("div", {
				ref: panelRef,
				className: "uW_panel",
				"data-open": open ? "true" : "false",
				role: "dialog",
				"aria-label": t("button.label"),
				"aria-hidden": open ? undefined : true,
				onMouseEnter: onEnter,
				onMouseLeave: onLeave,
				children: jsxs(Fragment, { children: [
					jsxs("div", { className: "uW_head", children: [
						jsxs("div", { children: [
							jsx("div", { className: "uW_label", children: t("panel.balance") }),
							jsx("div", { className: "uW_amount", children: balance !== undefined && balance !== null ? moneyText(formatMoney(Number(balance.totalBalance)), balance.currency) : "—" }),
							jsx("div", { className: "uW_sub", children: balance !== undefined && balance !== null ? t("panel.balanceGranted", {
								toppedUp: moneyText(formatMoney(Number(balance.toppedUpBalance)), balance.currency),
								granted: moneyText(formatMoney(Number(balance.grantedBalance)), balance.currency)
							}) : t("panel.balanceUnavailable") })
						] }),
						jsx("span", { className: "uW_dot", "data-bracket": bracket })
					] }),
					jsx("hr", { className: "uW_divider" }),
					jsxs("div", { className: "uW_bracketRow", children: [
						jsx("span", { className: "uW_bracketDot", "data-bracket": facts.isPeak ? "peak" : "idle" }),
						jsx("span", { className: "uW_bracketText", children: facts.isPeak
							? t("panel.peakEnds", { time: (facts.tomorrow ? t("panel.tomorrow") : "") + facts.switchClock })
							: t("panel.idleNext", { time: (facts.tomorrow ? t("panel.tomorrow") : "") + facts.switchClock }) }),
						jsx("span", { className: "uW_clock", children: facts.clock })
					] }),
					jsx("div", {
						className: "uW_timeline",
						"aria-hidden": true,
						title: t("panel.timelineTitle"),
						children: Array.from({ length: 24 }, (_, hour) => jsx("span", {
							className: "uW_hour",
							"data-peak": PEAK_HOURS.has(hour),
							"data-now": hour === facts.hour
						}, hour))
					}),
					total > 0 && jsxs(Fragment, { children: [
						jsx("div", { className: "uW_sectionLabel", children: t("panel.session") }),
						jsxs("div", { className: "uW_totalRow", children: [
							jsx("span", { className: "uW_total", children: formatTokens(total) }),
							jsx("span", { className: "uW_totalHint", children: t("panel.sessionTotal") })
						] }),
						buckets.map((bucket) => jsxs("div", { className: "uW_bucket", children: [
							jsxs("div", { className: "uW_bucketHead", children: [
								jsx("span", { className: "uW_bucketLabel", children: bucket.label }),
								jsx("span", { className: "uW_bucketValue", children: formatTokens(bucket.value) })
							] }),
							jsx("div", { className: "uW_bucketBar", children: jsx("div", {
								className: "uW_bucketFill " + bucket.tint,
								style: { width: Math.max(2, Math.round(bucket.value / total * 100)) + "%" }
							}) })
						] }, bucket.key))
					] }),
					jsxs(Fragment, { children: [
						jsx("div", { className: "uW_sectionLabel", children: t("panel.cost") }),
						todaySpend !== null && jsxs("div", { className: "uW_spendCell", title: t("panel.todaySpendNote"), children: [
							jsxs("div", { className: "uW_spendHead", children: [
								jsx("span", { className: "uW_spendLabel", children: t("panel.todaySpend") }),
								jsx("span", { className: "uW_spendValue", children: moneyText(formatMoney(todaySpend.amount), todaySpend.currency) })
							] }),
							jsx("div", { className: "uW_spendSub", children: t("panel.todaySpendSince", { time: new Date(todaySpend.baselineAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }) })
						] }),
						jsxs("div", { className: "uW_localCell", title: t("panel.todayNote"), children: [
							jsxs("div", { className: "uW_localHead", children: [
								jsx("span", { className: "uW_localLabel", children: t("panel.todayLocal") }),
								jsx("span", { className: "uW_localTokens", children: t("panel.todayTokens", { total: formatTokens(todayTotal) }) })
							] }),
							jsx("div", { className: "uW_localCost", children: t("panel.todayCost", { off: formatMoney(todayCost.offPeak), peak: formatMoney(todayCost.peak) }) })
						] }),
						estimate !== null && jsxs("div", { className: "uW_costGrid", children: [
							jsxs("div", { className: "uW_costCell", children: [
								jsx("div", { className: "uW_costCellLabel", children: [jsx("span", { className: "uW_bracketDot", "data-bracket": "idle" }), t("panel.costOff")] }),
								jsx("div", { className: "uW_costCellValue", children: "¥" + formatMoney(estimate.offPeak) })
							] }),
							jsxs("div", { className: "uW_costCell", children: [
								jsx("div", { className: "uW_costCellLabel", children: [jsx("span", { className: "uW_bracketDot", "data-bracket": "peak" }), t("panel.costPeak")] }),
								jsx("div", { className: "uW_costCellValue", children: "¥" + formatMoney(estimate.peak) })
							] })
						] }),
						jsx("div", { className: "uW_costNote", children: t("panel.costNote") })
					] }),
					(local !== null && (localTodayCost != null || localMonthCost != null)) && jsxs(Fragment, { children: [
						jsx("div", { className: "uW_sectionLabel", children: t("panel.localLedger") }),
						localTodayCost != null && jsxs("div", { className: "uW_localCell", children: [
							jsxs("div", { className: "uW_localHead", children: [
								jsx("span", { className: "uW_localLabel", children: t("panel.localLedgerToday") }),
								jsx("span", { className: "uW_localTokens", children: t("panel.localTokens", { total: formatTokens(localTodayTokens) }) })
							] }),
							jsx("div", { className: "uW_localCost", children: t("panel.localCost", { amount: moneyText(formatMoney(localTodayCost), "CNY") }) })
						] }),
						localMonthCost != null && jsxs("div", { className: "uW_localCell", children: [
							jsxs("div", { className: "uW_localHead", children: [
								jsx("span", { className: "uW_localLabel", children: t("panel.localLedgerMonth") }),
								jsx("span", { className: "uW_localTokens", children: t("panel.localTokens", { total: formatTokens(localMonthTokens) }) })
							] }),
							jsx("div", { className: "uW_localCost", children: t("panel.localCost", { amount: moneyText(formatMoney(localMonthCost), "CNY") }) })
						] })
					] }),
					comparison !== null && jsxs(Fragment, { children: [
						jsx("div", { className: "uW_sectionLabel", children: t("panel.compare") }),
						jsx("div", { className: "uW_localCell", title: t("panel.compareNote"), children: [
							comparison.syncedAt !== null && jsx("div", { className: "uW_localCost", children: t("panel.syncSince", { time: new Date(comparison.syncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }) }),
							jsx("div", { className: "uW_localCost", children: t("panel.compareMonth", {
								local: moneyText(formatMoney(comparison.month.localCost), comparison.month.currency),
								official: moneyText(formatMoney(comparison.month.officialCost), comparison.month.currency),
								diff: moneyText(formatMoney(comparison.month.diff), comparison.month.currency)
							}) }),
							jsx("div", { className: "uW_localCost", children: t("panel.compareToday", {
								local: moneyText(formatMoney(comparison.today.localCost), comparison.today.currency),
								official: moneyText(formatMoney(comparison.today.officialCost), comparison.today.currency),
								diff: moneyText(formatMoney(comparison.today.diff), comparison.today.currency)
							}) }),
							jsx("button", {
								type: "button",
								className: "uW_updated",
								onClick: syncBaseline,
								children: t("panel.syncBaseline")
							})
						] })
					] }),
					(monthTokens !== undefined || monthCost !== undefined) && jsxs(Fragment, { children: [
						jsx("div", { className: "uW_sectionLabel", children: t("panel.month") }),
						jsx("div", { className: "uW_totalRow", children: [
							jsx("span", { className: "uW_total", children: monthTokens !== undefined ? formatTokens(monthTokens) + " token" : "–" }),
							jsx("span", { className: "uW_totalHint", children: monthCost !== undefined ? "¥" + formatMoney(monthCost) : "–" })
						] })
					] }),
					jsxs("div", { className: "uW_footer", children: [
						jsx("button", {
							type: "button",
							className: "uW_updated",
							onClick: refresh,
							children: status !== null
								? t("panel.updated", { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
								: t("panel.loading")
						}),
						jsx("span", { className: "uW_hint", children: t("panel.hint") })
					] })
				] })
			});
			return jsx(Fragment, {
				children: [
					jsxs("div", {
						ref: rootRef,
						className: "uW_root",
						children: [
							jsx("span", { className: "uW_ring", "data-bracket": bracket, "aria-hidden": true }),
							jsx("button", {
								type: "button",
								className: "uW_button",
								"aria-label": t("button.label"),
								"aria-expanded": open,
								onClick: onButtonClick,
								onMouseEnter: onEnter,
								onMouseLeave: onLeave,
								children: jsx(CoinGlyph, {})
							}),
							jsx("span", { className: "uW_dot", "data-bracket": bracket, "aria-hidden": true })
						]
					}),
					panel
				]
			});
		}
		/** General Settings row: the self-service on/off selector. */
		function UsageToggleRow(props) {
			const { useEnabled, setEnabled, t } = props;
			const enabled = useEnabled((value) => value);
			const [open, setOpen] = react.useState(false);
			const OPTIONS = [
				{ id: true, label: "settings.enabled" },
				{ id: false, label: "settings.disabled" }
			];
			return jsxs("div", {
				className: "uT_row",
				children: [
					jsxs("div", {
						className: "uT_rowText",
						children: [
							jsx("div", { className: "uT_title", children: t("settings.title") }),
							jsx("div", { className: "uT_desc", children: t("settings.description") })
						]
					}),
					jsx(primitives.Menu, {
						open,
						onClose: () => {
							setOpen(false);
						},
						items: OPTIONS.map((option) => ({
							id: option.id,
							label: t(option.label)
						})),
						selectedId: enabled,
						onSelect: (id) => {
							setOpen(false);
							setEnabled(id === true);
						},
						align: "end",
						portal: true,
						anchor: jsxs("button", {
							type: "button",
							className: "uT_selector",
							"aria-haspopup": "menu",
							"aria-expanded": open,
							onClick: () => {
								setOpen((value) => !value);
							},
							children: [
								t(enabled ? "settings.enabled" : "settings.disabled"),
								jsx(primitives.IconChevronDownOutline14, { className: "uT_chevron" })
							]
						})
					})
				]
			});
		}
		/** Usage-footer dictionaries (zh-CN / en). */
		const zh = {
			"button.label": "用量与费用",
			"panel.balance": "账户余额",
			"panel.balanceGranted": "充值 {toppedUp} · 赠送 {granted}",
			"panel.balanceUnavailable": "余额暂不可用",
			"panel.peakEnds": "高峰时段 · {time} 结束",
			"panel.idleNext": "空闲时段 · {time} 进入高峰",
			"panel.tomorrow": "明 ",
			"panel.timelineTitle": "今日峰谷时段（高峰 9:00-12:00 / 14:00-18:00）",
			"panel.session": "本会话用量",
			"panel.sessionTotal": "token",
			"panel.inputUncached": "输入（未缓存）",
			"panel.cacheRead": "缓存命中",
			"panel.cacheWrite": "缓存写入",
			"panel.output": "输出",
			"panel.cost": "消费估算",
			"panel.todaySpend": "今日消费（余额估算）",
			"panel.todaySpendSince": "自 {time} 起 · 余额差值估算",
			"panel.todaySpendNote": "估算值：今日首次查询时的余额快照与当前余额之差；余额结算有延迟，且不含今日首次查询前产生的消耗。精确金额请以本地账本/官方数据为准",
			"panel.todayLocal": "本机今日用量（token 统计）",
			"panel.todayTokens": "{total} token",
			"panel.todayCost": "空闲 ≈ ¥{off} · 高峰 ¥{peak}",
			"panel.todayNote": "本机观测统计（非官方账单）：按会话去重累计本机今日产生的 token，金额按峰谷价目估算；跨浏览器/未打开页面的用量不计入",
			"panel.costOff": "本会话 · 空闲",
			"panel.costPeak": "本会话 · 高峰",
			"panel.costNote": "按 deepseek-v4-pro 峰谷价目估算（2026-08-17 起）",
			"panel.localLedger": "本地账本（官方价）",
			"panel.localLedgerToday": "今日",
			"panel.localLedgerMonth": "本月",
			"panel.localTokens": "{total} token",
			"panel.localCost": "{amount}",
			"panel.compare": "本地 vs 官方",
			"panel.compareMonth": "本月：本地 {local} · 官方 {official} · 差 {diff}",
			"panel.compareToday": "今日：本地 {local} · 官方 {official} · 差 {diff}",
			"panel.compareNote": "配置 DEEPSEEK_PLATFORM_TOKEN 后显示官方对比；差值为本地估算与官方账单的偏差",
			"panel.syncSince": "同步起点 {time} · 以下为同步后的增量",
			"panel.syncBaseline": "设为同步起点",
			"panel.month": "本月用量/费用",
			"panel.updated": "{time} 更新 · 点击刷新",
			"panel.loading": "查询中…",
			"panel.hint": "设置 → 通用 可关闭",
			"settings.title": "用量与费用栏",
			"settings.description": "右下角悬浮按钮，悬停显示余额、峰谷时段、今日/本会话消费估算与累计 token",
			"settings.enabled": "开启",
			"settings.disabled": "关闭"
		};
		const en = {
			"button.label": "Usage & cost",
			"panel.balance": "Account balance",
			"panel.balanceGranted": "Topped up {toppedUp} · Granted {granted}",
			"panel.balanceUnavailable": "Balance unavailable",
			"panel.peakEnds": "Peak hours · ends {time}",
			"panel.idleNext": "Off-peak · peak starts {time}",
			"panel.tomorrow": "tomorrow ",
			"panel.timelineTitle": "Today's peak/off-peak (peak 09:00-12:00 / 14:00-18:00 Beijing)",
			"panel.session": "This session",
			"panel.sessionTotal": "tokens",
			"panel.inputUncached": "Input (uncached)",
			"panel.cacheRead": "Cache read",
			"panel.cacheWrite": "Cache write",
			"panel.output": "Output",
			"panel.cost": "Estimated cost",
			"panel.todaySpend": "Today's spend (balance estimate)",
			"panel.todaySpendSince": "Since {time} · balance-delta estimate",
			"panel.todaySpendNote": "Estimate: day-start balance snapshot minus current balance; billing may lag, and usage before today's first query is not included. For precise figures use the local ledger / official data",
			"panel.todayLocal": "Today's usage (local tokens)",
			"panel.todayTokens": "{total} tokens",
			"panel.todayCost": "Off-peak ≈ ¥{off} · Peak ¥{peak}",
			"panel.todayNote": "Locally observed tokens (not the official bill): session-deduplicated usage produced on this machine today, priced with the peak/off-peak table; usage while no page was open is not counted",
			"panel.costOff": "This session · off-peak",
			"panel.costPeak": "This session · peak",
			"panel.costNote": "Estimated from deepseek-v4-pro peak/off-peak pricing (since 2026-08-17)",
			"panel.localLedger": "Local ledger (official prices)",
			"panel.localLedgerToday": "Today",
			"panel.localLedgerMonth": "Month",
			"panel.localTokens": "{total} tokens",
			"panel.localCost": "{amount}",
			"panel.compare": "Local vs Official",
			"panel.compareMonth": "Month: local {local} · official {official} · diff {diff}",
			"panel.compareToday": "Today: local {local} · official {official} · diff {diff}",
			"panel.compareNote": "Official comparison appears when DEEPSEEK_PLATFORM_TOKEN is configured; diff is local estimate vs official bill",
			"panel.syncSince": "Synced at {time} · values below are deltas since sync",
			"panel.syncBaseline": "Set as sync baseline",
			"panel.month": "This month usage/cost",
			"panel.updated": "Updated {time} · click to refresh",
			"panel.loading": "Loading…",
			"panel.hint": "Toggle in Settings → General",
			"settings.title": "Usage & cost widget",
			"settings.description": "Floating button at bottom right; hover to see balance, peak/off-peak, today/session cost and tokens",
			"settings.enabled": "On",
			"settings.disabled": "Off"
		};
		/** Services required by the usage-footer plugin. */
		const inject = ["slots", "locale", "settingsScope", "connection", "remote"];
		const STORAGE_KEY = "dsh-usage-footer.enabled";
		/** Per-browser fallback persistence: works before the host registers the settings namespace. */
		function readLocalEnabled() {
			try {
				const raw = window.localStorage.getItem(STORAGE_KEY);
				if (raw === "true") return true;
				if (raw === "false") return false;
			} catch {}
			return true;
		}
		function writeLocalEnabled(value) {
			try {
				window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
			} catch {}
		}
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "usage-footer: dictionaries");
			// The user-facing on/off preference. An explicit user section in the
			// `usage-footer` settings namespace (registered host-side by
			// dsh-usage-status) wins; until that exists the value persists in
			// localStorage so the toggle works without a host restart.
			const scope = ctx.settingsScope.bind({ namespace: "usage-footer" });
			const enabledStore = runtime_client.createSnapshotStore(readLocalEnabled());
			const adoptEnabled = () => {
				const snapshot = scope.getSnapshot();
				const explicit = snapshot.user !== undefined && typeof snapshot.user.enabled === "boolean"
					? snapshot.user.enabled
					: undefined;
				if (explicit === undefined) return;
				if (enabledStore.getSnapshot() !== explicit) enabledStore.set(explicit);
			};
			scope.subscribe(adoptEnabled);
			adoptEnabled();
			const setEnabled = (value) => {
				if (enabledStore.getSnapshot() === value) return;
				enabledStore.set(value);
				writeLocalEnabled(value);
				scope.set("enabled", value);
			};
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "usage-widget",
				order: 10,
				locale: NS,
				inject: () => ({ hooks: { enabled: enabledStore } })
			}, UsageWidget));
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "usage-footer-toggle",
				order: 40,
				locale: NS,
				inject: () => ({ hooks: { enabled: enabledStore }, setEnabled })
			}, UsageToggleRow));
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
