import { defineStore } from 'pinia'
import { nextIdNumber } from '@/mock/users'

const STORAGE_KEY = 'ikun-demo-user-v1'

export function dayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// 预置 12 天打卡(不含今天):让演示账号出生即 Lv1 外门弟子,可直接体验打卡与升级进度
function seedCheckins(n = 12) {
  const days = []
  for (let i = n; i >= 1; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(dayKey(d))
  }
  return days
}

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    phone: '',
    nickname: '',
    avatarType: 'default', // default | custom
    avatarCode: '',
    customAvatar: '',
    idNumber: '',
    joinedAt: '',
    checkins: [],
    featured: 0, // 加精帖数
    contributionBonus: 0, // 发帖/评论赞等额外贡献值
    hasIdCard: false,
    roleType: 'user', // user | core_elder | grand_elder
  }),

  getters: {
    checkinDays: (s) => s.checkins.length,
    contribution: (s) => s.checkins.length * 5 + s.contributionBonus,
    checkedToday: (s) => s.checkins.includes(dayKey()),
    stats() {
      return {
        checkinDays: this.checkinDays,
        contribution: this.contribution,
        featured: this.featured,
      }
    },
  },

  actions: {
    login(phone) {
      this.isLoggedIn = true
      this.phone = phone
      this.nickname = 'ikun_' + phone.slice(-4)
      this.idNumber = nextIdNumber()
      this.joinedAt = new Date().toISOString().slice(0, 10)
      this.checkins = seedCheckins()
      this.featured = 0
      this.contributionBonus = 0
      this.hasIdCard = false
      // 演示设定:体验号默认带大长老身份(设计文档·二:大长老=用户本人),可进后台
      this.roleType = 'grand_elder'
      this.persist()
    },
    // 大长老体验号:IKUN-000001,Lv5.5,解锁全部边框,直接进社区
    loginAsElder() {
      this.isLoggedIn = true
      this.phone = '13800000001'
      this.nickname = '大长老'
      this.idNumber = 'IKUN-000001'
      this.joinedAt = '2023-01-01'
      this.avatarType = 'default'
      this.avatarCode = 'E03'
      this.customAvatar = ''
      this.checkins = seedCheckins(66)
      this.featured = 6
      this.contributionBonus = 0
      this.hasIdCard = true
      this.roleType = 'grand_elder'
      this.persist()
    },
    setNickname(name) {
      const n = (name || '').trim()
      if (!n) return false
      this.nickname = n.slice(0, 12)
      this.persist()
      return true
    },
    addContribution(n) {
      this.contributionBonus += n
      this.persist()
    },
    setRole(roleType) {
      this.roleType = roleType
      this.persist()
    },
    setAvatar(code) {
      this.avatarType = 'default'
      this.avatarCode = code
      this.persist()
    },
    setCustomAvatar(dataUrl) {
      this.avatarType = 'custom'
      this.customAvatar = dataUrl
      this.persist()
    },
    issueCard() {
      this.hasIdCard = true
      this.persist()
    },
    checkinToday() {
      const key = dayKey()
      if (this.checkins.includes(key)) return { ok: false, msg: '今天已经打卡过啦' }
      this.checkins.push(key)
      this.persist()
      return { ok: true, contribution: 5 }
    },
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
    },
    restore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) this.$patch(JSON.parse(raw))
      } catch (e) {
        // 缓存损坏时忽略,走全新注册流程
      }
    },
    reset() {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('ikun-demo-border-v1')
      this.$reset()
    },
  },
})
