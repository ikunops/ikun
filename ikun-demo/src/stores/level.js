import { defineStore } from 'pinia'
import { DISCIPLE_LEVELS, ELDER_LEVELS, resolveDiscipleLevel } from '@/mock/levels'
import { useUserStore } from './user'

export const useLevelStore = defineStore('level', {
  getters: {
    // 当前等级信息(弟子阶段;长老任命属后台链路,Demo 不涉及)
    info() {
      const user = useUserStore()
      // 大长老为系统保留席位(ID=1),直接按 Lv5.5 呈现
      if (user.roleType === 'grand_elder') {
        return { level: 5, subLevel: '5.5', title: '大长老', letters: 4, color: '#ffb800', borderId: 'b-rainbow' }
      }
      const rule = resolveDiscipleLevel(user.stats)
      if (!rule) {
        return { level: 0, subLevel: null, title: '预备弟子', letters: 0, color: '#d8d4c8', borderId: null }
      }
      return {
        level: rule.level,
        subLevel: null,
        title: rule.title,
        letters: rule.letters,
        color: rule.color,
        borderId: rule.borderId,
      }
    },

    // 下一级及其三条件进度;Lv4 之后走长老阶梯,返回 null
    next() {
      const user = useUserStore()
      const cur = resolveDiscipleLevel(user.stats)
      const idx = cur ? DISCIPLE_LEVELS.indexOf(cur) : -1
      const rule = DISCIPLE_LEVELS[idx + 1] || null
      if (!rule) return null

      const conditions = [
        { label: '打卡天数', value: user.checkinDays, target: rule.days, unit: '天' },
        { label: '贡献值', value: user.contribution, target: rule.contribution, unit: '' },
        { label: '加精帖数', value: user.featured, target: rule.featured, unit: '篇' },
      ].filter((c) => c.target > 0)

      const pct = (c) => Math.min(1, c.value / c.target)
      const progress = conditions.length
        ? Math.round(Math.min(...conditions.map(pct)) * 100)
        : 100

      return { rule, conditions, progress }
    },

    elderLadder() {
      return ELDER_LEVELS.filter((l) => !l.hidden)
    },
  },
})
