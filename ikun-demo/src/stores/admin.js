import { defineStore } from 'pinia'
import { ACTIVITIES } from '@/mock/activities'
import { BOARDS } from '@/mock/boards'
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
  return [
    { id: 0, idNumber: 'IKUN-000000', nickname: '宗主', avatarCode: 'A02', level: 5, subLevel: '5.6', title: '宗主', roleType: 'sect_master', banned: false, reserved: true, checkinDays: 0, contribution: 0, featured: 0 },
    { id: 1, idNumber: 'IKUN-000001', nickname: '大长老(我)', avatarCode: 'E03', level: 5, subLevel: '5.5', title: '大长老', roleType: 'grand_elder', banned: false, reserved: true, checkinDays: 66, contribution: 330, featured: 6 },
    { id: 2, idNumber: 'IKUN-000002', nickname: '阿坤不打篮球', avatarCode: 'A01', level: 3, subLevel: null, title: '核心弟子', roleType: 'user', banned: false, checkinDays: 33, contribution: 190, featured: 2 },
    { id: 3, idNumber: 'IKUN-000003', nickname: '两年半练习生', avatarCode: 'A02', level: 2, subLevel: null, title: '内门弟子', roleType: 'user', banned: false, checkinDays: 22, contribution: 110, featured: 1 },
    { id: 4, idNumber: 'IKUN-000004', nickname: '鸡你太美·美', avatarCode: 'D03', level: 1, subLevel: null, title: '外门弟子', roleType: 'user', banned: false, checkinDays: 12, contribution: 60, featured: 0 },
    { id: 5, idNumber: 'IKUN-000005', nickname: '背带裤政委', avatarCode: 'E01', level: 4, subLevel: null, title: '亲传弟子', roleType: 'user', banned: false, checkinDays: 45, contribution: 240, featured: 3 },
  ]
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
      localStorage.setItem(KEY, JSON.stringify({
        users: this.users,
        approvals: this.approvals,
        logs: this.logs,
        activities: this.activities,
        boards: this.boards,
        customBorders: this.customBorders,
        customAvatars: this.customAvatars,
        deletedBorderIds: this.deletedBorderIds,
        deletedAvatarCodes: this.deletedAvatarCodes,
        announcement: this.announcement,
      }))
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
