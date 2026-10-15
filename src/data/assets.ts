import type { AssetCategory, AssetItem } from '../types'

/**
 * 数字资产 —— 内容整理自仓库根目录的 assets.md。
 *
 * 结构说明：
 *  · assetCategories = 转盘内圈（4 个分类）
 *  · assetItems = 转盘外圈。外圈是一条"按分类顺序摊平"的连续条目带，
 *    所以数组顺序就是展示顺序：先第一个分类的所有条目，再第二个分类……
 *  · 条目上的 links 可以放多条链接（一个仓库/一个站点一条），详情页下方逐条列出；
 *    每条链接的 label 是地址前面的小字（「文档站」「模板仓库」……），省略就只显示地址
 *  · links 一律填 https 地址，包括「校园网内访问」的内部系统
 *    （校园网外点了打不开，但地址本身还是有意义的，详情页里也会照常列出来）
 *  · 详情页的关键数据、状态标记都来自这里；要改内容只改这个文件
 */

export const assetCategories: AssetCategory[] = [
  {
    id: 'social',
    name: '官方媒体账号',
    description: '对外发声的窗口：微信公众号、B 站官号与 QQ 咨询群',
    color: 'var(--dept-chairman)',
    icon: 'megaphone',
  },
  {
    id: 'opensource',
    name: '开源仓库与项目',
    description: '托管在 GitHub / GitLab 上、人人可用可改的代码与文档',
    color: 'var(--dept-tech)',
    icon: 'github',
  },
  {
    id: 'services',
    name: '校园服务与内部系统',
    description: '跑在校园里的服务，以及协会自用的内部系统',
    color: 'var(--dept-clinic)',
    icon: 'server',
  },
  {
    id: 'ip',
    name: '设计资源与美术 IP',
    description: '树莓娘，以及一整套设计资源',
    color: 'var(--dept-media)',
    icon: 'sparkles',
  },
]

