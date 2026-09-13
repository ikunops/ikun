import { defineStore } from 'pinia'
import { useAdminStore } from './admin'

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
    username: '',
    phone: '',
    email: '',
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
    // 昵称 + 密码登录(users 表校验,按账号档案 hydrate 会话)
    loginByPassword(username, password) {
      const admin = useAdminStore()
      admin.restore()
      const u = admin.users.find((x) => x.username === username)
      if (!u) return { ok: false, msg: '昵称不存在,先注册' }
      if (u.password !== password) return { ok: false, msg: '密码错误' }
      if (u.banned) return { ok: false, msg: '该账号已被封禁,联系大长老' }
      if (u.id === 0) return { ok: false, msg: '宗主为保留席位,不可登录' }

      this.isLoggedIn = true
      this.username = u.username
      this.phone = u.phone || ''
      this.email = u.email || ''
      this.nickname = u.nickname
      this.idNumber = u.idNumber
      this.joinedAt = u.joinedAt
      this.avatarType = 'default'
      this.avatarCode = u.avatarCode
      this.customAvatar = ''
      this.checkins = seedCheckins(u.checkinDays || 0)
      this.featured = u.featured || 0
      this.contributionBonus = 0
      this.hasIdCard = true
      this.roleType = u.roleType
      this.persist()
      return { ok: true }
    },

    // 注册:昵称即用户名,写入 users 表;新号走选头像→领身份证流程
    registerAccount(username, password) {
      const admin = useAdminStore()
      admin.restore()
      if (!/^[\u4e00-\u9fa5\w·]{2,12}$/.test(username)) {
        return { ok: false, msg: '昵称 2-12 位(中文/字母/数字)' }
      }
      if (admin.users.some((x) => x.username === username)) {
        return { ok: false, msg: '该昵称已被占用' }
      }
      if ((password || '').length < 6) {
        return { ok: false, msg: '密码至少 6 位' }
      }
      const rec = admin.registerAccount(username, password)

      this.isLoggedIn = true
      this.username = rec.username
      this.phone = ''
      this.email = ''
      this.nickname = rec.nickname
      this.idNumber = rec.idNumber
      this.joinedAt = rec.joinedAt
      this.avatarType = 'default'
      this.avatarCode = ''
      this.customAvatar = ''
      this.checkins = []
      this.featured = 0
      this.contributionBonus = 0
      this.hasIdCard = false
      this.roleType = 'user'
      this.persist()
      return { ok: true }
    },

    // 大长老快捷登录 = 表账号直达
    loginAsElder() {
      return this.loginByPassword('大长老', '123456')
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
