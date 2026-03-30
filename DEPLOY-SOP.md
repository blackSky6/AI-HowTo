# SOP: Astro 项目从编码到 Cloudflare Pages 部署

> 适用于：Astro 静态站点 + GitHub + Cloudflare Pages  
> 最后更新：2026-03-31

---

## 一、新项目初始化

### 1. 创建项目
```bash
npm create astro@latest my-project
cd my-project
npm install
```

### 2. 初始化 Git 并推送 GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create blackSky6/my-project --public --source=. --push
```

---

## 二、Cloudflare Pages 项目创建

> ⚠️ 关键：必须用 **GitHub 集成方式** 创建，不能用 Direct Upload（Direct Upload 后期无法切换到 GitHub 自动部署）

### 通过 Cloudflare Dashboard（推荐）
1. 登录 [dash.cloudflare.com](https://dash.cloudflare.com)
2. Workers & Pages → Create → Pages → **Connect to Git**
3. 选 GitHub 仓库 → 配置：
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 保存 → 首次自动部署

### 通过 API 创建（不推荐，会变成 Direct Upload 模式）

---

## 三、GitHub Actions 自动部署配置

> ⚠️ GitHub Actions runner 上 npm 有已知 bug（`Exit handler never called`），**必须用 pnpm 替代**

### 3.1 创建 workflow 文件

`.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false

      - name: Install dependencies and wrangler
        run: pnpm install --no-frozen-lockfile && pnpm add -g wrangler

      - name: Build
        run: pnpm run build

      - name: Deploy to Cloudflare Pages
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: wrangler pages deploy dist --project-name=my-project --commit-dirty=true
```

### 3.2 配置 GitHub Secrets
```bash
gh secret set CLOUDFLARE_API_TOKEN --body "YOUR_CF_TOKEN"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "YOUR_CF_ACCOUNT_ID"
```

> GitHub token 需要 `workflow` scope：
> ```bash
> gh auth refresh -h github.com -s workflow
> ```

---

## 四、自定义域名绑定

### 4.1 把域名添加到 Cloudflare（API）
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"example.com","account":{"id":"ACCOUNT_ID"},"jump_start":true}'
```
记录返回的 `zone_id` 和 `name_servers`。

### 4.2 配置 DNS 指向 Pages
```bash
# 根域名
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"example.com","content":"my-project.pages.dev","ttl":1,"proxied":true}'

# www
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"www","content":"my-project.pages.dev","ttl":1,"proxied":true}'
```

### 4.3 绑定域名到 Pages 项目
```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT/pages/projects/my-project/domains" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"example.com"}'
```

### 4.4 去域名注册商改 NS
- 将 NS 改为 Cloudflare 给的两个地址（如 `jasper.ns.cloudflare.com`）
- NS 传播时间：5 分钟～24 小时

### 4.5 验证
```bash
dig NS example.com @8.8.8.8 +short
curl -sI https://example.com | head -3
```

---

## 五、Cloudflare Token 权限要求

| 操作 | 需要权限 |
|------|---------|
| 添加 Zone（域名） | `Zone:Edit`（账户级） |
| 修改 DNS | `Zone DNS:Edit` |
| Pages 部署 | `Cloudflare Pages:Edit` |
| 绑定自定义域名 | `Zone:Edit` + `Pages:Edit` |

**推荐**：创建一个 Custom Token，选 Account 级别，勾选所有 Zone 和 Pages 权限。

---

## 六、日常开发流程

```bash
# 本地开发
npm run dev

# 提交代码
git add .
git commit -m "feat: xxx"
git push origin main
# → GitHub Actions 自动触发 → pnpm build → wrangler deploy → 上线
```

整个流程约 2-3 分钟完成部署。

---

## 七、常见问题排查

| 问题 | 原因 | 解法 |
|------|------|------|
| `npm error Exit handler never called` | GitHub Actions runner npm bug | 换 pnpm |
| `wrangler: not found` | wrangler-action 内部用 npm 安装失败 | 用 `pnpm add -g wrangler` 手动装 |
| Zone 添加报权限错误 | Token 缺 Zone:Create | 重建 Token 加权限 |
| Pages 无法绑定 GitHub | 项目是 Direct Upload 模式 | 删重建，用 GitHub 集成方式创建 |
| NS 迟迟不生效 | 注册商缓存 | 等待，最长 24h；用 `dig @8.8.8.8` 验证 |
