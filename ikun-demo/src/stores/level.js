import { defineStore } from 'pinia'
import { ELDER_LEVELS, DISCIPLE_LEVELS as DISCIPLE, userLevel } from '@/mock/levels'
import { useUserStore } from './user'

export const useLevelStore = defineStore('level', {
  getters: {
    // 当前等级(从 users 表记录推导;管理员 levelOverride 优先)
    info() {
      const user = useUserStore()
      if (!user.isLoggedIn) {
        return { level: 0, subLevel: null, title: '未登录', color: '#d8d4c8', borderId: null, letters: 0 }
      }
      return userLevel(user.rec)
    },

    // 下一级及三条件进度;Lv4 之后走长老阶梯,返回 null
    next() {
      const user = useUserStore()
      const stats = user.stats
      let cur = null
      for (const rule of DISCIPLE) {
        if (
          stats.checkinDays >= rule.days &&
          stats.contribution >= rule.contribution &&
          stats.featured >= rule.featured
        ) {
          cur = rule
        }
      }
      const idx = cur ? DISCIPLE.indexOf(cur) : -1
      const rule = DISCIPLE[idx + 1] || null
      if (!rule) return null

      const conditions = [
        { label: '打卡天数', value: stats.checkinDays, target: rule.days, unit: '天' },
        { label: '贡献值', value: stats.contribution, target: rule.contribution, unit: '' },
        { label: '加精帖数', value: stats.featured, target: rule.featured, unit: '篇' },
      ].filter((c) => c.target > 0)

      const pct = (c) => Math.min(1, c.value / c.target)
      const progress = conditions.length ? Math.round(Math.min(...conditions.map(pct)) * 100) : 100

      return { rule, conditions, progress }
    },

    elderLadder() {
      return ELDER_LEVELS.filter((l) => !l.hidden)
    },
  },
})
