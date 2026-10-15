# 网络开拓者协会 2026-2027 学年度第一次全体大会 · 展示页

大会用的「PPT 类似物」，用 Vue 3 + Vite 写成网页：像官网一样从上往下滚动浏览，左侧是章节侧栏，
每节都占满一屏、也可以随手往下一节滚。视觉风格（配色、得意黑标题、亮/暗主题、卡片与胶带装饰）
沿用 [BITNP 官网](../BITNP_Website-master)；「活动场地」一节直接内嵌了
[bitnp-outposts](../bitnp-outposts) 的 3D 据点地图组件。

## 快速开始

```sh
pnpm install     # 安装依赖（首次）
pnpm dev         # 开发服务器 → http://localhost:5173
pnpm build       # 类型检查 + 打包到 dist/
pnpm preview     # 预览打包结果
```

本地跑用 `pnpm dev`；部署到 GitHub Pages 见下面「部署」一节（推上 main 就自动构建发布）。

## 部署到 GitHub Pages

仓库里的 `.github/workflows/deploy.yml` 会在 **push 到 main**（或手动 `workflow_dispatch`）时：
`pnpm install --frozen-lockfile` → `pnpm build`（内含 `vue-tsc` 类型检查）→ 把 `dist/` 发布到 Pages。

第一次部署前只需要做一次设置：

1. 在 GitHub 上建好仓库 `bitnp-general-body-meeting-2026`，把本地代码推上去：
   `git remote add origin git@github.com:<org-or-user>/bitnp-general-body-meeting-2026.git`，然后
   `git push -u origin main`
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**（不要选分支）
3. 推一次代码，Actions 跑完后访问
   `https://<org-or-user>.github.io/bitnp-general-body-meeting-2026/`

几个和子路径相关的细节，都是自动的、不用手改：

- `vite.config.ts` 里 `build` 时 base 会变成 `/bitnp-general-body-meeting-2026/`
  （本地 `dev` 仍然是根路径），CI 里再用 `actions/configure-pages` 的输出覆盖，
  所以**改仓库名、换成自定义域名都不用动代码**；
- 3D 模型路径本来就用 `import.meta.env.BASE_URL` 拼（`public/model/*.glb`），
  favicon 走 `%BASE_URL%favicon.png`，都不会 404；
- `public/.nojekyll` 让 Pages 不要用 Jekyll 处理产物。

Pages 默认就是 HTTPS，正好可以用来在手机上测陀螺仪（传感器 API 要求安全上下文）。

## 章节结构（对应会议议程）

| # | 页面 | 对应议程 | 内容文件 |
|---|------|----------|----------|
| 0 | 封面 | — | `src/data/deck.ts` |
| 1 | 主席团成员 | 1. 介绍主席团成员 | `src/data/members.ts` |
| 2 | 组织架构（思维导图） | 2. 介绍组织架构 | `src/data/departments.ts` |
| 3 | 我们的据点（3D 地图） | 3. 介绍组织活动场地 | `src/data/venues.ts` |
| 4 | 数字资产概况 | 4. 介绍组织数字资产概况 | `src/data/assets.ts` |
| 5 | 接下来一年（时间轴） | 5. 重要活动时间节点 | `src/data/timeline.ts` |
| 6 | 各部门发展规划 | 6. 各部门介绍发展规划 | `src/data/departments.ts`（`plan` 字段） |
| 7 | 谢谢大家 | — | `src/components/slides/ClosingSlide.vue` |

章节的顺序、侧栏里的名字与图标都来自 `src/data/deck.ts` 的 `slides` 数组；增删章节时同步改
`src/App.vue` 里的 `v-if / v-else-if` 分支即可。

- **组织架构**：思维导图在 `OrgSlide.vue` 里，节点内容（部门、部长团、普通成员、人数）来自
  `src/data/departments.ts` 的 `presidium` 与 `departments`（含每项的 `groups`）。

## 怎么改内容

所有正文都在 `src/data/` 下，改完刷新即可，不用动组件：

- **主席团成员**：`members.ts`。4 个位置已经排好版，`name` / `role` / `bio` 留空时会显示占位框。
  头像把图片放进 `src/assets/members/`，然后 `import avatar1 from '../assets/members/1.png'` 再填到 `avatar`。
- **数字资产**：`assets.ts`。`assetCategories` 是左侧分类，`assetItems` 是条目；
  页面上「选分类 → 选条目 → 看详情」是联动的。`metrics` 里填数据（粉丝数、访问量……），
  未知的先写「待补充」；`links` 是详情页下方的链接列表，**一个条目可以放多条**
  （一个仓库 / 一个站点一条，每条是 `{ label, href }`，`label` 是地址前面的小字、可省略，
  例如「文档站」「模板仓库」）。
- **时间轴**：`timeline.ts`。`date` / `category` / `color` 控制节点外观，`owner` 是主办部门。
- **部门规划**：`departments.ts` 的 `plan` 字段，留空就显示占位框（内容是各部门自己写的）。
- **封面信息**：`deck.ts` 的 `meeting`（日期、地点、主持人都还是「待定」）。

## 交互

- **浏览**：整页从上往下滚；也可以用键盘 ← / → / ↑ / ↓ / PgUp / PgDn / 空格 跳上一节 / 下一节，
  Home / End 跳到首尾，F 全屏，Esc 收起目录
- **左侧侧栏**：横屏（宽屏）是一条只显示图标的窄栏，鼠标悬停或键盘聚焦时伸出显示文字；
  竖屏（窄屏）默认隐藏，右上角「目录」按钮点开是全屏抽屉，选完自动收起
