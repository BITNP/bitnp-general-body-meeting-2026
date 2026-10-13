import type { Department, OrgGroup, PresidiumUnit } from '../types'

/** 部门内部构成（各部长团 / 普通成员的人数是待补充项） */
const departmentGroups = (leadNote: string, memberNote: string): OrgGroup[] => [
  { id: 'leads', name: '部长团', note: leadNote, size: '待补充' },
  { id: 'members', name: '普通成员', note: memberNote, size: '待补充' },
]

/** 主席团（组织架构图的根节点） */
export const presidium: PresidiumUnit = {
  name: '主席团',
  color: 'var(--dept-chairman)',
  icon: 'users',
  summary: '发展规划 · 部门协调 · 课程讲授 · 活动管理',
  description:
    '网协的核心管理层：统筹兼顾网协的发展规划，选择取舍适合的项目及方向；在各个部门之间进行串联，团结成员关系，提高组织凝聚力。主席团成员也会按自己的技术能力参与各个项目，并为大家讲授课程，管理网协活动正常有序进行。',
  groups: [
    { id: 'chair-members', name: '主席团成员', note: '会长 / 副会长 / 团支书等', size: '4' },
  ],
}

/**
 * 部门（顺序 = 架构图与后续页面的顺序）
 *  · description：会上展开讲的一段介绍，可继续补充
 *  · plan：发展规划，各部门自备，留空则显示占位
 */
export const departments: Department[] = [
  {
    id: 'tech',
    name: '技术部',
    color: 'var(--dept-tech)',
    icon: 'code',
    summary: '技术分享会 · 课程串讲 · 项目制作 · 直播服务',
    description:
      '协会最大的技术聚集地，以「技术」为核心，为网协提供技术支持，把技术应用到校园网络生活的方方面面。为全校提供 C 语言讲座，以及网页开发、应用开发等进阶讲座；同时负责全校大型活动的直播推流、录制与后期。',
    plan: '',
    groups: departmentGroups('部长 / 副部长，负责排课、带项目', '参与例会、课程与项目开发'),
  },
  {
    id: 'clinic',
    name: '电脑诊所部',
    color: 'var(--dept-clinic)',
    icon: 'wrench',
    summary: '电脑维修 · 电脑导购 · 周边义诊 · 技能学习',
    description:
      '历史悠久的志愿服务部门，面向全校师生提供电脑维修、电脑导购等服务，工作地点在图书馆 311G 与求是社区。每年为新生制作电脑选购指南，也常常前往周边高校开展电脑义诊交流。',
    plan: '',
    groups: departmentGroups('部长 / 副部长，负责排班与义诊安排', '参与日常值班与上门维修'),
  },
  {
    id: 'media',
    name: '数字媒体中心',
    color: 'var(--dept-media)',
    icon: 'megaphone',
    summary: '宣传工作 · 活动策划 · 新媒体运营 · 设计教学',
    description:
      '昵称「树莓」，是协会的协调部门与宣传部门。对内负责事务策划与经济支出管理，对外负责与学校其他组织的合作项目；同时做新媒体运营、设计基础与常用设计软件教学，树莓娘是网协的「颜值担当」。',
    plan: '',
    groups: departmentGroups('部长 / 副部长，负责策划与对外合作', '参与推送、海报与视频制作'),
  },
  {
    id: 'support',
    name: '技术保障中心',
    color: 'var(--dept-support)',
    icon: 'shield',
    summary: '服务运维 · 活动保障 · 应急响应',
    description: '',
    plan: '',
    groups: departmentGroups('部长 / 副部长，负责系统与服务保障', '参与运维值班与活动技术保障'),
  },
]
