# AI How-To Hub — MVP 产品文档

> 版本：v0.1 | 日期：2026-03-27 | 作者：比克

---

## 一、产品定位

**一句话**：帮普通人搞明白"AI能帮我做什么"以及"具体怎么做"的教程导航站。

**目标用户**：
- 对AI感兴趣但不知道从哪开始的普通人
- 想用AI提效但不会选工具的职场人
- 搜索 "how to use ai to [做某事]" 的英文用户

**核心价值**：把"AI能做什么"翻译成"你该怎么做"——每个页面解决一个具体问题。

**品牌关键词**：`ai how to`（Google Trends last_ratio 58.3，HN热度5643，趋势强劲上升）

---

## 二、商业模式

```
流量入口：Google搜索（长尾关键词SEO）
          ↓
着陆页：How-To教程（解决用户具体问题）
          ↓
变现层：
  ├── Affiliate 佣金（推荐工具的注册/付费链接）
  ├── Google AdSense 展示广告
  ├── 邮件列表 → Newsletter → 付费内容
  └── 工具对比页（高转化，集中affiliate）
```

**收入预期（保守估算）**：
| 阶段 | 时间 | 月UV | 月收入 |
|------|------|------|--------|
| MVP | 0-2月 | 0-1K | $0 |
| 增长 | 2-4月 | 1K-10K | $100-500 |
| 规模 | 4-8月 | 10K-50K | $500-3000 |
| 成熟 | 8-12月 | 50K+ | $3000+ |

---

## 三、MVP 范围（2周交付）

### 3.1 核心功能

**必须有（P0）：**
- [ ] 首页：热门教程导航 + 分类入口
- [ ] How-To 教程页模板：标准化结构，SEO优化
- [ ] 工具对比页模板：横向对比 + affiliate链接
- [ ] 20篇种子内容（覆盖搜索量最高的长尾词）
- [ ] SEO基础设施：sitemap.xml、robots.txt、meta tags、JSON-LD structured data
- [ ] 响应式设计：移动端优先

**可以等（P1）：**
- [ ] 搜索功能
- [ ] Newsletter订阅 + 邮件收集
- [ ] 评分/投票系统
- [ ] 暗色模式

**不做（P2+）：**
- 用户注册/登录
- 评论系统
- 付费墙
- 多语言（中文版后期再加）

### 3.2 页面结构

```
aihowto.com/
├── /                           → 首页（热门教程 + 分类导航）
├── /how-to/[slug]              → 教程详情页（核心SEO着陆页）
├── /compare/[slug]             → 工具对比页（高转化）
├── /tools                      → 工具目录页
├── /about                      → 关于我们
└── /blog/[slug]                → 博客（趋势分析、行业观点，后期加）
```

### 3.3 教程页模板（最重要的页面）

每篇 How-To 教程的标准结构：

```
URL: /how-to/remove-background-with-ai

<Title> How to Remove Background with AI (Free & Paid Tools Compared) </Title>
<Meta Description> Learn how to remove image backgrounds using AI in seconds. We tested 5 tools and show you step-by-step which one works best for your needs. </Meta>

正文结构：
┌─────────────────────────────────┐
│ Hero: 标题 + 一句话摘要 + 预计阅读时间  │
├─────────────────────────────────┤
│ TL;DR: 快速回答（30秒看完版）         │
├─────────────────────────────────┤
│ 推荐工具卡片（Top Pick）              │
│  → 工具名 + 评分 + 一句话 + CTA按钮   │
├─────────────────────────────────┤
│ Step-by-Step 教程                   │
│  → 截图 + 编号步骤 + 小tips          │
├─────────────────────────────────┤
│ 工具对比表格                         │
│  → 功能/价格/优缺点                  │
├─────────────────────────────────┤
│ FAQ（常见问题）                      │
│  → 用 Schema FAQ markup             │
├─────────────────────────────────┤
│ 相关教程推荐                         │
└─────────────────────────────────┘
```

### 3.4 首批20篇内容选题

基于pipeline数据 + 长尾词搜索量，优先覆盖：

**Tier 1 — 高搜索量（月搜 5K+）：**
1. How to use AI to write emails
2. How to remove background with AI
3. How to generate images with AI
4. How to make a logo with AI
5. How to edit photos with AI
6. How to create music with AI
7. How to make AI art
8. How to detect AI-generated text
9. How to summarize text with AI
10. How to use AI for coding

**Tier 2 — 中搜索量 + 低竞争（月搜 1K-5K）：**
11. How to use AI to create presentations
12. How to generate AI avatars
13. How to use AI for video editing
14. How to convert text to speech with AI
15. How to use AI to plan your schedule

**Tier 3 — 新兴趋势（上升中）：**
16. How to build an AI agent
17. How to use AI for interior design
18. How to create AI-generated tattoo designs
19. How to use AI to analyze data
20. How to make AI-generated memes

---

## 四、技术架构

### 4.1 技术栈

| 层 | 选型 | 理由 |
|----|------|------|
| 框架 | **Astro** | 静态生成、SEO原生友好、构建快、学习成本低 |
| 样式 | **Tailwind CSS** | 快速开发、响应式、一致性 |
| 内容 | **MDX** | Markdown写内容+组件化，git管理 |
| 部署 | **Cloudflare Pages** | 免费、全球CDN、速度快 |
| 域名 | 待定 | Cloudflare管理DNS |
| 分析 | **Plausible** 或 **Umami** | 隐私友好、轻量、免费自部署 |
| 搜索 | Pagefind（客户端） | 零成本、纯静态 |

### 4.2 项目结构