- **右上角**：亮色 / 暗色主题切换（记忆在 localStorage）
- **活动场地**：地图不再支持拖动 / 滚轮缩放——PC 上鼠标相对画面中心的位置、移动端陀螺仪（iOS 首次
  触摸时会请求权限）会让视角在初始值基础上微微移动与微微旋转，这段偏移是叠加在据点切换动画结果
  之上的，两者不会互相干扰；点地图上方的据点按钮与点黄色光柱效果完全一样

  > 手机上陀螺仪的前提：① 页面是 **https**（GitHub Pages 默认满足，本地局域网 http 会被浏览器
  > 直接拦掉）；② iOS 还要在 **设置 → Safari → 动作与方向访问（Motion & Orientation Access）**
  > 里打开——这一项默认是关的，关着的时候权限接口会直接返回"拒绝"且不弹任何提示。
  > 页面会在**任意位置的第一次触摸**（点地图、点按钮、滑动屏幕都算）里申请权限；
  > 如果拿不到数据，地图左下角会出现一行提示，照着提示打开权限后**轻触屏幕**即可重试。
  （镜头推近、其它光柱熄灭、弹出详情），再点一次同一个按钮就是取消选择；
  鼠标悬停据点按钮，对应光柱会像被悬停一样变亮变长——**有据点被选中时，光柱一律不响应悬停
  （保持选中状态，只是不再变高变亮）；没有选中时，光柱悬停与按钮悬停都照常生效**，
  进/出悬停都有缓动；触摸点按不会留下"卡住的悬停"；
  3D 场景第一次进入这一节时加载，之后常驻、离开视口时暂停渲染（省电）
- **组织架构**：点主席团或某个部门，右侧（竖屏时在下方）显示该单位的概况

## 响应式

断点沿用官网习惯（1200 / 1100 / 900 / 768 / 620 / 560 / 480），另外针对**手机横屏**单独处理：
`@media (orientation: landscape) and (max-height: 560px)` 会压缩顶栏、底栏与内边距，
时间轴在竖屏窄屏时切成竖向、横屏时保持横向。

## 目录

```
src/
├─ App.vue                  # 外壳：滚动布局 / 键盘跳节 / 当前章节跟踪
├─ style.css                # 设计令牌（配色、字体、亮暗主题）+ 共用排版
├─ types.ts                 # 内容模型 + BeaconConfig（地图组件的入参，勿改）
├─ data/                    # 所有正文内容
├─ composables/
│  ├─ useMediaQuery.ts      # 响应式断点（时间轴横竖切换用）
│  └─ useThemeLogo.ts       # 亮暗主题各一张 logo（顶栏 / 封面 / 结束页用）
└─ components/
   ├─ BitnpMap.vue          # 从 bitnp-outposts 移植的 3D 地图（见下方「移植改动」）
   ├─ OutpostsMap.vue       # 地图 + 据点按钮（悬停高亮 / 点击聚焦）+ 详情面板
   ├─ SideBar.vue           # 左侧章节侧栏（横屏图标栏 / 竖屏全屏抽屉）
   ├─ SlideHeader.vue       # 每页标题
   ├─ AvatarPlaceholder.vue # 头像占位
   ├─ TapeEffect.vue        # 官网同款胶带装饰（canvas 滚动文字）
   ├─ AppIcon.vue           # 线性图标（图标表在 data/icons.ts）
   ├─ ThemeToggle.vue       # 亮/暗主题
   └─ slides/               # 8 个页面
```

## 素材来源与移植改动

- 字体 `SmileySans-Oblique.woff2`、`logo.png`（亮色）、`logo-dark.png`（暗色）、`favicon.png`：来自 BITNP 官网
- `public/model/*.glb`：来自 bitnp-outposts（原来那个办公室视频已经删掉，太占体积）
- `src/components/BitnpMap.vue` 是从 bitnp-outposts 直接复制的，相对原版只有这几处改动，
  以后同步上游时留意别覆盖掉：
  1. `.bitnp-map` 的 `position: fixed` → `absolute`（让它铺满本节容器而不是整个视口）
  2. 新增 `hoveredId` / `focusedId` / `paused` 三个 props（据点按钮悬停高亮、据点按钮点击聚焦、
     离开视口时暂停渲染）
  3. 聚焦时的相机不再直接采用「当前聚焦光柱」的目标点，而是每帧朝它缓动
     （`BEACON_FOCUS_FOLLOW_EASE`），并且熄灭 / 点亮改用单独的 `BEACON_DIM_EASE`；
     这样从 A 据点切到 B 据点时，视角与光柱亮度、长度都是连续动画，不会瞬移
  4. 交互方式改成「鼠标位置 / 陀螺仪 → 视角微动」：删掉了滚轮缩放、拖拽旋转平移与双指手势
     （同时把 `touch-action` 从 `none` 改成 `pan-y`，让手指滑动重新交还给页面滚动）；
     新加的偏移是在 `updateCameraFrame` 既有结果之后叠加的，参数见 `LOOK_*` 常量，
     真机上手感方向相反时把 `LOOK_GYRO_SIGN_X/Y` 改成 -1

## 还需要补的

1. 主席团 4 人的头像、姓名、职务、自我介绍
2. 数字资产里所有标了「待补充」的数据；各服务 / 账号的真实链接
3. 「技术保障中心」的部门介绍（其余三个部门已按官网内容预填）
4. 时间轴的节点安排确认（除「第一次全体大会」外都是占位）
5. 封面日期、地点、主持人；结束页的二维码与联系方式
6. 各部门的发展规划（`departments.ts` 的 `plan`）
