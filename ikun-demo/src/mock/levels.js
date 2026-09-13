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
