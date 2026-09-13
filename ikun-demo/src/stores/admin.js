import { defineStore } from 'pinia'
import { load, save } from './db'
import { ACTIVITIES } from '@/mock/activities'
import { BOARDS } from '@/mock/boards'
import { BORDERS as SEED_BORDERS, registerCustomBorders, unregisterCustomBorder, hideBorder, restoreBorder } from '@/mock/borders'
import { DEFAULT_AVATARS as SEED_AVATARS, registerCustomAvatars, unregisterCustomAvatar, hideAvatar, restoreAvatar } from '@/mock/avatars'

const KEY = 'admin'

// 权限矩阵(设计文档·八)
// grand_elder 大长老 / core_elder 核心长老 / reviewer 内容审核员 / operator 活动运营 / board_admin 板块管理员
export const PERMS = {
  grand_elder: ['dashboard', 'users', 'content', 'approve', 'manage_admins', 'ban', 'grant_border', 'appoint', 'borders', 'idcards'],
  core_elder: ['dashboard', 'users', 'content', 'ban', 'grant_border', 'borders', 'idcards'],
  reviewer: ['dashboard', 'content'],
  operator: ['dashboard'],
  board_admin: ['dashboard', 'content'],
}

export function can(role, perm) {
  return (PERMS[role] || []).includes(perm)
}

export const ROLE_LABEL = {
  grand_elder: '大长老',
  core_elder: '核心长老',
  reviewer: '内容审核员',
  operator: '活动运营',
  board_admin: '板块管理员',
}

// 审批流:核心长老删热帖(>100赞)→ 大长老批准/驳回(设计文档·流程3)
export const HOT_POST_LIKES = 100

