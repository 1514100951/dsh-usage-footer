# dsh-usage-footer

DSH Web 界面「用量与费用」插件：页面右下角一枚悬浮金币按钮，悬停/点击弹出用量面板
（账户余额、峰谷时段、本会话 token 与消费估算、今日消费、本月账户用量），并在
**设置 → 通用** 提供「用量与费用栏」开关。

这是**标准 DSH Bundle**：一个包同时提供宿主半（`GET /usage-status` 路由 + 设置命名
空间）与浏览器半（自包含 web bundle），通过 `dsh.bundle.patch` 注册唯一入口
`dsh-usage-footer`，浏览器半经 `dsh.client` 自动进入 web 插件表。

## 功能

- **悬浮按钮（右下角）**：金币徽标圆钮，外环与角点颜色指示当前时段——绿=空闲、
  琥珀=高峰（呼吸动画）、红=余额查询失败
- **悬停弹窗**（120ms 延迟出现、260ms 宽容关闭；点击可钉住，点外部/Esc 关闭）：
  - **账户余额**：官方 API `GET https://api.deepseek.com/user/balance`（每 60 秒刷新），
    含充值/赠送拆分
  - **峰谷时段**：按北京时间实时判定，附 24 小时峰谷条（高峰 9:00-12:00 / 14:00-18:00）
  - **本会话用量**：累计 token + 输入（未缓存）/缓存命中/缓存写入/输出 四项分条
  - **本地账本（官方价）**：宿主侧订阅 DSH `session/event`，按 DeepSeek 官方价格时间表
    记录今日/本月 token 与金额，持久化到 `$DSH_HOME/storages/usage-footer-ledger.json`
  - **官方对比**（可选）：配置 `DEEPSEEK_PLATFORM_TOKEN` 后并排显示本地账本与
    platform.deepseek.com 官方汇总，便于校准差异
  - **今日消费（余额差值估算）**：当日首次查询时把余额快照写入
    `$DSH_HOME/usage-footer-balance-baseline.json`，此后用「当日快照 − 当前余额」估算；
    充值、赠送和余额结算延迟会干扰结果，**仅作兜底**
  - **本机今日用量（token 统计）**：按会话去重累计本机今日 token 与峰谷价目估算，
    日切清零，存于 localStorage（`dsh-usage-footer.today.v1`）；**非官方账单**
  - **消费估算（本会话）**：token × DeepSeek 峰谷定价（deepseek-v4-pro），空闲/高峰两档
  - **本月用量/费用**：优先显示官方平台汇总，否则显示本地账本汇总
- **自助开关**：设置 → 通用 → 「用量与费用栏」，实时生效；关闭后停止轮询、宿主路由
  返回 `{ disabled: true }`
- 视觉：毛玻璃面板、表格数字（tabular-nums）、入场位移+缩放动画，全部使用宿主
  `--dsw-*` 设计令牌，自动适配明暗主题

> 本地账本只记录插件启用后的用量，不追溯历史；官方数据需要浏览器登录态
> `userToken`。未配置平台 token 时，精确金额以本地账本为准，余额差值只作兜底估算。

## 兼容性声明（package.json）

| 范围 | 声明 |
|---|---|
| DSH 版本（范围） | `>=0.1.0-rc.8 <0.2.0` |
| DSH 版本（逐版本） | `0.1.0-rc.8` / `0.1.1-rc.1` / `0.1.1-rc.2` → `compatible` |
| Node.js | `>=20 <27` |

一次性 Profile 的安装/启动/卸载证据见 [`docs/EVIDENCE.md`](docs/EVIDENCE.md)
（在 DSH `0.1.1-rc.2` 上实际执行通过）。

## 安装方法（任意机器通用）

### 方式一：dsh plugin 命令

```powershell
dsh plugin --profile web add github:1514100951/dsh-usage-footer
# 新增依赖/层需要重启进程
dsh web
```

### 方式二：手动安装（等价步骤）

1. 把本仓库（`package.json`、`lib/`、`cordis.patch.yml`）放入
   `$DSH_HOME/profiles/node_modules/dsh-usage-footer/`
2. 把 `dsh-usage-footer` 加入 `$DSH_HOME/profiles/web/package.json` 的
   `dsh.profile.bundles` 列表
3. 重启 `dsh web`（新增 bundle 层需要重启；随后刷新浏览器页面即可看到悬浮按钮）

> 卸载 = 从 `bundles` 列表移除包名并删除模块目录，详见 `docs/EVIDENCE.md` 第 3 节。

## 前置条件与外部依赖

- 运行 `dsh web`（DeepSeek Harness Web 界面）
- 凭证中配置 `DEEPSEEK_API_KEY`（`$DSH_HOME/.credentials.yaml` 或环境变量）后，
  余额接口才有数据；可选 `DEEPSEEK_PLATFORM_TOKEN`（platform.deepseek.com 登录态
  `userToken`）用于本月账户用量
- 运行时依赖：`@deepseek-ai/schemastery`（宿主半的 settings schema）；peer 依赖
  `@deepseek-ai/cordis`、`@deepseek-ai/dsh-client-runtime`、`react`

## 权限与安全

- 不替换、不遮蔽、不禁用任何 `@deepseek-ai/*` 官方组件；Bundle Patch 仅新增插件
  自有入口 ID `dsh-usage-footer`
- 无 `preinstall/install/postinstall/prepare` 生命周期脚本
- 代码不含密钥；API Key 始终经 DSH 凭证服务在宿主侧解析
- `GET /usage-status` 仅绑定 127.0.0.1 且路由内校验回环，局域网访问 403
- 网络访问：仅 `api.deepseek.com` 与（可选）`platform.deepseek.com`

## 本地检查

```powershell
npm run check   # 语法检查宿主/浏览器两半
npm test        # 运行余额、定价、账本与平台解析测试
```

## License

[MIT](LICENSE)
