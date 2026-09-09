# Faro API 使用文档

独立的 Mintlify 文档站源码。当前为本地验收候选，不代表已经替换 Faro 公网文档入口。

## 本地预览

使用 Node.js 22，并安装 Python 3.11 或更新版本供检查脚本解析 TOML。

```sh
npm ci
npm run check
npm run validate
npm run links
npm run dev
```

打开 http://127.0.0.1:3240 。预览只绑定本机回环地址，不向局域网提供文档开发服务。若 Python 命令名不同，通过 FARO_DOCS_PYTHON 指定。检查只验证语法、结构、链接等，不会发送真实模型请求。

## 内容与发布

- 入门入口：index.mdx；页面导航：docs.json。
- 主教程只保留 CC Switch、Codex++ 两个 API 管理器。Codex 是配置后使用的工具，不另写手动配置教程。
- 当前公开内容精简为 9 页；原有 13 页高级/重复说明保存在 drafts/advanced-v1，不对外发布。
- 文案、视觉和事实核对规则见 MAINTAINING.md。
- 示例只用占位密钥，禁止提交个人配置、真实账号截图和生产导出。
- 默认分支可能触发 Mintlify 自动发布。用户验收前不要推送默认分支，不更新 Faro DocsLink。
- 本仓库不包含 Faro 后端、数据库或 Open Study 产品代码。
