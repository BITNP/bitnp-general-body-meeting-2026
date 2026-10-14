import type { Member } from '../types'

/**
 * 主席团成员 —— 4 个位置已经排好版，内容留空。
 *
 * 填法：
 *   1) 头像：把图片放到 src/assets/members/ 下，然后
 *        import avatar1 from '../assets/members/1.png'
 *        avatar: avatar1,
 *      留 null 会显示占位头像。
 *   2) name / role / bio 留空字符串时，页面会显示虚线占位框，方便会上直接讲。
 */
export const members: Member[] = [
  {
    id: 'member-1',
    name: '郭逸戈',
    role: '主席',
    avatar: `${import.meta.env.BASE_URL}image/avatar/gyg.webp`,
    bio: `网络开拓者协会主席，喜欢开发神秘小软件。
我在网协做过：
- 「树莓娘AI虚拟主播」原型技术验证
- 「树莓娘桌宠」初版尝试
- 参与「开拓者公会」部分开发
- 参与「树莓娘 QQ agent」设计与开发
- 「网协虚拟纪念章」概念提出与原型开发
- 「开拓者会议」（带有声纹聚类/识别的语音识别会议记录系统）
- 「树莓娘面包坊」（bilibili toy 以及 API 编程互动游戏效果验证）
`,
    tags: [],
  },
  {
    id: 'member-2',
    name: '史玥',
    role: '副主席-电脑诊所分管主席',
    avatar: `${import.meta.env.BASE_URL}image/avatar/sy.webp`,
    bio: `---
model_name: 史玥
context_window: "114514 tokens"
description: 经过九年预训练，三年监督微调，两年强化学习的唐氏小模型
tags:
  - "2B"
  - 端侧
  - 低功耗
  - 中文
---
/skill
- sleep()
- eat_rice()
- photography()

/connect
- Endpoint：QQ 3756642605（主通道），微信 SY15303332860（备用）
- API Key ：免费申请
- 计费方式：输入限时免费，输出需要大白饭
- 生成速度：2s/token
- 服务窗口：10:00–25:00
- 窗口内可用性：90%（其余时间不保证可用性）`,
    tags: [],
  },
  {
    id: 'member-3',
    name: '姚雨森',
    role: '副主席-技术部分管主席',
    avatar: null,
    bio: '',
    tags: [],
  },
  {
    id: 'member-4',
    name: '韩浩阳',
    role: '副主席-数字媒体中心分管主席',
    avatar: null,
    bio: '',
    tags: [],
  },
]
