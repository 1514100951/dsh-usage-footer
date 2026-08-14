# dsh-usage-footer

DSH Web 界面「用量与费用」插件（独立项目），包含两个包：

| 包 | 角色 | 入口 |
|---|---|---|
| `dsh-usage-status` | 宿主插件：注册 `GET /usage-status` 路由（查询 DeepSeek 余额 API），并注册 `usage-footer` 设置命名空间作为开关门控 | `lib/index.js` |
| `dsh-client-ui-usage-footer` | 浏览器插件：在页面**右下角**渲染一枚悬浮金币按钮，悬停/点击弹出用量面板；并在 **设置 → 通用** 增加「用量与费用栏」开关 | `lib/client.js`（自包含 bundle） |

## 功能

- **悬浮按钮（右下角）**：悬浮圆钮（金币徽标），外环与角点颜色指示当前时段——绿=空闲、琥珀=高峰（呼吸动画）、红=余额查询失败
- **悬停弹窗**（120ms 延迟出现、260ms 宽容关闭；点击可钉住，点外部/Esc 关闭；自按钮左上方展开）：
  - **账户余额**：官方 API `GET https://api.deepseek.com/user/balance`（每 60 秒刷新，点击"更新"手动刷新），含充值/赠送拆分
  - **峰谷时段**：按北京时间实时判定高峰/空闲，显示当前时刻与下次切换时间，并附 24 小时峰谷条（高峰 9:00-12:00 / 14:00-18:00，当前小时高亮）
  - **本会话用量**：累计 token + 输入（未缓存）/缓存命中/缓存写入/输出 四项分条
  - **今日消费（本机统计）**：按会话去重累计本机今日 token × 峰谷价目估算，日切自动清零，存于浏览器 localStorage（`dsh-usage-footer.today.v1`）；高峰档一并显示
  - **消费估算（本会话）**：token 数 × DeepSeek 峰谷定价（2026-08-17 起，deepseek-v4-pro），空闲/高峰两档并排
  - **本月账户用量**（可选）：配置 `DEEPSEEK_PLATFORM_TOKEN` 后显示
- **自助开关**：设置 → 通用 → 「用量与费用栏」开启/关闭，实时生效；关闭后停止轮询、服务端路由拒绝查询
- 视觉：毛玻璃面板（backdrop-blur + 半透明菜单底色）、表格数字（tabular-nums）、细线分隔、入场位移+缩放动画，全部使用宿主 `--dsw-*` 设计令牌，自动适配明暗主题

> 说明：账户级"今日消费"的官方数据源（platform.deepseek.com 私有接口）需要浏览器登录态 `userToken`，配置 `DEEPSEEK_PLATFORM_TOKEN` 后可用；未配置时以上"今日消费"为本机观测估算。

## 与 DSH 的接线方式（当前部署）

1. 两个包通过 **junction** 挂在模块目录里，让宿主 Loader 与客户端模块扫描器都能按包名解析：

   ```
   C:\Users\Lk151\.dsh\profiles\node_modules\dsh-usage-status
     ──JUNCTION──> D:\4_Project\11_vibecoding\usage-footer\packages\dsh-usage-status
   C:\Users\Lk151\.dsh\profiles\node_modules\dsh-client-ui-usage-footer
     ──JUNCTION──> D:\4_Project\11_vibecoding\usage-footer\packages\dsh-client-ui-usage-footer
   ```

2. 组合注册在 `C:\Users\Lk151\.dsh\profiles\web\cordis.patch.yml`：

   ```yaml
   - insert:
       - id: usage-status
         name: dsh-usage-status
       - id: ui-usage-footer
         name: dsh-client-ui-usage-footer
   ```

## 修改后如何生效

- **客户端 bundle（UI）**：改 `packages/dsh-client-ui-usage-footer/lib/client.js` 后，**刷新浏览器页面**即可（bundle 按请求实时读取、no-cache）。
- **宿主插件（API 路由 / 设置注册）**：改 `packages/dsh-usage-status/lib/index.js` 后，**重启 `dsh web`**（宿主模块按进程缓存，无热重载）。
- 完全卸载：在 `cordis.patch.yml` 中把两行置 `disabled: true`（组合层面硬开关）。

## 本地检查

```powershell
cd D:\4_Project\11_vibecoding\usage-footer
pnpm run check        # 语法检查两个入口文件
```

## 设置持久化

开关状态写入两处并保持一致：浏览器 `localStorage`（`dsh-usage-footer.enabled`，无需重启即可用）与宿主设置文档（重启一次 `dsh web` 后生效，存于 `settings.yaml` 的 `usage-footer` 段）。
