# 一次性 Profile 安装 / 启动 / 卸载证据

> 本文件记录 `dsh-usage-footer` v0.2.0 在**一次性（disposable）DSH Profile** 中的完整
> 安装、启动与卸载证据。一次性 Profile 与日常 `$DSH_HOME` 完全隔离（环境变量
> `DSH_HOME` 指向临时目录），实验结束后已删除。

## 环境

| 项 | 值 |
|---|---|
| 操作系统 | Windows（Node.js v26.5.0） |
| DSH CLI | `@deepseek-ai/dsh@0.1.1-rc.2`（`node .../dsh/lib/bin.js -V`） |
| 一次性 Profile | `DSH_HOME=$TEMP/dsh-evidence-home`（未配置任何密钥，测试后删除） |
| 插件版本 | `dsh-usage-footer@0.2.0`（本仓库 `package.json` + `cordis.patch.yml`） |

## 1. 安装

按标准 Bundle 安装：把本包放入 Profile 的模块目录，并把包名加入 web Profile 的
bundle 列表（等价于 `dsh plugin --profile web add` 的效果）：

```powershell
# 1) 镜像 bundle 到一次性 Profile 的模块目录
New-Item -ItemType Directory -Force "$env:DSH_HOME\profiles\node_modules\dsh-usage-footer\lib"
Copy-Item package.json, cordis.patch.yml, LICENSE, README.md "$env:DSH_HOME\profiles\node_modules\dsh-usage-footer\"
Copy-Item lib\index.js, lib\client.js "$env:DSH_HOME\profiles\node_modules\dsh-usage-footer\lib\"

# 2) 注册进 web Profile 的 bundle 列表
#    profiles\web\package.json → dsh.profile.bundles += "dsh-usage-footer"

# 3) 组合验证（--dump-config 输出中出现本 Bundle 的入口行）
node .../dsh/lib/bin.js --profile web --dump-config
```

结果（节选）：

```yaml
# == dsh-usage-footer
- id: dsh-usage-footer
  name: dsh-usage-footer
```

Bundle Patch（本仓库 `cordis.patch.yml`）只新增一个插件自有入口 ID `dsh-usage-footer`，
不禁用、不替换、不遮蔽任何 `@deepseek-ai/*` 官方组件；浏览器半通过 `dsh.client`
自动进入 web 插件表，无需 Patch 行。

## 2. 启动与运行验证

```powershell
node .../dsh/lib/bin.js web --port 0 --no-open
# dsh web: http://127.0.0.1:11456   ← OS 分配的一次性端口
```

验证结果：

- **宿主路由** `GET /usage-status` → HTTP 200（一次性 Profile 未配密钥，余额字段按
  设计为 null，路由本身正常响应）：

  ```json
  { "month": 8, "year": 2026, "balance": null, "todaySpend": null,
    "usageAmount": null, "usageCost": null, "errors": [] }
  ```

- **浏览器插件进入启动清单**：`/` 返回的 `__DSH_BOOT__` 中包含客户端行：

  ```json
  {"id":"dsh-usage-footer","url":"/plugins/dsh-usage-footer/client.js?rev=635cfbee99a9",
   "rev":"635cfbee99a9","inject":["@deepseek-ai/dsh-client-runtime","@deepseek-ai/dsh-client-locale", ...]}
  ```

- **客户端 bundle 可下载**：`GET /plugins/dsh-usage-footer/client.js` → HTTP 200
  （35,309 字节，`window.__ModuleLoader__.load` 格式）。

- **回环护栏**：服务仅绑定 127.0.0.1，局域网地址连接被拒绝；路由内另有
  `isLoopback` 校验，非回环对端返回 403。

## 3. 卸载

```powershell
# 1) 从 bundles 列表移除包名
# 2) 删除模块目录
Remove-Item -Recurse "$env:DSH_HOME\profiles\node_modules\dsh-usage-footer"
# 3) 组合验证：入口行消失
node .../dsh/lib/bin.js --profile web --dump-config   # 不再包含 dsh-usage-footer
```

结果：`--dump-config` 输出不再包含 `name: dsh-usage-footer`，服务进程已停止。

## 兼容性声明（package.json）

```json
"dsh": {
  "bundle": { "patch": "./cordis.patch.yml" },
  "client": { "platform": "web", "inject": [...] },
  "compatibility": {
    "dsh": ">=0.1.0-rc.8 <0.2.0",
    "node": ">=20 <27",
    "dshReleases": {
      "0.1.0-rc.8": "compatible",
      "0.1.1-rc.1": "compatible",
      "0.1.1-rc.2": "compatible"
    }
  }
}
```

- 上述证据在 **0.1.1-rc.2** 上实际执行通过；`0.1.1-rc.1` / `0.1.0-rc.8` 使用同一
  套稳定公开接口（`webServer.register`、`credentials`、`settings`、`dsh.client` web
  插件表、`settings.general.item` 槽位），按相同安装路径工作。
- Node.js 范围 `>=20 <27`：宿主半使用标准 Node API（`node:fs`、`node:path`、
  `node:os`、全局 `fetch`），无原生模块。

## 备注

- 本证据是**一次性 Profile 的安装/启动/卸载**验收，未在一次性 Profile 中配置
  `DEEPSEEK_API_KEY`，因此余额字段为 null——配置密钥后该路由返回真实余额；日常
  Profile 中的长期运行效果另有使用记录。
- 一次性 Profile 目录 `$TEMP/dsh-evidence-home` 已在实验结束后删除。
