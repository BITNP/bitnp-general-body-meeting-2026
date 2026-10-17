import type { Venue } from '../types'

/**
 * 三大据点 —— 内容与坐标沿用 bitnp-outposts 项目。
 * x / z 是相对地图模型中心的水平偏移（+X 东，+Z 南），调整后光柱位置会跟着变。
 */
export const venues: Venue[] = [
  {
    id: 'office',
    name: '网协办公室',
    location: '北校区北食堂对面、北理桥下靠近校门第一间',
    description: '网协办公室 / 活动室，日常开会、备课与项目协作的地方。',
    x: 300,
    z: 325,
    note: '技术部与数字媒体中心分组活动场所；最多约能容纳10人，所有正式成员可以随时来交流讨论 / 自习；有门锁，想来可以提前问问部长或者主席团。',
  },
  {
    id: 'qiushi',
    name: '求是社区电脑诊所',
    location: '求是社区疏桐 D 地下室走到底右转',
    description: '提供电脑义诊服务，电脑诊所日常工作的据点。',
    x: 200,
    z: 460,
    note: '值班时间待补充',
  },
  {
    id: 'library',
    name: '图书馆电脑诊所',
    location: '徐特立图书馆 3 楼第二自然阅览室最里面 311G',
    description: '提供电脑义诊服务，电脑诊所日常工作的据点。',
    x: 480,
    z: 280,
    note: '值班时间待补充',
  },
]
