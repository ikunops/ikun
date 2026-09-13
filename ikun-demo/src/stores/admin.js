import { defineStore } from 'pinia'
import { ACTIVITIES } from '@/mock/activities'
import { BOARDS } from '@/mock/boards'
import { SEED_USERS } from '@/mock/users'
import {
  BORDERS as BORDERS_SEED,
  registerCustomBorders,
  unregisterCustomBorder,
  hideBorder,
  restoreBorder,
  hiddenBorderIds,
} from '@/mock/borders'
import {
  DEFAULT_AVATARS as AVATARS_SEED,
  registerCustomAvatars,
  unregisterCustomAvatar,
  hideAvatar,
  restoreAvatar,
  hiddenAvatarCodes,
} from '@/mock/avatars'

const KEY = 'ikun-demo-admin-v1'

// 管理端角色 → 权限(设计文档·八 权限矩阵)
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

// users 表镜像:被管理用户(演示数据,宗主/大长老保留号不可封)
function seedUsers() {
  return SEED_USERS.map((u) => ({ banned: false, ...u }))
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
    approvals: [], // { id, type:'delete_hot', postId, postText, by, ts, status: pending/approved/rejected }
    logs: [], // 操作日志
    activities: [], // 活动运营
    boards: [], // 圈子板块(CRUD)
    boardDesc: {}, // 旧:板块描述覆盖(合并进 boards 前的兼容)
    customBorders: [], // 自定义边框
    customAvatars: [], // 自定义工种头像 { code, job, category:'F', img }
    deletedBorderIds: [], // 已删除的预置边框(可恢复)
    deletedAvatarCodes: [], // 已删除的预置头像(可恢复)
    loginMethods: { wechat: false, douyin: false }, // 第三方登录(功能已备,暂不开放)
    announcement: '', // 系统设置:站点公告(首页 banner 顶部展示)
  }),

  getters: {
    stats: (s) => ({
      total: s.users.length,
      banned: s.users.filter((u) => u.banned).length,
      admins: s.users.filter((u) => u.roleType !== 'user' && u.roleType !== 'sect_master').length,
      pending: s.approvals.filter((a) => a.status === 'pending').length,
    }),
  },

  actions: {
    restore() {
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) {
          const d = JSON.parse(raw)
          this.users = d.users || []
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
      } catch (e) { /* 重新播种 */ }
      this.users = seedUsers()
      this.activities = JSON.parse(JSON.stringify(ACTIVITIES))
      this.boards = JSON.parse(JSON.stringify(BOARDS))
      this.persist()
    },
    persist() {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          users: this.users,
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
      )
    },
    log(text) {
      this.logs.unshift({ id: 'l' + Date.now(), text, ts: Date.now() })
      if (this.logs.length > 100) this.logs.length = 100
      this.persist()
    },

    setRole(userId, roleType) {
      const u = this.users.find((x) => x.id === userId)
      if (!u || u.reserved) return false
      u.roleType = roleType
      if (roleType === 'core_elder') {
        u.level = 5
        u.subLevel = '5.4'
        u.title = '核心长老'
      }
      this.log(`将「${u.nickname}」设为 ${ROLE_LABEL[roleType] || roleType}`)
      this.persist()
      return true
    },

    // 注册:昵称即用户名,进 users 表(后台用户管理可见)
    registerAccount(username, password) {
      const id = Math.max(0, ...this.users.map((u) => u.id)) + 1
      const rec = {
        id,
        username,
        password, // # ponytail: 明文演示,接后端换 bcrypt
        phone: '',
        email: '',
        idNumber: 'IKUN-' + String(id).padStart(6, '0'),
        nickname: username,
        roleType: 'user',
        avatarCode: 'A01',
        subLevel: null,
        title: '预备弟子',
        level: 0,
        checkinDays: 0,
        contribution: 0,
        featured: 0,
        joinedAt: new Date().toISOString().slice(0, 10),
        banned: false,
      }
      this.users.push(rec)
      this.log(`新用户注册「${username}」(${rec.idNumber})`)
      this.persist()
      return rec
    },
    setLoginMethod(key, enabled) {
      this.loginMethods[key] = enabled
      this.log(`第三方登录「${key === 'wechat' ? '微信' : '抖音'}」${enabled ? '开启' : '关闭'}`)
      this.persist()
    },

    // 第三方 OAuth 首次登录:自动建号(昵称=平台用户_xxxx)
    registerOAuthUser(provider, openid) {
      const id = Math.max(0, ...this.users.map((u) => u.id)) + 1
      const tag = openid.slice(-4)
      const rec = {
        id,
        username: (provider === 'wechat' ? '微信用户_' : '抖音用户_') + tag,
        password: Math.random().toString(36).slice(2), // 随机密码,该账号仅第三方登录
        phone: '',
        email: '',
        provider,
        openid,
        idNumber: 'IKUN-' + String(id).padStart(6, '0'),
        nickname: (provider === 'wechat' ? '微信用户_' : '抖音用户_') + tag,
        roleType: 'user',
        avatarCode: 'A01',
        subLevel: null,
        title: '预备弟子',
        level: 0,
        checkinDays: 0,
        contribution: 0,
        featured: 0,
        joinedAt: new Date().toISOString().slice(0, 10),
        banned: false,
      }
      this.users.push(rec)
      this.log(`第三方登录自动建号「${rec.nickname}」(${rec.idNumber})`)
      this.persist()
      return rec
    },
    findOAuthUser(provider, openid) {
      return this.users.find((x) => x.provider === provider && x.openid === openid) || null
    },

    // 本人改密(保留号也可,绕开 reserved 只读)
    setOwnPassword(username, password) {
      const u = this.users.find((x) => x.username === username)
      if (!u) return false
      u.password = password
      this.log(`「${u.nickname}」修改了自己的密码`)
      this.persist()
      return true
    },

    updateContact(username, { phone, email }) {
      const u = this.users.find((x) => x.username === username)
      if (!u) return false
      if (phone !== undefined) u.phone = phone
      if (email !== undefined) u.email = email
      this.persist()
      return true
    },
    // 通用档案更新(昵称/联系方式/等级/角色/密码等),记操作日志
    updateUser(userId, patch, why = '') {
      const u = this.users.find((x) => x.id === userId)
      if (!u || u.reserved) return false
      Object.assign(u, patch)
      const keys = Object.keys(patch).join('/')
      this.log(`更新了「${u.nickname}」的资料(${keys})${why ? ' · ' + why : ''}`)
      this.persist()
      return true
    },
    removeUser(userId) {
      const u = this.users.find((x) => x.id === userId)
      if (!u || u.reserved) return false
      this.users = this.users.filter((x) => x.id !== userId)
      this.log(`删除了用户「${u.nickname}」(${u.idNumber})`)
      this.persist()
      return true
    },

    toggleBan(userId) {
      const u = this.users.find((x) => x.id === userId)
      if (!u || u.reserved) return false
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

    // 删除/恢复预置项(墓碑机制:等级规则仍引用预置 id,故可一键恢复)
    removeSeedBorder(id) {
      const b = BORDERS_SEED.find((x) => x.id === id)
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
    removeSeedAvatar(code) {
      const a = AVATARS_SEED.find((x) => x.code === code)
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
    setAnnouncement(text) {
      this.announcement = text
      this.log(text ? `更新站点公告:「${text.slice(0, 16)}…` : '清空了站点公告')
      this.persist()
    },

    // 删帖审批(流程3)
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
  },
})
