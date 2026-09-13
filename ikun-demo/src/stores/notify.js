import { defineStore } from 'pinia'

const KEY = 'ikun-demo-notify-v1'
let seq = Date.now()

// notifications 表 —— 系统通知(升级/解锁边框/发帖/留言等事件)
export const useNotifyStore = defineStore('notify', {
  state: () => ({
    list: [
      {
        id: 'n-seed',
        type: 'system',
        title: '欢迎来到 ikun 社区',
        text: '每天打卡 +5 贡献值,点亮你的 ikun 字母吧',
        ts: Date.now() - 24 * 3600 * 1000,
        read: true,
      },
    ],
  }),

  getters: {
    unread: (s) => s.list.filter((n) => !n.read).length,
  },

  actions: {
    restore() {
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) this.list = JSON.parse(raw)
      } catch (e) {
        // 忽略损坏缓存
      }
    },
    persist() {
      localStorage.setItem(KEY, JSON.stringify(this.list))
    },
    push(type, title, text) {
      this.list.unshift({ id: 'n' + ++seq, type, title, text, ts: Date.now(), read: false })
      if (this.list.length > 50) this.list.length = 50
      this.persist()
    },
    markAllRead() {
      this.list.forEach((n) => (n.read = true))
      this.persist()
    },
  },
})
