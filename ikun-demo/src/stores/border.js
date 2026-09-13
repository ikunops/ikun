import { defineStore } from 'pinia'
import { allBorders, findBorder } from '@/mock/borders'
import { useLevelStore } from './level'
import { useUserStore } from './user'
import { useAdminStore } from './admin'

const STORAGE_KEY = 'ikun-demo-border-v1'

// 边框按弟子→长老顺序逐级解锁
const LEVEL_ORDER = [
  'b-gray',
  'b-blue',
  'b-purple',
  'b-gold',
  'b-cyan-gray',
  'b-silver',
  'b-azure',
  'b-violet-gold',
  'b-rainbow',
]

export const useBorderStore = defineStore('border', {
  state: () => ({
    currentId: '',
  }),

  getters: {
    unlockedIds() {
      const user = useUserStore()
      const borderId = useLevelStore().info.borderId
      const idx = Math.max(0, LEVEL_ORDER.indexOf(borderId))
      const base = LEVEL_ORDER.slice(0, idx + 1)
      // 大长老额外解锁全部自定义边框
      if (user.roleType === 'grand_elder') {
        return base.concat(useAdminStore().customBorders.map((b) => b.id))
      }
      return base
    },
    unlocked() {
      return this.all.filter((b) => this.unlockedIds.includes(b.id) && !b.hidden)
    },
    // 全量边框 = 预置 + 管理后台自定义
    all() {
      return allBorders().filter((b) => !b.hidden)
    },
    current() {
      return findBorder(this.currentId)
    },
  },

  actions: {
    setCurrent(id) {
      if (!this.unlockedIds.includes(id)) return false
      this.currentId = id
      localStorage.setItem(STORAGE_KEY, id)
      return true
    },
    // 登录/升级后调用:优先用用户保存的选择,否则跟随等级默认边框
    syncDefault() {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && this.unlockedIds.includes(saved)) {
        this.currentId = saved
        return
      }
      this.currentId = useLevelStore().info.borderId || 'b-gray'
    },
  },
})
