/* ==========================================================================
 * 类型定义
 *  · BeaconConfig：bitnp-outposts 地图组件（BitnpMap.vue）的入参，勿改
 *  · 其余为本次全体大会展示页的内容模型，改内容请只动 src/data/
 * ========================================================================== */

/** 光柱（信标）配置，作为 BitnpMap 的组件参数传入（移植自 bitnp-outposts） */
export interface BeaconConfig {
  /** 稳定标识（可选） */
  id?: string
  /** 标注文字（同时用作默认标题） */
  label: string
  /** 相对"模型中心"的水平偏移：+X 东，+Z 南 */
  x: number
  z: number
  /** 点击该光柱（mousedown 与 mouseup 都悬停在它上面）后的回调 */
  onClick?: (beacon: BeaconConfig) => void
}

/**
 * 陀螺仪（视角微动）的可用状态，由 BitnpMap 上报给页面，页面据此决定要不要给提示。
 *  · unsupported   —— 不适用（PC、浏览器没有该 API）
 *  · needs-gesture —— iOS 等需要在用户手势里申请权限，还没申请
 *  · waiting       —— 已开始监听，还没收到第一帧数据
 *  · active        —— 正常收到数据
 *  · blocked       —— 权限被拒，或迟迟收不到数据
 */
export type GyroStatus = 'unsupported' | 'needs-gesture' | 'waiting' | 'active' | 'blocked'

/* ---------------------------------------------------------------- 主席团 */

export interface Member {
  id: string
  /** 姓名；留空则显示占位 */
  name: string
  /** 职务（如 会长 / 团支书 / 副会长）；留空则显示占位 */
  role: string
  /** 头像地址（import 进来的图片路径或 public 下的路径）；null 显示占位头像 */
  avatar: string | null
  /** 介绍文字；留空则显示占位 */
  bio: string
  /** 一句话标签，比如负责的方向 */
  tags: string[]
}

/* ---------------------------------------------------------------- 组织架构 */

/** 思维导图里的一个子节点，例如部门的「部长团」「普通成员」 */
export interface OrgGroup {
  id: string
  name: string
  /** 一句话说明 */
  note: string
  /** 人数；未知就写「待补充」 */
  size: string
}

export interface Department {
  id: string
  name: string
  /** 一句话职能（图谱下方的短说明） */
  summary: string
  /** 部门色（CSS 变量或色值） */
  color: string
  /** 部门详细介绍，用于图谱点击后的展开说明 */
  description: string
  /** 图标名（见 src/components/AppIcon.vue） */
  icon: string
  /** 发展规划正文：各部门自备，留空即显示占位 */
  plan: string
  /** 部门内部的构成（部长团 / 普通成员……），用于思维导图 */
  groups: OrgGroup[]
}

/** 主席团（思维导图的根节点） */
export interface PresidiumUnit {
  name: string
  color: string
  icon: string
  summary: string
  description: string
  /** 主席团内部的构成 */
  groups: OrgGroup[]
}

/* ---------------------------------------------------------------- 活动场地 */

export interface Venue {
  id: string
  /** 地图光柱上的文字，需与 beacon.label 一致 */
  name: string
  /** 位置描述 */
  location: string
  /** 服务说明 */
  description: string
  /** 光柱位置（沿用 bitnp-outposts 的坐标） */
  x: number
  z: number
  /** 额外备注，例如开放时间 */
  note?: string
}

/* ---------------------------------------------------------------- 数字资产 */

export interface AssetCategory {
  id: string
  name: string
  /** 分类说明 */
  description: string
  color: string
  icon: string
}

export interface AssetMetric {
  label: string
  /** 数据未知时填 '—' 或 '待补充' */
  value: string
}

export interface AssetItem {
  id: string
  /** 所属分类 id */
  category: string
  name: string
  /** 列表里显示的一句话 */
  summary: string
  /** 详情面板里的正文 */
  description: string
  /** 关键数据（仓库数、粉丝数、访问量……） */
  metrics: AssetMetric[]
  tags: string[]
  /** 外部链接（可选） */
  href?: string
  /** 状态标记，例如「持续维护」，留空则不显示 */
  status?: string
}

/* ---------------------------------------------------------------- 时间轴 */

export interface Milestone {
  id: string
  /** 展示用日期文案，如 "9 月" / "2026.09" */
  date: string
  /** 归属年份，用于时间轴分组（如 2026 / 2027） */
  year: string
  title: string
  /** 类别标签，如 招新 / 技术活动 / 服务保障 */
  category: string
  description: string
  /** 节点色 */
  color: string
  /** 主办部门，可留空 */
  owner?: string
}

/* ---------------------------------------------------------------- 页面（一页 = 一屏） */

export interface SlideMeta {
  id: string
  /** 左右导航上显示的名称 */
  nav: string
  /** 正文标题 */
  title: string
  /** 标题旁的小字（对应会议议程序号） */
  kicker: string
  /** 侧栏图标名（见 src/data/icons.ts） */
  icon: string
}
