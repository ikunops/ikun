// level_rules 表 —— 等级规则配置
// 弟子阶段 Lv1-Lv4:量化晋升(打卡天数 + 贡献值 + 加精帖数)
export const DISCIPLE_LEVELS = [
  { level: 1, title: '外门弟子', days: 10, contribution: 0, featured: 0, letters: 1, color: '#b9b5c4', borderId: 'b-gray' },
  { level: 2, title: '内门弟子', days: 20, contribution: 10, featured: 0, letters: 2, color: '#4da3ff', borderId: 'b-blue' },
  { level: 3, title: '核心弟子', days: 30, contribution: 30, featured: 0, letters: 3, color: '#7c5cff', borderId: 'b-purple' },
  { level: 4, title: '亲传弟子', days: 40, contribution: 50, featured: 1, letters: 4, color: '#ffb800', borderId: 'b-gold' },
]

// 长老阶段 Lv5 内部细分 5.1-5.6
export const ELDER_LEVELS = [
  { subLevel: '5.1', title: '外门长老', days: 50, contribution: 50, featured: 2, admin: false, color: '#8fa3ad', borderId: 'b-cyan-gray' },
  { subLevel: '5.2', title: '内门长老', days: 50, contribution: 80, featured: 2, admin: false, color: '#c0c8d0', borderId: 'b-silver' },
  { subLevel: '5.3', title: '客卿长老', days: 50, contribution: 100, featured: 2, admin: false, color: '#2ec5d3', borderId: 'b-azure' },
  { subLevel: '5.4', title: '核心长老', days: 50, contribution: 50, featured: 2, admin: true, appointed: true, color: '#7c5cff', borderId: 'b-violet-gold' },
  { subLevel: '5.5', title: '大长老', admin: true, reserved: '系统保留 ID=1', color: '#ffb800', borderId: 'b-rainbow' },
  { subLevel: '5.6', title: '宗主', admin: false, reserved: '占位 ID=0', color: '#262338', borderId: null, hidden: true },
]

// 依据打卡/贡献/加精计算当前弟子等级(不含长老任命链路)
export function resolveDiscipleLevel(stats) {
  let hit = null
  for (const rule of DISCIPLE_LEVELS) {
    if (
      stats.checkinDays >= rule.days &&
      stats.contribution >= rule.contribution &&
      stats.featured >= rule.featured
    ) {
      hit = rule
    }
  }
  return hit
}

// —— 用户记录 → 等级呈现(唯一推导入口) ——
// 优先级:管理员 levelOverride > 身份职级(大长老/核心长老) > 打卡数据推导
const LV_BORDER = { 1: 'b-gray', 2: 'b-blue', 3: 'b-purple', 4: 'b-gold' }

export function userStats(rec) {
  return {
    checkinDays: rec.checkins.length,
    contribution: rec.contribution,
    featured: rec.featured,
  }
}

export function userLevel(rec) {
  if (!rec) {
    return { level: 0, subLevel: null, title: '未登录', color: '#d8d4c8', borderId: null, letters: 0 }
  }
  if (rec.levelOverride) {
    const o = rec.levelOverride
    return {
      level: o.level,
      subLevel: null,
      title: o.title,
      color: DISCIPLE_LEVELS.find((r) => r.level === o.level)?.color || '#ffc53d',
      borderId: LV_BORDER[o.level] || null,
      letters: o.level,
    }
  }
  if (rec.roleType === 'grand_elder') {
    return { level: 5, subLevel: '5.5', title: '大长老', color: '#ffb800', borderId: 'b-rainbow', letters: 4 }
  }
  if (rec.roleType === 'core_elder') {
    return { level: 5, subLevel: '5.4', title: '核心长老', color: '#7c5cff', borderId: 'b-violet-gold', letters: 4 }
  }
  const rule = resolveDiscipleLevel(userStats(rec))
  if (rule) {
    return {
      level: rule.level,
      subLevel: null,
      title: rule.title,
      color: rule.color,
      borderId: rule.borderId,
      letters: rule.letters,
    }
  }
  return { level: 0, subLevel: null, title: '预备弟子', color: '#d8d4c8', borderId: null, letters: 0 }
}