```
ai-howto/
├── src/
│   ├── content/
│   │   ├── how-to/           → MDX教程文件
│   │   ├── compare/          → MDX对比文件
│   │   └── config.ts         → 内容schema
│   ├── components/
│   │   ├── HowToCard.astro   → 教程卡片
│   │   ├── ToolCard.astro    → 工具推荐卡片
│   │   ├── CompareTable.astro→ 对比表格
│   │   ├── FAQ.astro         → FAQ组件（带Schema）
│   │   └── SEO.astro         → SEO meta组件
│   ├── layouts/
│   │   ├── Base.astro        → 基础布局
│   │   └── HowTo.astro       → 教程页布局
│   └── pages/
│       ├── index.astro       → 首页
│       ├── how-to/[...slug].astro
│       ├── compare/[...slug].astro
│       └── tools.astro
├── public/
│   ├── images/               → 教程截图
│   └── og/                   → OG社交图
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

### 4.3 SEO 技术要求

- [x] 静态HTML生成（SSG），不依赖客户端JS渲染
- [ ] 每页独立 `<title>` + `<meta description>`
- [ ] OpenGraph + Twitter Card meta tags
- [ ] JSON-LD: `HowTo` schema（Google富摘要）
- [ ] JSON-LD: `FAQPage` schema
- [ ] 自动生成 `sitemap.xml`
- [ ] `robots.txt` 配置
- [ ] Canonical URL
- [ ] 图片 alt text + lazy loading + WebP
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms
- [ ] 内部链接策略：每篇教程链接2-3篇相关教程

---

## 五、内容生产流程

### 5.1 单篇内容SOP

```
1. 选词：从每日pipeline报告选长尾词
         ↓
2. 调研：web_fetch 抓取 SERP Top 5 内容，分析结构和缺口
         ↓
3. 写稿：弗利萨按模板写 MDX（标题/TL;DR/步骤/对比/FAQ）
         ↓
4. 截图：悟空用浏览器自动化截取工具操作步骤截图
         ↓
5. 审核：琪琪检查内容质量 + SEO元素完整性
         ↓
6. 发布：git push → Cloudflare Pages 自动构建部署
```

### 5.2 内容规范

- 标题格式：`How to [动作] with AI ([附加价值])`
- 正文：800-1500词（英文），实操为主，不灌水
- 每篇必须有：TL;DR、至少1个工具推荐（带affiliate链接位）、步骤截图、FAQ
- 工具推荐必须基于真实测试，不推没用过的
- 更新频率：MVP期每天1-2篇，规模期每天3-5篇

---

## 六、变现设计

### 6.1 Affiliate 接入

优先接入佣金比例高的AI工具affiliate program：

| 工具 | 类型 | 预估佣金 |
|------|------|----------|
| Jasper | AI写作 | 30% recurring |
| Midjourney | AI绘图 | — (无官方affiliate) |
| Remove.bg | 抠图 | 15% per sale |
| Descript | 视频编辑 | 20% first year |
| ElevenLabs | TTS | 22% recurring |
| Notion AI | 生产力 | — (待查) |
| Canva | 设计 | $36/paid user |

### 6.2 广告位

- 教程页侧边栏：1个广告位
- 教程页文中：步骤之间插1个
- 对比页底部：1个
- MVP期先不接广告，等月UV过5K再申请AdSense

### 6.3 邮件列表

- 每篇教程底部 + 首页 → 邮件订阅框
- 免费工具：Buttondown 或 Resend
- 每周发一封：本周最佳教程 + 新工具推荐

---

## 七、成本估算

### MVP期（前2个月）

| 项目 | 月成本 |
|------|--------|
| 域名 | ~$1/月（$10-15/年） |
| Cloudflare Pages | $0 |
| 内容生产（团队内部） | $0（用现有团队） |
| pipeline数据源 | ~$3/天（已有） |
| **总计** | **~$1/月 + 人力** |

### 增长期（2-6个月）

| 项目 | 月成本 |
|------|--------|
| 域名+部署 | $0-5 |
| DataForSEO（SERP监控） | $60-90 |
| 图片CDN（如需） | $0-10 |
| **总计** | **$60-105/月** |

---

## 八、里程碑

| 里程碑 | 时间 | 交付物 |
|--------|------|--------|
| M1: 技术骨架 | 第1周 | Astro项目搭建 + 模板组件 + CI/CD |
| M2: 种子内容 | 第2周 | 20篇教程上线 + SEO配置完成 |
| M3: 首次索引 | 第3周 | Google Search Console 提交 + 首批页面被收录 |
| M4: 流量验证 | 第6周 | 日UV > 50，验证SEO策略是否生效 |
| M5: 变现启动 | 第8周 | 接入首批affiliate + AdSense申请 |
| M6: 规模化 | 第12周 | 100+篇内容，月UV > 5K |

---

## 九、风险 & 应对

| 风险 | 概率 | 应对 |
|------|------|------|
| Google收录慢 | 中 | 主动提交sitemap + 外链建设（Reddit/HN分享） |
| 内容同质化 | 高 | 每篇必须有真实截图+个人测评，不做纯AI生成的水文 |
| Affiliate审批不过 | 低 | 先做内容积累，有流量后再申请 |
| 竞品已占位 | 中 | 走差异化：专注"普通人视角"，不做技术文档风格 |
| 关键词判断失误 | 低 | 每日pipeline持续验证，及时调整内容方向 |

---

## 十、下一步

1. **勤息决定**：域名 + 确认技术栈（建议Astro）
2. **悟空执行**：搭建项目骨架 + 模板组件（M1，1周）
3. **弗利萨执行**：开始写前20篇种子内容（M2，1周）
4. **比克协调**：pipeline选词 → 内容排期 → 进度跟踪

---

> **核心原则**：先有内容，再有流量，再有收入。MVP阶段只做两件事——搭好框架、填好内容。其他都是后话。
