// Unit tests for the DeepSeek Platform usage parser.
import { fetchOfficialUsage } from "../lib/platform.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const amountPayload = {
  code: 0,
  data: {
    biz_code: 0,
    biz_data: {
      total: [
        {
          model: "deepseek-v4-pro",
          usage: [
            { type: "PROMPT_CACHE_HIT_TOKEN", amount: "1000" },
            { type: "PROMPT_CACHE_MISS_TOKEN", amount: "2000" },
            { type: "RESPONSE_TOKEN", amount: "3000" },
            { type: "REQUEST", amount: "10" }
          ]
        }
      ],
      days: [
        {
          date: "2026-08-15",
          data: [
            {
              model: "deepseek-v4-pro",
              usage: [
                { type: "PROMPT_CACHE_HIT_TOKEN", amount: "100" },
                { type: "PROMPT_CACHE_MISS_TOKEN", amount: "200" },
                { type: "RESPONSE_TOKEN", amount: "300" },
                { type: "REQUEST", amount: "1" }
              ]
            }
          ]
        }
      ]
    }
  }
};

const costPayload = {
  code: 0,
  data: {
    biz_code: 0,
    biz_data: [
      {
        total: [
          {
            model: "deepseek-v4-pro",
            usage: [
              { type: "PROMPT_CACHE_HIT_TOKEN", amount: "0.0015" },
              { type: "PROMPT_CACHE_MISS_TOKEN", amount: "0.009" },
              { type: "RESPONSE_TOKEN", amount: "0.0405" },
              { type: "REQUEST", amount: "0" }
            ]
          }
        ],
        days: [
          {
            date: "2026-08-15",
            data: [
              {
                model: "deepseek-v4-pro",
                usage: [
                  { type: "PROMPT_CACHE_HIT_TOKEN", amount: "0.00015" },
                  { type: "PROMPT_CACHE_MISS_TOKEN", amount: "0.0009" },
                  { type: "RESPONSE_TOKEN", amount: "0.00405" },
                  { type: "REQUEST", amount: "0" }
                ]
              }
            ]
          }
        ],
        currency: "CNY"
      }
    ]
  }
};

let calls = [];
globalThis.fetch = async (url) => {
  calls.push(url);
  const isCost = url.includes("/cost");
  return {
    ok: true,
    async json() {
      return isCost ? costPayload : amountPayload;
    }
  };
};

// 2026-08-15 12:00 Beijing = 04:00 UTC.
const now = new Date(Date.UTC(2026, 7, 15, 4, 0, 0));
const result = await fetchOfficialUsage("test-token", now);
assert(result !== null, "official usage should parse");
assert(result.monthTokens === 6000, `month tokens should be 6000, got ${result.monthTokens}`);
assert(result.todayTokens === 600, `today tokens should be 600, got ${result.todayTokens}`);
assert(Math.abs(result.monthCost - 0.051) < 1e-9, `month cost should be 0.051, got ${result.monthCost}`);
assert(Math.abs(result.todayCost - 0.0051) < 1e-9, `today cost should be 0.0051, got ${result.todayCost}`);
assert(result.currency === "CNY", "currency should be CNY");
assert(calls.length === 2, "should call both amount and cost endpoints");

delete globalThis.fetch;
console.log("ALL PLATFORM TESTS PASSED");
