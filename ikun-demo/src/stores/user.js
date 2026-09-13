import { defineStore } from 'pinia'
import { load, save } from './db'
import { useAdminStore } from './admin'

const KEY = 'session'

export function dayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// —— 会话 store:只存一个指针(当前昵称),其余全部透传 users 表 ——
// 登录 = 指针指向表记录;打卡/发帖/改资料 = 改表记录;后台读同一份,永远实时
export const useUserStore = defineStore('user', {
  state: () => ({
    current: '', // 当前登录昵称
  }),

  getters: {
    rec() {
      const admin = useAdminStore()
      return admin.byNickname(this.current)
    },
    isLoggedIn() {
      return !!this.rec
    },
    banned() {
      return this.rec?.banned || false
    },
    nickname() {
      return this.rec?.nickname || ''
    },
    idNumber() {
      return this.rec?.idNumber || ''
    },
    roleType() {
      return this.rec?.roleType || 'user'
    },
    avatarCode() {
      return this.rec?.avatarCode || ''
    },
    avatarType() {
      return this.rec?.avatarType || 'default'
    },
    customAvatar() {
      return this.rec?.customAvatar || ''
    },
    phone() {
      return this.rec?.phone || ''
    },
    email() {
      return this.rec?.email || ''
    },
    joinedAt() {
      return this.rec?.joinedAt || ''
    },
    hasIdCard() {
      return this.rec?.hasIdCard || false
    },
    checkins() {
      return this.rec?.checkins || []
    },
    checkinDays() {
      return this.checkins.length
    },
    contribution() {
      return this.rec?.contribution || 0
    },
    featured() {
      return this.rec?.featured || 0
    },
    checkedToday() {
      return this.checkins.includes(dayKey())
    },
    stats() {
      return {
        checkinDays: this.checkinDays,
        contribution: this.contribution,
        featured: this.featured,
      }
    },
  },

  actions: {
    persist() {
      save(KEY, { current: this.current })
    },
    restore() {
      const d = load(KEY)
      this.current = d?.current || ''
      // 会话有效性:记录存在且未封禁
      if (this.current && !this.rec) this.current = ''
      if (this.current && this.banned) this.current = ''
    },
    logout() {
      this.current = ''
      this.persist()
    },

    // —— 昵称 + 密码登录 ——
    loginByPassword(nickname, password) {
      const admin = useAdminStore()
      admin.restore()
      const u = admin.byNickname(nickname)
      if (!u) return { ok: false, msg: '昵称不存在,先注册' }
      if (u.password !== password) return { ok: false, msg: '密码错误' }
      if (u.banned) return { ok: false, msg: '该账号已被封禁,联系大长老' }
      this.current = u.nickname
      this.persist()
      return { ok: true }
    },

    // —— 注册:昵称全局唯一,写入 users 表;新号走选头像→领身份证流程 ——
    registerAccount(nickname, password) {
      const admin = useAdminStore()
      admin.restore()
      if (!/^[\u4e00-\u9fa5\w·]{2,12}$/.test(nickname)) {
        return { ok: false, msg: '昵称 2-12 位(中文/字母/数字)' }
      }
      if (admin.users.some((x) => x.nickname === nickname)) {
        return { ok: false, msg: '该昵称已被占用' }
      }
      if ((password || '').length < 6) {
        return { ok: false, msg: '密码至少 6 位' }
      }
      admin.registerAccount(nickname, password)
      this.current = nickname
      this.persist()
      return { ok: true }
    },

    // —— 第三方登录(模拟授权;真接入 = 开放平台授权页 + 后端换 openid) ——
    oauthLogin(provider) {
      const key = 'ikun-oauth-' + provider
      let openid = localStorage.getItem(key)
      if (!openid) {
        openid = provider.slice(0, 2) + '_' + Math.random().toString(16).slice(2, 6)
        localStorage.setItem(key, openid)
      }
      const admin = useAdminStore()
      admin.restore()
      let u = admin.findOAuthUser(provider, openid)
      if (!u) u = admin.registerOAuthUser(provider, openid)
      if (u.banned) return { ok: false, msg: '该账号已被封禁,联系大长老' }
      this.current = u.nickname
      this.persist()
      return { ok: true, fresh: !u.hasIdCard }
    },

    // —— 会话内改自己 ——
    setNickname(n) {
      const admin = useAdminStore()
      const name = (n || '').trim()
      if (!name) return false
      if (admin.users.some((x) => x.nickname === name && x.nickname !== this.current)) return false
      const u = admin.byNickname(this.current)
      if (!u) return false
      u.nickname = name
      this.current = name
      admin.persist()
      this.persist()
      return true
    },
    checkinToday() {
      const admin = useAdminStore()
      const u = admin.byNickname(this.current)
      if (!u) return { ok: false, msg: '请先登录' }
      const key = dayKey()
      if (u.checkins.includes(key)) return { ok: false, msg: '今天已经打卡过啦' }
      u.checkins.push(key)
      u.contribution += 5 // 每日签到 +5(设计文档·六)
      admin.persist()
      return { ok: true, contribution: 5 }
    },
    addContribution(n) {
      const admin = useAdminStore()
      const u = admin.byNickname(this.current)
      if (!u) return
      u.contribution += n
      admin.persist()
    },
    issueCard() {
      const admin = useAdminStore()
      const u = admin.byNickname(this.current)
      if (u) {
        u.hasIdCard = true
        admin.persist()
      }
    },
    setAvatar(code) {
      const admin = useAdminStore()
      const u = admin.byNickname(this.current)
      if (u) {
        u.avatarType = 'default'
        u.avatarCode = code
        admin.persist()
      }
    },
    setCustomAvatar(dataUrl) {
      const admin = useAdminStore()
      const u = admin.byNickname(this.current)
      if (u) {
        u.avatarType = 'custom'
        u.customAvatar = dataUrl
        admin.persist()
      }
    },
    reset() {
      this.current = ''
      this.persist()
    },
  },
})