export const assetItems: AssetItem[] = [
  /* ----------------------------------------------------------- 官方媒体账号 */
  {
    id: 'wechat',
    category: 'social',
    name: '微信公众号「NetPioneer」',
    summary: '活动宣传与推送的主阵地',
    description:
      '微信搜索「NetPioneer」即可找到。协会的活动宣传、推送与日常动态都在这里发布，是协会对外的第一窗口。',
    metrics: [
      { label: '公众号', value: 'NetPioneer' },
      { label: '主要内容', value: '活动宣传推送' },
    ],
    tags: ['推送', '活动宣传'],
    status: '持续运营',
  },
  {
    id: 'bilibili',
    category: 'social',
    name: 'B 站「网络开拓者」',
    summary: '活动直播、录像，以及未来的更多视频',
    description:
      '协会 B 站官号。目前还是 3 级小号，还需努力运营～会进行活动直播、发布活动录像，未来也可能发布更多种类的视频。',
    metrics: [
      { label: '账号等级', value: '3 级' },
      { label: '内容形式', value: '直播 · 录像' },
    ],
    tags: ['视频', '直播', '录播'],
    links: [{ href: 'https://space.bilibili.com/89756733' }],
    status: '持续运营',
  },
  {
    id: 'qq-group',
    category: 'social',
    name: 'QQ 咨询群',
    summary: '绿群答疑报障 · 黑群选购咨询',
    description:
      '绿群：线上咨询电脑问题和故障相关事宜，线下预约见 i 北理「电脑义诊」模块；黑群：咨询电脑及相关电子产品选购相关事宜。',
    metrics: [
      { label: '绿群（答疑报障）', value: '936335415' },
      { label: '黑群（选购咨询）', value: '824722253' },
    ],
    tags: ['答疑', '社群'],
  },

  /* --------------------------------------------------------- 开源仓库与项目 */
  {
    id: 'github-org',
    category: 'opensource',
    name: 'BITNP GitHub 组织',
    summary: '协会所有开源仓库的入口',
    description:
      '协会的 GitHub 组织主页，论文模板、树莓娘系列、破冰小游戏与各类工具都挂在这里；「BITNP」上的更多仓库等你发现。',
    metrics: [
      { label: '组织主页', value: 'github.com/BITNP' },
      { label: '开源仓库', value: '100+ 个' },
    ],
    tags: ['开源', '组织主页'],
    links: [{ href: 'https://github.com/BITNP' }],
    status: '持续维护',
  },
  {
    id: 'bithesis',
    category: 'opensource',
    name: 'BIThesis',
    summary: 'LaTeX 论文排版模板',
    description:
      '北京理工大学学位论文 LaTeX 模板，含本科与研究生模板、配套 Wiki 与在线文档站，是协会影响力最大的开源项目之一，服务范围早已超出协会本身。',
    metrics: [
      { label: '在线文档', value: 'bithesis.bitnp.net' },
      { label: '配套仓库', value: 'BIThesis-wiki' },
    ],
    tags: ['LaTeX', '毕业论文', '对外开源'],
    links: [
      { label: '文档站', href: 'https://bithesis.bitnp.net/' },
      { label: '模板仓库', href: 'https://github.com/BITNP/BIThesis' },
      { label: 'Wiki 仓库', href: 'https://github.com/BITNP/BIThesis-wiki' },
    ],
    status: '持续维护',
  },
  {
    id: 'raspberry-vtuber',
    category: 'opensource',
    name: '树莓娘 AI 虚拟主播',
    summary: '让树莓娘「活」起来的直播系统',
    description:
      '由声音、调度、前端、拾音四个仓库组成的树莓娘 AI 虚拟主播系统，是「用技术给树莓娘创造存在形态」的主要尝试。',
    metrics: [
      { label: '仓库数', value: '4 个' },
      { label: '组成', value: '声音 · 调度 · 前端 · 拾音' },
    ],
    tags: ['虚拟主播', 'AI', '树莓娘'],
    links: [
      { label: '声音', href: 'https://github.com/BITNP/bitnp-raspberrygirl-vtuber-sound' },
      { label: '调度', href: 'https://github.com/BITNP/bitnp-raspberrygirl-vtuber-orchestrator' },
      { label: '前端', href: 'https://github.com/BITNP/bitnp-raspberrygirl-vtuber-frontend' },
      { label: '拾音', href: 'https://github.com/BITNP/bitnp-raspberrygirl-vtuber-mic' },
    ],
    status: '开发中',
  },
  {
    id: 'raspberry-agent',
    category: 'opensource',
    name: '树莓娘 QQ 智能体',
    summary: '跑在 QQ 里的树莓娘',
    description: '树莓娘 QQ 智能体：让吉祥物能直接进群聊和大家互动。',
    metrics: [{ label: '仓库', value: 'miss-raspberry-agent' }],
    tags: ['智能体', '树莓娘'],
    links: [{ href: 'https://github.com/BITNP/miss-raspberry-agent' }],
  },
  {
    id: 'raspberry-toolkit',
    category: 'opensource',
    name: '树莓娘工具箱',
    summary: '计算机底层信息与性能指标获取工具',
    description: '获取计算机底层信息与性能指标的小工具，也是树莓娘系列项目的基础设施之一。',
    metrics: [{ label: '仓库', value: 'miss-raspberry-toolkit' }],
    tags: ['工具', '树莓娘'],
    links: [{ href: 'https://github.com/BITNP/miss-raspberry-toolkit' }],
  },
  {
    id: 'raspberry-pet',
    category: 'opensource',
    name: '树莓娘桌宠',
    summary: '用视频生成 AI 做准二游级 UI 动画',
    description: '树莓娘桌宠初版：利用视频生成 AI 制作准二游级 UI 动画的一次实践尝试。',
    metrics: [{ label: '仓库', value: 'bitnp-desktop-pet' }],
    tags: ['桌宠', 'AI 生成'],
    links: [{ href: 'https://github.com/BITNP/bitnp-desktop-pet' }],
  },
  {
    id: 'badges',
    category: 'opensource',
    name: '虚拟纪念章分发',
    summary: '基于数字签名技术的纪念章系统',
    description:
      '基于数字签名技术的虚拟纪念章分发与验证系统，线上验证页部署在 www-backup.bitnp.net/bitnp-badges。',
    metrics: [
      { label: '仓库', value: 'bitnp-badges' },
      { label: '验证页', value: 'www-backup.bitnp.net' },
    ],
    tags: ['数字签名', '纪念章'],
    links: [
      { label: '仓库', href: 'https://github.com/BITNP/bitnp-badges' },
      { label: '验证页', href: 'https://www-backup.bitnp.net/bitnp-badges' },
    ],
  },
  {
    id: 'icebreaker',
    category: 'opensource',
    name: '破冰小游戏与工具箱',
    summary: '技术部破冰活动用的小游戏与工具',
    description:
      '技术部破冰小游戏与破冰工具箱，含单词对战、着色器玩具与破冰工具箱等一批仓库。',
    metrics: [
      { label: '仓库数', value: '3 个' },
      { label: '用途', value: '部门破冰活动' },
    ],
    tags: ['小游戏', '技术部'],
    links: [
      { label: '单词对战', href: 'https://github.com/BITNP/wordle-competition' },
      { label: '着色器玩具', href: 'https://github.com/BITNP/shaderflow' },
      { label: '破冰工具箱', href: 'https://github.com/BITNP/tech-icebreaker-2026' },
    ],
  },
  {
    id: 'gitlab',
    category: 'opensource',
    name: '网协 GitLab',
    summary: '自建代码托管（校园网内访问）',
    description:
      '协会自建的 GitLab，仅校园网内访问，用来承载不方便放到公网上的仓库。（曾经是GitLab，现在已更新为Forgejo）',
    metrics: [
      { label: '地址', value: 'git.bitnp.net' },
      { label: '访问范围', value: '校园网内' },
    ],
    tags: ['GitLab', '内网'],
    links: [{ href: 'https://git.bitnp.net/' }],
  },

  /* ----------------------------------------------------- 校园服务与内部系统 */
  {
    id: 'clinic-booking',
    category: 'services',
    name: '电脑义诊预约',
    summary: 'i 北理里的线上预约入口',
    description:
      '在 i 北理 → 工作台最下面（IT 服务）→ 电脑义诊，即可预约线下维修服务。',
    metrics: [
      { label: '入口', value: 'i 北理 · IT 服务' },
      { label: '服务部门', value: '电脑诊所' },
    ],
    tags: ['预约', '电脑诊所'],
  },
  {
    id: 'pc-recommend',
    category: 'services',
    name: '电脑推荐表',
    summary: '电脑诊所整理的选购参考，每年更新',
    description:
      '由电脑诊所整理维护的电脑推荐表，每年更新一次：按自己的需求与预算，就能查到当下比较合适的电脑型号。最新一版是 2026 年版。',
    metrics: [
      { label: '维护方', value: '电脑诊所' },
      { label: '更新频率', value: '每年更新' },
      { label: '最新版本', value: '2026 年版' },
    ],
    tags: ['选购', '电脑诊所'],
    links: [{ label: '2026 年版', href: 'https://docs.qq.com/aio/DTnZTRFRSUnpmWWZX' }],
    status: '每年更新',
  },
  {
    id: 'website',
    category: 'services',
    name: '网协官网',
    summary: '协会门户：新闻、服务入口与部门介绍',
    description:
      '协会官网，新闻、博客、服务入口与部门介绍都汇集在这里；本次大会展示页的设计语言也来自官网。',
    metrics: [{ label: '地址', value: 'www.bitnp.net' }],
    tags: ['官网', '门户'],
    links: [{ href: 'https://www.bitnp.net/' }],
  },
  {
    id: 'passport',
    category: 'services',
    name: '网协通行证',
    summary: '统一身份认证与鉴权',
    description:
      '网协统一身份认证中心，为内部服务提供登录与鉴权，仅校园网内访问。',
    metrics: [
      { label: '地址', value: 'accounts.bitnp.net' },
      { label: '访问范围', value: '校园网内' },
    ],
    tags: ['认证', '内网'],
    links: [{ href: 'https://accounts.bitnp.net/' }],
    status: '内部系统',
  },
  {
    id: 'guild',
    category: 'services',
    name: '开拓者公会',
    summary: '项目进度看板',
    description:
      '新上线的项目进度看板，让协会信息更透明，也方便跨部门协作，仅校园网内访问。',
    metrics: [
      { label: '地址', value: 'home.bitnp.net' },
      { label: '用途', value: '项目进度看板' },
    ],
    tags: ['看板', '协作'],
    links: [{ href: 'https://home.bitnp.net/' }],
    status: '内部系统',
  },
  {
    id: 'clinic-admin',
    category: 'services',
    name: '诊所后台',
    summary: '电脑义诊工单管理',
    description:
      '电脑诊所的工单管理系统，仅电脑诊所有权限，校园网内访问。',
    metrics: [
      { label: '地址', value: 'clinic.bitnp.net' },
      { label: '权限', value: '仅电脑诊所' },
    ],
    tags: ['工单', '电脑诊所'],
    links: [{ href: 'https://clinic.bitnp.net/' }],
    status: '内部系统',
  },
  {
    id: 'clinic-wiki',
    category: 'services',
    name: '诊所 Wiki',
    summary: '电脑维修知识库',
    description:
      '电脑诊所的维修知识库，沉淀常见故障与处理流程，校园网内访问。',
    metrics: [{ label: '地址', value: 'wiki.bitnp.net' }],
    tags: ['知识库', '电脑诊所'],
    links: [{ href: 'https://wiki.bitnp.net/' }],
    status: '内部系统',
  },
  {
    id: 'contest',
    category: 'services',
    name: '新生国防知识竞赛',
    summary: '军训期间开放',
    description: '新生国防知识竞赛系统，校园网内访问，仅军训时开放。',
    metrics: [
      { label: '地址', value: 'contest.bitnp.net' },
      { label: '开放时间', value: '军训期间' },
    ],
    tags: ['竞赛', '新生'],
    links: [{ href: 'https://contest.bitnp.net/' }],
  },
  {
    id: 'blog',
    category: 'services',
    name: '网协 Blog',
    summary: '协会博客园',
    description: '协会博客，发布技术文章与活动记录。',
    metrics: [{ label: '地址', value: 'blog.bitnp.net' }],
    tags: ['博客', '内容'],
    links: [{ href: 'https://blog.bitnp.net/' }],
  },
  {
    id: 'cloud',
    category: 'services',
    name: '网协文件云盘',
    summary: '义诊与活动文件资源',
    description:
      '协会文件云盘，存放电脑义诊以及网协活动相关的文件资源。',
    metrics: [
      { label: '地址', value: 'cf.bitnp.net' },
      { label: '存放内容', value: '义诊 · 活动文件' },
    ],
    tags: ['云盘', '文件'],
    links: [{ href: 'https://cf.bitnp.net/' }],
  },

  /* --------------------------------------------------------- 设计资源与美术 IP */
  {
    id: 'raspberry-girl',
    category: 'ip',
    name: '树莓娘',
    summary: '协会吉祥物',
    description:
      '网络开拓者协会吉祥物。我们正致力于利用各种技术，为树莓娘创造存在形态与传奇故事！',
    metrics: [
      { label: '身份', value: '协会吉祥物' },
      { label: '衍生项目', value: '虚拟主播 · 智能体 · 桌宠' },
    ],
    tags: ['吉祥物', '树莓娘'],
    status: '长期项目',
  },
  {
    id: 'design-assets',
    category: 'ip',
    name: '设计资源库',
    summary: '树莓娘形象与整套设计素材',
    description:
      '协会设计资源仓库，收纳树莓娘形象、视觉规范等各类设计素材，欢迎自取使用。',
    metrics: [
      { label: '仓库', value: 'bitnp-design' },
      { label: '内容', value: '形象 · 视觉素材' },
    ],
    tags: ['设计', '素材'],
    links: [{ href: 'https://github.com/BITNP/bitnp-design' }],
  },
]
