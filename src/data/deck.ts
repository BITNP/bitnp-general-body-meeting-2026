import type { SlideMeta } from '../types'

/** 大会基本信息（封面页使用）——带「待定」的字段请会前替换 */
export const meeting = {
  association: '网络开拓者协会',
  associationEn: 'Net Pioneer Association of BIT',
  title: '2026–2027 学年度第一次全体大会',
  slogan: '网络无限 开拓不懈',
  date: '2026 年 10 月 17 日',
  place: '文萃楼 M135',
  host: '主席团',
}

/** 议案清单：顺序 = 翻页顺序 = 底部导航顺序 */
export const slides: SlideMeta[] = [
  { id: 'cover', nav: '封面', title: '网络开拓者协会', kicker: 'OPENING', icon: 'home' },
  { id: 'members', nav: '主席团成员', title: '主席团成员', kicker: 'AGENDA 01', icon: 'users' },
  { id: 'org', nav: '组织架构', title: '组织架构', kicker: 'AGENDA 02', icon: 'network' },
  { id: 'venues', nav: '活动场地', title: '我们的据点', kicker: 'AGENDA 03', icon: 'map' },
  { id: 'assets', nav: '数字资产', title: '数字资产概况', kicker: 'AGENDA 04', icon: 'layers' },
  { id: 'timeline', nav: '年度节点', title: '接下来一年', kicker: 'AGENDA 05', icon: 'calendar' },
  { id: 'plans', nav: '部门规划', title: '各部门发展规划', kicker: 'AGENDA 06', icon: 'target' },
  { id: 'closing', nav: '结束', title: '谢谢大家', kicker: 'THANKS', icon: 'send' },
]
