// avatar_borders 表 —— 预置 10 档 + 管理后台动态新增(注册表机制)
// style: solid 纯色 / gradient 渐变 / glow 微光 / pulse 呼吸 / spin 炫彩旋转
export const BORDERS = [
  { id: 'b-gray', name: '基础灰环', level: 'Lv1', color: '#b9b5c4', style: 'solid' },
  { id: 'b-blue', name: '蓝色渐变环', level: 'Lv2', color: '#4da3ff', color2: '#8fd0ff', style: 'gradient' },
  { id: 'b-purple', name: '紫色微光环', level: 'Lv3', color: '#7c5cff', style: 'glow' },
  { id: 'b-gold', name: '金色脉冲环', level: 'Lv4', color: '#ffb800', style: 'pulse' },
  { id: 'b-cyan-gray', name: '青灰环', level: 'Lv5.1', color: '#8fa3ad', style: 'solid' },
  { id: 'b-silver', name: '银白环', level: 'Lv5.2', color: '#c0c8d0', color2: '#eef2f6', style: 'gradient' },
  { id: 'b-azure', name: '碧蓝环+羽扇', level: 'Lv5.3', color: '#2ec5d3', color2: '#9ff0f6', style: 'gradient', badge: 'feather' },
  { id: 'b-violet-gold', name: '紫金环+盾牌', level: 'Lv5.4', color: '#7c5cff', color2: '#ffb800', style: 'gradient', badge: 'shield' },
  { id: 'b-rainbow', name: '炫彩旋转环+王冠', level: 'Lv5.5', color: 'rainbow', style: 'spin', badge: 'crown' },
  { id: 'b-hidden', name: '宗主环(预留)', level: 'Lv5.6', color: '#262338', style: 'solid', hidden: true },
]

// 管理后台新增的自定义边框(admin store restore 时注册进来)
const customRegistry = []

export function registerCustomBorders(list) {
  for (const b of list || []) {
    if (!customRegistry.some((x) => x.id === b.id)) customRegistry.push(b)
  }
}

export function unregisterCustomBorder(id) {
  const i = customRegistry.findIndex((x) => x.id === id)
  if (i >= 0) customRegistry.splice(i, 1)
}

// 预置边框删除墓碑(admin store restore 时回放)
const hiddenIds = new Set()

export function hideBorder(id) {
  hiddenIds.add(id)
}

export function restoreBorder(id) {
  hiddenIds.delete(id)
}

export function hiddenBorderIds() {
  return [...hiddenIds]
}

export function allBorders() {
  return BORDERS.filter((b) => !hiddenIds.has(b.id)).concat(customRegistry)
}

export function findBorder(id) {
  return allBorders().find((b) => b.id === id) || null
}
