# SOP: Astro 项目从编码到 Cloudflare Pages 部署

> 适用于：Astro 静态站点 + GitHub + Cloudflare Pages  
> 最后更新：2026-03-31

---

## 一、新项目初始化

### 1. 创建项目
```bash
npm create astro@latest my-project
cd my-project
npx pnpm install   # ⚠️ 必须用 pnpm，不要用 npm install
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

---

## 三、GitHub Actions 自动部署配置

> ⚠️ GitHub Actions runner 上 npm 有已知 bug（`Exit handler never called`），**必须用 pnpm 替代**

### 3.1 workflow 文件模板

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
          node-version: '22'   # Astro v6 要求 >=22

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false

      - name: Install dependencies and wrangler
        run: pnpm install --no-frozen-lockfile && pnpm add -g wrangler

      - name: Build
        env:
          PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.PUBLIC_CLERK_PUBLISHABLE_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
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
# 如有其他环境变量同样方式设置
```

---

## 四、自定义域名绑定

### 4.1 把域名添加到 Cloudflare（API）
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"example.com","account":{"id":"ACCOUNT_ID"},"jump_start":true}'
```

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
- 将 NS 改为 Cloudflare 给的两个地址
- NS 传播时间：5 分钟 ～ 24 小时

---

## 五、Cloudflare Token 权限要求

| 操作 | 需要权限 |
|------|---------|
| 添加 Zone（域名） | `Zone:Edit`（账户级） |
| 修改 DNS | `Zone DNS:Edit` |
| Pages 部署 | `Cloudflare Pages:Edit` |
| 绑定自定义域名 | `Zone:Edit` + `Pages:Edit` |

---

## 六、接入 Google OAuth 登录（Clerk + 静态站）

> ⚠️ **不要用 `@astrojs/cloudflare` SSR adapter + `@clerk/astro`**  
> wrangler CLI 部署 SSR 产物会一直 404（adapter 生成的 `dist/server/` 结构与 wrangler pages deploy 不兼容）  
> **正确方案：静态站 + ClerkJS 浏览器 SDK（CDN 引入）**

### 6.1 在 head 引入 ClerkJS
```html
<script define:vars={{ clerkKey }}>
  window.__clerk_publishable_key = clerkKey;
</script>
<script async crossorigin="anonymous"
  data-clerk-publishable-key={clerkKey}
  src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js">
</script>
```

### 6.2 初始化并挂载按钮
```js
window.addEventListener('load', async () => {
  const clerk = window.Clerk;
  if (!clerk) return;
  await clerk.load();

  const authDiv = document.getElementById('clerk-auth');
  authDiv.innerHTML = '';

  if (clerk.user) {
    clerk.mountUserButton(authDiv, { afterSignOutUrl: '/' });
  } else {
    const btn = document.createElement('button');
    btn.textContent = 'Sign in';
    btn.onclick = () => clerk.openSignIn({ afterSignInUrl: window.location.href });
    authDiv.appendChild(btn);
  }
});
```

### 6.3 Clerk Webhook 同步用户到 Supabase
- Webhook 端点：`/api/webhooks/clerk`（需要 SSR，如果静态站就用 Cloudflare Worker 或单独 API 服务）
- Events：`user.created`、`user.updated`
- 验证签名：用 `svix` 库
- 环境变量：`CLERK_WEBHOOK_SECRET`

### 6.4 Clerk test 环境
- `pk_test_` key 不限制 redirect URL，本地和测试环境直接用
- 上生产换 `pk_live_` 后才需要在 Clerk Dashboard 配 Allowed Origins

---

## 七、本地开发规范

> ⚠️ 本地装包**必须用 pnpm**，不要用 npm

```bash
npx pnpm install          # 安装依赖
npx pnpm add some-package # 新增包
npx pnpm run dev          # 本地开发
```

提交代码后自动触发 CI，约 2-3 分钟上线。

---

## 八、Astro v6 迁移注意事项

| 变更 | 旧写法 | 新写法 |
|------|--------|--------|
| Content Collections config 路径 | `src/content/config.ts` | `src/content.config.ts` |
| Collection 定义需要 loader | `type: 'content'` | `loader: glob({...})` |
| 文章唯一标识 | `post.slug` | `post.id` |
| 渲染文章 | `post.render()` | `import { render }; render(post)` |
| hybrid 模式 | `output: 'hybrid'` | 已移除，统一用 `output: 'static'` |
| Node 版本要求 | Node 18+ | Node **22+** |

---

## 九、常见问题排查

| 问题 | 原因 | 解法 |
|------|------|------|
| `npm error Exit handler never called` | GitHub Actions runner npm bug | 换 pnpm |
| `wrangler: not found` | npm 安装失败 | 用 `pnpm add -g wrangler` |
| `Node.js vXX is not supported by Astro` | Node 版本过低 | workflow 改 `node-version: '22'` |
| SSR 部署后访问 404 | `@astrojs/cloudflare` SSR 产物结构与 wrangler 不兼容 | 改用静态模式 + ClerkJS CDN |
| `ASSETS binding is reserved` | 项目有 `wrangler.toml` 与 adapter 冲突 | 删掉 `wrangler.toml` |
| `There is a deploy configuration at .wrangler/deploy/config.json` | 旧 SSR 部署缓存残留 | 删掉 `.wrangler/` 目录并提交 |
| Clerk 组件不渲染 | `@clerk/astro` 依赖 SSR 运行时 | 改用 ClerkJS 浏览器 SDK |
| `Missing parameter: slug` | Astro v6 content collection 用 `id` 不用 `slug` | 全局替换 `post.slug` → `post.id` |
| `LegacyContentConfigError` | v6 config 路径变了 | 把 `config.ts` 移到 `src/content.config.ts` 并加 loader |
| Pages 无法绑定 GitHub | 项目是 Direct Upload 模式 | 删重建，用 GitHub 集成方式创建 |
| NS 迟迟不生效 | 注册商缓存 | 等待，最长 24h；用 `dig @8.8.8.8` 验证 |
