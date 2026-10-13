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
    name: '',
    role: '',
    avatar: null,
    bio: '',
    tags: [],
  },
  {
    id: 'member-2',
    name: '',
    role: '',
    avatar: null,
    bio: '',
    tags: [],
  },
  {
    id: 'member-3',
    name: '',
    role: '',
    avatar: null,
    bio: '',
    tags: [],
  },
  {
    id: 'member-4',
    name: '',
    role: '',
    avatar: null,
    bio: '',
    tags: [],
  },
]