// —— users 表记录结构(唯一真源) ——
// { id, nickname(唯一登录名), password, idNumber, roleType,
//   checkins:['YYYY-MM-DD'], contribution, featured,          ← 数据唯一真源
//   levelOverride:null|{level,title},                         ← 管理员等级配置;未设则按数据推导
//   avatarCode, avatarType, customAvatar, hasIdCard,
//   phone, email, joinedAt, banned, provider?, openid? }

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
    seq: 0, // 身份编号/id 独立计数,删号不复用
    approvals: [],
    logs: [],
    activities: [],
    boards: [],
    customBorders: [],
    customAvatars: [],
    deletedBorderIds: [],
    deletedAvatarCodes: [],
    loginMethods: { wechat: false, douyin: false }, // 第三方登录(功能已备,暂不开放)
    announcement: '',
  }),

  getters: {
    stats: (s) => ({
      total: s.users.length,
      banned: s.users.filter((u) => u.banned).length,
      admins: s.users.filter((u) => u.roleType !== 'user').length,
      pending: s.approvals.filter((a) => a.status === 'pending').length,
    }),
  },

  actions: {
    restore() {
      const d = load(KEY)
      if (d) {
        this.users = d.users || []
        this.seq = d.seq || 0
        this.approvals = d.approvals || []
        this.logs = d.logs || []
        this.activities = d.activities || []
        this.boards = d.boards || JSON.parse(JSON.stringify(BOARDS))
        this.customBorders = d.customBorders || []
        this.customAvatars = d.customAvatars || []
        this.deletedBorderIds = d.deletedBorderIds || []
        this.deletedAvatarCodes = d.deletedAvatarCodes || []
        this.loginMethods = d.loginMethods || { wechat: false, douyin: false }
        this.announcement = d.announcement || ''
        registerCustomBorders(this.customBorders)
        registerCustomAvatars(this.customAvatars)
        this.deletedBorderIds.forEach(hideBorder)
        this.deletedAvatarCodes.forEach(hideAvatar)
        return
      }
      this.boards = JSON.parse(JSON.stringify(BOARDS))
      this.activities = JSON.parse(JSON.stringify(ACTIVITIES))
      this.persist()
    },
    persist() {
      save(KEY, {
        users: this.users,
        seq: this.seq,
        approvals: this.approvals,
        logs: this.logs,
        activities: this.activities,
        boards: this.boards,
        customBorders: this.customBorders,
        customAvatars: this.customAvatars,
        deletedBorderIds: this.deletedBorderIds,
        deletedAvatarCodes: this.deletedAvatarCodes,
        loginMethods: this.loginMethods,
        announcement: this.announcement,
      })
    },
    log(text) {
      this.logs.unshift({ id: 'l' + Date.now(), text, ts: Date.now() })
      if (this.logs.length > 100) this.logs.length = 100
      this.persist()
    },

    // —— 注册:昵称即登录名(全局唯一),编号按注册顺序;第 1 位 = 000001 = 大长老 ——
    registerAccount(nickname, password) {
      this.seq += 1
      const first = this.users.length === 0
      const rec = {
        id: this.seq,
        nickname,
        password, // # ponytail: 明文演示,接后端换 bcrypt
        idNumber: 'IKUN-' + String(this.seq).padStart(6, '0'),
        roleType: first ? 'grand_elder' : 'user',
        checkins: [],
        contribution: 0,
        featured: 0,
        levelOverride: null,
        avatarCode: 'A01',
        avatarType: 'default',
        customAvatar: '',
        hasIdCard: false,
        phone: '',
        email: '',
        joinedAt: new Date().toISOString().slice(0, 10),
        banned: false,
      }
      this.users.push(rec)
      this.log(
        first
          ? `首位注册用户「${nickname}」获得 IKUN-000001,自动就任大长老`
          : `新用户注册「${nickname}」(${rec.idNumber})`
      )
      this.persist()
      return rec
    },

    // —— 通用:按昵称定位(昵称即登录名) ——
    byNickname(nickname) {
      return this.users.find((x) => x.nickname === nickname) || null
    },

    updateUser(userId, patch, why = '') {
      const u = this.users.find((x) => x.id === userId)
      if (!u) return false
      Object.assign(u, patch)
      this.log(`更新了「${u.nickname}」的资料(${Object.keys(patch).join('/')})${why ? ' · ' + why : ''}`)
      this.persist()
      return true
    },
    removeUser(userId) {
      const u = this.users.find((x) => x.id === userId)
      if (!u) return false
      this.users = this.users.filter((x) => x.id !== userId)
      this.log(`删除了用户「${u.nickname}」(${u.idNumber})`)
      this.persist()
      return true
    },

    setRole(userId, roleType) {
      const u = this.users.find((x) => x.id === userId)
      if (!u) return false
      u.roleType = roleType
      if (roleType === 'core_elder') u.levelOverride = { level: 5, title: '核心长老' }
      if (roleType === 'grand_elder') u.levelOverride = { level: 5, title: '大长老' }
      this.log(`将「${u.nickname}」设为 ${ROLE_LABEL[roleType] || roleType}`)
      this.persist()
      return true
    },

    toggleBan(userId) {
      const u = this.users.find((x) => x.id === userId)
      if (!u) return false
      u.banned = !u.banned
      this.log(`${u.banned ? '封禁' : '解封'}了用户「${u.nickname}」`)
      this.persist()
      return true
    },

    grantBorder(userId, borderName) {
      const u = this.users.find((x) => x.id === userId)
      if (!u) return false
      this.log(`为「${u.nickname}」特别授予边框「${borderName}」`)
      this.persist()
      return true
    },

    // —— 本人操作(会话用户改自己的资料/密码) ——
    updateContact(nickname, { phone, email }) {
      const u = this.byNickname(nickname)
      if (!u) return false
      if (phone !== undefined) u.phone = phone
      if (email !== undefined) u.email = email
      this.persist()
      return true
    },
    setOwnPassword(nickname, password) {
      const u = this.byNickname(nickname)
      if (!u) return false
      u.password = password
      this.log(`「${u.nickname}」修改了自己的密码`)
      this.persist()
      return true
    },

    // —— 删帖审批(流程3) ——
    requestDelete(postId, postText, by) {
      this.approvals.unshift({
        id: 'a' + Date.now(),
        type: 'delete_hot',
        postId,
        postText: postText.slice(0, 40),
        by,
        ts: Date.now(),
        status: 'pending',
      })
      this.log(`「${by}」提交了删除热帖的审批申请`)
      this.persist()
    },
    resolveApproval(id, approved) {
      const a = this.approvals.find((x) => x.id === id)
      if (!a) return false
      a.status = approved ? 'approved' : 'rejected'
      this.log(`大长老${approved ? '批准' : '驳回'}了删除热帖的申请(帖子:${a.postText}…)`)
      this.persist()
      return true
    },

    // —— 活动运营 ——
    addActivity({ title, desc, reward }) {
      this.activities.unshift({ id: Date.now(), title, desc, reward, deadline: '长期有效', status: '进行中' })
      this.log(`发布了活动「${title}」`)
      this.persist()
    },
    endActivity(id) {
      const a = this.activities.find((x) => x.id === id)
      if (a) {
        a.status = '已结束'
        this.log(`结束了活动「${a.title}」`)
        this.persist()
      }
    },
    deleteActivity(id) {
      const a = this.activities.find((x) => x.id === id)
      if (a) {
        this.activities = this.activities.filter((x) => x.id !== id)
        this.log(`删除了活动「${a.title}」`)
        this.persist()
      }
    },

    // —— 圈子板块 ——
    addBoard(name, desc) {
      const key = 'c' + Date.now()
      this.boards.push({ key, name, desc })
      this.log(`新增了圈子板块「${name}」`)
      this.persist()
      return key
    },
    removeBoard(key) {
      const b = this.boards.find((x) => x.key === key)
      if (b) {
        this.boards = this.boards.filter((x) => x.key !== key)
        this.log(`删除了圈子板块「${b.name}」`)
        this.persist()
      }
    },
    setBoardDesc(key, desc) {
      const b = this.boards.find((x) => x.key === key)
      if (b) {
        b.desc = desc
        this.log(`更新了板块「${b.name}」的描述`)
        this.persist()
      }
    },

    // —— 自定义边框 ——
    addCustomBorder(border) {
      this.customBorders.push(border)
      registerCustomBorders([border])
      this.log(`新增了边框「${border.name}」`)
      this.persist()
    },
    removeCustomBorder(id) {
      const b = this.customBorders.find((x) => x.id === id)
      this.customBorders = this.customBorders.filter((x) => x.id !== id)
      unregisterCustomBorder(id)
      if (b) this.log(`删除了边框「${b.name}」`)
      this.persist()
    },

    // —— 预置边框墓碑 ——
    removeSeedBorder(id) {
      const b = SEED_BORDERS.find((x) => x.id === id)
      if (!b || this.deletedBorderIds.includes(id)) return
      this.deletedBorderIds.push(id)
      hideBorder(id)
      this.log(`删除了预置边框「${b.name}」`)
      this.persist()
    },
    restoreSeedBorder(id) {
      this.deletedBorderIds = this.deletedBorderIds.filter((x) => x !== id)
      restoreBorder(id)
      this.log(`恢复了预置边框 ${id}`)
      this.persist()
    },

    // —— 自定义头像 ——
    nextAvatarCode() {
      return 'F' + String(this.customAvatars.length + 1).padStart(2, '0')
    },
    addCustomAvatar(job, img) {
      const code = this.nextAvatarCode()
      this.customAvatars.push({ code, job, category: 'F', img, custom: true })
      registerCustomAvatars(this.customAvatars)
      this.log(`新增了工种头像「${job}(${code})」`)
      this.persist()
      return code
    },
    removeCustomAvatar(code) {
      const a = this.customAvatars.find((x) => x.code === code)
      this.customAvatars = this.customAvatars.filter((x) => x.code !== code)
      unregisterCustomAvatar(code)
      if (a) this.log(`删除了工种头像「${a.job}(${code})」`)
      this.persist()
    },

    // —— 预置头像墓碑 ——
    removeSeedAvatar(code) {
      const a = SEED_AVATARS.find((x) => x.code === code)
      if (!a || this.deletedAvatarCodes.includes(code)) return
      this.deletedAvatarCodes.push(code)
      hideAvatar(code)
      this.log(`删除了预置头像「${a.job}(${code})」`)
      this.persist()
    },
    restoreSeedAvatar(code) {
      this.deletedAvatarCodes = this.deletedAvatarCodes.filter((x) => x !== code)
      restoreAvatar(code)
      this.log(`恢复了预置头像 ${code}`)
      this.persist()
    },

    // —— 第三方登录 ——
    setLoginMethod(key, enabled) {
      this.loginMethods[key] = enabled
      this.log(`第三方登录「${key === 'wechat' ? '微信' : '抖音'}」${enabled ? '开启' : '关闭'}`)
      this.persist()
    },
    registerOAuthUser(provider, openid) {
      this.seq += 1
      const tag = openid.slice(-4)
      const rec = {
        id: this.seq,
        nickname: (provider === 'wechat' ? '微信用户_' : '抖音用户_') + tag,
        password: Math.random().toString(36).slice(2),
        idNumber: 'IKUN-' + String(this.seq).padStart(6, '0'),
        roleType: 'user',
        checkins: [],
        contribution: 0,
        featured: 0,
        levelOverride: null,
        avatarCode: 'A01',
        avatarType: 'default',
        customAvatar: '',
        hasIdCard: false,
        phone: '',
        email: '',
        joinedAt: new Date().toISOString().slice(0, 10),
        banned: false,
        provider,
        openid,
      }
      this.users.push(rec)
      this.log(`第三方登录自动建号「${rec.nickname}」(${rec.idNumber})`)
      this.persist()
      return rec
    },
    findOAuthUser(provider, openid) {
      return this.users.find((x) => x.provider === provider && x.openid === openid) || null
    },

    // —— 系统设置 ——
    setAnnouncement(text) {
      this.announcement = text
      this.log(text ? `更新站点公告:「${text.slice(0, 16)}…` : '清空了站点公告')
      this.persist()
    },
  },
})
