// default_avatars 表 —— 预置 30 工种 + 管理后台动态新增(注册表机制)
// 头像图:文件按 code 命名放 src/assets/avatars/,或后台新增(dataURL 存 localStorage)
const imageModules = import.meta.glob('../assets/avatars/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

// 管理后台新增的自定义头像 { code, job, category:'F', img:dataURL, custom:true }
const customRegistry = []

export function registerCustomAvatars(list) {
  for (const a of list || []) {
    if (!customRegistry.some((x) => x.code === a.code)) customRegistry.push(a)
  }
}

export function unregisterCustomAvatar(code) {
  const i = customRegistry.findIndex((x) => x.code === code)
  if (i >= 0) customRegistry.splice(i, 1)
}

// 预置头像删除墓碑(admin store restore 时回放)
const hiddenCodes = new Set()

export function hideAvatar(code) {
  hiddenCodes.add(code)
}

export function restoreAvatar(code) {
  hiddenCodes.delete(code)
}

export function hiddenAvatarCodes() {
  return [...hiddenCodes]
}

export function allAvatars() {
  return DEFAULT_AVATARS.filter((a) => !hiddenCodes.has(a.code)).concat(customRegistry)
}

export function avatarImage(code) {
  if (!code) return null
  const target = code.toUpperCase()
  const custom = customRegistry.find((a) => a.code.toUpperCase() === target)
  if (custom) return custom.img
  const hit = Object.entries(imageModules).find(([path]) => {
    const base = path.split('/').pop().replace(/\.\w+$/, '')
    return base.toUpperCase() === target
  })
  return hit ? hit[1] : null
}

export const AVATAR_CATEGORIES = [
  { key: 'A', name: '舞台前线', bg: '#fff3d6' },
  { key: 'B', name: '幕后制作', bg: '#e8f1ff' },
  { key: 'C', name: '视觉创意', bg: '#f3e8ff' },
  { key: 'D', name: '粉丝运营', bg: '#ffe8ee' },
  { key: 'E', name: '社区管理', bg: '#e6f9f1' },
  { key: 'F', name: '管理员定制', bg: '#fff0e3' },
]

export const DEFAULT_AVATARS = [
  { code: 'A01', category: 'A', job: '练习生' },
  { code: 'A02', category: 'A', job: '主唱' },
  { code: 'A03', category: 'A', job: '主舞' },
  { code: 'A04', category: 'A', job: 'Rapper' },
  { code: 'A05', category: 'A', job: '门面' },
  { code: 'A06', category: 'A', job: '队长' },
  { code: 'B01', category: 'B', job: '制作人' },
  { code: 'B02', category: 'B', job: '词曲创作' },
  { code: 'B03', category: 'B', job: '编曲师' },
  { code: 'B04', category: 'B', job: '录音师' },
  { code: 'B05', category: 'B', job: '混音师' },
  { code: 'B06', category: 'B', job: '舞台导演' },
  { code: 'C01', category: 'C', job: '摄影师' },
  { code: 'C02', category: 'C', job: '剪辑师' },
  { code: 'C03', category: 'C', job: '特效师' },
  { code: 'C04', category: 'C', job: '插画师' },
  { code: 'C05', category: 'C', job: '造型师' },
  { code: 'C06', category: 'C', job: '化妆师' },
  { code: 'D01', category: 'D', job: '打投组长' },
  { code: 'D02', category: 'D', job: '数据组长' },
  { code: 'D03', category: 'D', job: '应援组长' },
  { code: 'D04', category: 'D', job: '控评组长' },
  { code: 'D05', category: 'D', job: '反黑组长' },
  { code: 'D06', category: 'D', job: '翻译组长' },
  { code: 'E01', category: 'E', job: '内容审核' },
  { code: 'E02', category: 'E', job: '活动策划' },
  { code: 'E03', category: 'E', job: '新人导师' },
  { code: 'E04', category: 'E', job: '外交官' },
  { code: 'E05', category: 'E', job: '档案管理' },
  { code: 'E06', category: 'E', job: '技术支援' },
]

export function findAvatar(code) {
  return allAvatars().find((a) => a.code === code) || allAvatars()[0]
}

export function categoryOf(key) {
  return AVATAR_CATEGORIES.find((c) => c.key === key) || AVATAR_CATEGORIES[0]
}
