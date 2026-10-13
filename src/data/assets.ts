import type { AssetCategory, AssetItem } from '../types'

/**
 * 数字资产 —— 左侧选分类、右侧选条目，选中后在右侧面板展示详情。
 *
 * 下面按官网 / 仓库里能查到的信息填了骨架，
 * 标着「待补充」的数据（粉丝数、访问量……）请会前补齐；
 * 增删条目只改这个文件即可。
 */

export const assetCategories: AssetCategory[] = [
  {
    id: 'social',
    name: '官方媒体账号',
    description: '对外发声的窗口：公众号、B 站、新生群……',
    color: 'var(--dept-chairman)',
    icon: 'megaphone',
  },
  {
    id: 'opensource',
    name: '开源仓库与项目',
    description: '托管在 GitHub 上、人人可用可改的代码与文档',
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
    name: '吉祥物与美术 IP',
    description: '树莓娘与一整套视觉资产',
    color: 'var(--dept-media)',
    icon: 'sparkles',
  },
]

export const assetItems: AssetItem[] = [
  /* ----------------------------------------------------------- 官方媒体账号 */
  {
    id: 'wechat',
    category: 'social',
    name: '微信公众号「BITNP网络开拓者协会」',
    summary: '活动推送、服务公告与招新信息的主阵地',
    description:
      '协会对外的第一窗口。技术分享会的预告与回顾、电脑诊所的服务公告、招新信息都会在这里发布，由数字媒体中心负责运营与排版。',
    metrics: [
      { label: '关注人数', value: '待补充' },
      { label: '更新频率', value: '待补充' },
    ],
    tags: ['推送', '招新', '服务公告'],
    status: '持续运营',
  },
  {
    id: 'bilibili',
    category: 'social',
    name: 'B 站账号',
    summary: '技术分享会录播、活动直播与宣传视频',
    description:
      '技术分享会的录播、活动宣传片、直播回放都放在这里，也是 NPLive 之外的第二分发渠道。账号 ID 与主页链接待补充。',
    metrics: [
      { label: '粉丝数', value: '待补充' },
      { label: '投稿数', value: '待补充' },
    ],
    tags: ['视频', '录播', '宣传'],
    status: '持续运营',
  },
  {
    id: 'qq-group',
    category: 'social',
    name: '新生咨询群 / 会员群',
    summary: '招新季答疑与日常交流的聚集地',
    description:
      '招新期间最主要的答疑渠道，也是日常技术交流、活动召集的地方。群号与群规模待补充。',
    metrics: [
      { label: '群成员', value: '待补充' },
      { label: '主要用途', value: '答疑 · 交流' },
    ],
    tags: ['答疑', '社群'],
  },

  /* --------------------------------------------------------- 开源仓库与项目 */
  {
    id: 'bithesis',
    category: 'opensource',
    name: 'BITHESIS',
    summary: '北京理工大学学位论文 LaTeX 模板集合',
    description:
      '非官方 LaTeX 模板集合，包含本科、研究生毕业设计模板及更多，是协会影响力最大的开源项目之一，服务范围早已超出协会本身。',
    metrics: [
      { label: '模板数量', value: '待补充' },
      { label: 'Star 数', value: '待补充' },
    ],
    tags: ['LaTeX', '毕业论文', '对外开源'],
    href: 'https://bithesis.bitnp.net/',
    status: '持续维护',
  },
  {
    id: 'website',
    category: 'opensource',
    name: 'BITNP_Website',
    summary: '协会官网（Astro + 纯 CSS，静态生成）',
    description:
      '协会门户：新闻、博客、服务入口与部门介绍。整套设计语言（配色、字体、亮暗模式、卡片与胶带装饰）也被本次大会展示页沿用。',
    metrics: [
      { label: '技术栈', value: 'Astro' },
      { label: '维护状态', value: '待补充' },
    ],
    tags: ['官网', '前端'],
    href: 'https://bitnp.net/',
  },
  {
    id: 'outposts',
    category: 'opensource',
    name: 'bitnp-outposts',
    summary: '据点位置的交互式 3D 展示组件（Three.js）',
    description:
      '把良乡校区模型做成可旋转、可缩放的 3D 场景，用光柱标注办公室与两个电脑诊所。本次大会「活动场地」一页用的就是这个组件。',
    metrics: [
      { label: '技术栈', value: 'Vue + Three.js' },
      { label: '标注据点', value: '3' },
    ],
    tags: ['3D', '地图', '组件'],
  },
  {
    id: 'more-repos',
    category: 'opensource',
    name: '组织下的其他仓库',
    summary: '各类校园工具、脚本与实验性项目',
    description:
      'GitHub 组织 BITNP 下还有若干工具与实验项目（自动签到、数据同步、课程资料等）。完整清单与各仓库说明待补充。',
    metrics: [
      { label: '仓库总数', value: '待补充' },
      { label: '组织主页', value: 'github.com/BITNP' },
    ],
    tags: ['工具', '脚本'],
    href: 'https://github.com/BITNP',
  },

  /* ----------------------------------------------------- 校园服务与内部系统 */
  {
    id: 'nplive',
    category: 'services',
    name: 'NPLive 直播平台',
    summary: '网络开拓者维护的校内直播平台',
    description:
      '为全校大型活动提供直播推流、录制与后期服务。技术部负责现场保障，是协会在校园里存在感最强的服务之一。',
    metrics: [
      { label: '年服务场次', value: '待补充' },
      { label: '访问量', value: '待补充' },
    ],
    tags: ['直播', '校级活动'],
    href: 'https://live.bitnp.net/',
    status: '持续运营',
  },
  {
    id: 'network-guide',
    category: 'services',
    name: '校园网使用指南',
    summary: '校园网充值 · 连接 · 常见问题一站式指引',
    description:
      '面向全校新生的校园网使用说明：充值流程、无线与有线连接方式、认证步骤、常见故障排查，常年是官网访问量最高的页面之一。',
    metrics: [
      { label: '覆盖场景', value: 'PC · 移动端' },
      { label: '年访问量', value: '待补充' },
    ],
    tags: ['指南', '校园网'],
  },
  {
    id: 'pc-guide',
    category: 'services',
    name: '电脑推荐表（电脑诊所）',
    summary: '每年更新的新生电脑选购指南',
    description:
      '电脑诊所每年为新生整理的选购参考：按预算与用途分类，给出机型推荐与选购建议，已连续更新多年。',
    metrics: [
      { label: '更新周期', value: '每年' },
      { label: '最新版本', value: '2026 版' },
    ],
    tags: ['导购', '新生'],
  },
  {
    id: 'clinic-service',
    category: 'services',
    name: '电脑诊所义诊服务',
    summary: '面向全校师生的电脑维修受理',
    description:
      '线上答疑加线下坐诊：软件安装、硬件加装与更换、系统重装、网络诊断等。线下据点见「活动场地」一页。',
    metrics: [
      { label: '服务地点', value: '图书馆 311G · 求是社区' },
      { label: '年服务人次', value: '待补充' },
    ],
    tags: ['维修', '志愿服务'],
  },
  {
    id: 'internal',
    category: 'services',
    name: '内部系统与基础设施',
    summary: '协会自用的账号、文档、监控等系统',
    description:
      '支撑协会日常运转的内部系统：成员与权限管理、共享文档、服务监控与告警、素材库等。清单待技术保障中心补充。',
    metrics: [
      { label: '系统数量', value: '待补充' },
      { label: '负责部门', value: '技术保障中心' },
    ],
    tags: ['内部', '运维'],
  },

  /* --------------------------------------------------------- 吉祥物与美术 IP */
  {
    id: 'raspberry-girl',
    category: 'ip',
    name: '树莓娘',
    summary: '协会吉祥物，数字媒体中心的「颜值担当」',
    description:
      '树莓娘是网协的官方形象，出现在海报、周边、活动物料与社交账号头像上。设定、形象版本与授权规范待数字媒体中心补充。',
    metrics: [
      { label: '首次登场', value: '待补充' },
      { label: '形象版本', value: '待补充' },
    ],
    tags: ['吉祥物', '海报'],
  },
  {
    id: 'stickers',
    category: 'ip',
    name: '表情包与素材库',
    summary: '日常聊天与推送配图用的系列表情',
    description: '基于树莓娘衍生的表情包、贴纸与推送配图素材库。当前数量与获取方式待补充。',
    metrics: [
      { label: '表情数量', value: '待补充' },
      { label: '使用场景', value: '社群 · 推送' },
    ],
    tags: ['表情包', '素材'],
  },
  {
    id: 'brand',
    category: 'ip',
    name: 'LOGO 与视觉规范',
    summary: '徽标、标准色、字体与使用规范',
    description:
      '协会圆形徽标与整套视觉规范：标准色（主色 #d97319）、标题字体（得意黑 SmileySans）、图标与版式约定。规范文档待整理。',
    metrics: [
      { label: '主色', value: '#d97319' },
      { label: '标题字体', value: 'SmileySans' },
    ],
    tags: ['LOGO', '设计规范'],
  },
  {
    id: 'merch',
    category: 'ip',
    name: '周边与徽章',
    summary: '面向成员的实体周边',
    description: '徽章、贴纸、文化衫等实体周边。品类与库存情况待补充。',
    metrics: [{ label: '品类数', value: '待补充' }],
    tags: ['周边'],
  },
]
