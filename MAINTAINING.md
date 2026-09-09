# Faro API 文档维护

本仓库只含公开使用文档，与 Faro 生产应用、客户数据库、Open Study 产品及其文档独立。不要在这里存放真实密钥、客户截图或生产配置。

## 内容约定

- 先讲点哪里、填什么、成功后看什么，再讲术语。
- CC Switch 和 Codex++ 是主要入口；官方 Claude Code / Codex 的手动方法放后面。
- 模型用精确 ID；动态价格、客户端限制和可用性回到当前模型广场，不做静态可用性保证。
- 示例仅使用占位符，不自动执行付费探测。通过语法检查不等于真实模型或工具链验证。
- 真实截图写软件版本；教学示意图必须标明示意，不冒充实测截图。发布前逐图检查敏感信息。

## 视觉约定

以现有 Open Study 的 Mintlify 文档布局为主参考。沿用 Faro Route F 标记，不重做品牌。

- Palette: Faro Blue #155EEF, Ink #111827, Paper #FFFFFF, Line #E4E7EC, Tint #F5F8FF；深色高亮 #70A5FF。
- Type: 系统字体 / PingFang SC / Microsoft YaHei；代码使用文档引擎等宽字体，不额外下载字体。
- Layout: 左侧按用户任务分组，中间正文，右侧本页目录。入口先给 CC Switch / Codex++，不以接口名堆满首页。
- Signature: 地址、密钥、模型三格填写提示。内页保持原生 Steps/Tabs/Table/Code 的交互，不画假输入框误导用户。
- Depth: 细边框和轻底色，避免大面积渐变、营销标语、过多警告卡和所有卡片一模一样。
- Spacing: 以 4 / 8 像素递进；手机三格纵排。明暗主题保持正文对比度和同一信息层级。

## 本地验收

Node 22 或更新版本；安装锁定依赖后运行：

```sh
npm ci
npm run check
npm run validate
npm run links
npm run dev
```

本地端口 3240。浏览器验收包括全部页面、站内导航、代码复制、标签页、搜索、明暗切换、手机目录和横向溢出。公开发布后需重新检查搜索索引、页面 HTML、资源与 Faro 文档导航跳转。

`npm run dev` 的本地预览适配只绑定 127.0.0.1，并为导航中的公开页面提供 `.md` 正文和 `/llms.txt`，方便本机整页复制。内部维护文件不会暴露；它不代替公开站的 Markdown/索引验收。

Mintlify 搜索和内置云助手依赖站点服务，不会自动为未推送的新稿建立索引。需要登录测试时，记录原 `mint config get subdomain`，临时选择 `faro-api-guide`；**不要选 `faro-api`，后者是 Open Study 文档**。启动完成后恢复原配置（原来未设置则 `mint config clear subdomain`），避免影响别的项目。没有索引时用左侧目录阅读，不能将空结果记为搜索通过。

2026-09-10 锁定开发工具 mint 4.2.882。npm audit 仍有 17 项开发依赖告警（3 moderate、14 high），omit-dev 为 0；不要部署本地开发服务器到公网，也不要为清除数字盲目执行 `audit fix --force`。

## 核对来源（2026-09-10）

- Faro 已有小白教程及当前经典前端的路由名称；只借用公开说明，不复制旧截图里的账号数据。
- CC Switch 官方用户手册，最新 release 检查为 v3.20.2；本机为 v3.20.0。
- Codex++ 是 BigPizzaV3/CodexPlusPlus 桌面管理工具，核对发布版 v1.2.56。B 站下载页指向该项目，不采用同名 yuguorui 命令行分支教程。Base URL 以实际 Responses 路径构造为依据，不拿模型列表自动补路径行为推断配置正确。
- 官方 Codex / Claude Code / Cline / OpenAI SDK 说明，链接在各页。第三方线路能力需独立确认，不将官方功能支持直接等同于 Faro 所有模型支持。

## 发布边界

当前是本地验收候选。用户确认前不推送可能自动发布的默认分支、不改 Faro DocsLink。不升级 Faro 主程序、不改模型、渠道、余额、支付、联盟或监控。后续发布使用独立文档站；新站验证通过并获准切换后，才单独更新 DocsLink 并保存旧值以便回退。
