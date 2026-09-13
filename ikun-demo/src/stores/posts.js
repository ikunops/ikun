import { defineStore } from 'pinia'
import { POSTS } from '@/mock/posts'
import { useUserStore } from './user'
import { useLevelStore } from './level'
import { useNotifyStore } from './notify'

const KEY = 'ikun-demo-posts-v1'
let seq = Date.now()

// 相对时间格式化(新帖存 ts,种子帖保留文案)
export function formatTime(item) {
  if (!item.ts) return item.time || ''
  const diff = Date.now() - item.ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return m + '分钟前'
  const hh = Math.floor(m / 60)
  if (hh < 24) return hh + '小时前'
  if (Math.floor(hh / 24) === 1) return '昨天'
  const d = new Date(item.ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function commentCount(post) {
  if (!Array.isArray(post.comments)) return post.comments || 0
  return post.comments.reduce((n, c) => n + 1 + (c.replies?.length || 0), 0)
}

function meAuthor() {
  const user = useUserStore()
  const level = useLevelStore()
  return {
    nickname: user.nickname,
    avatarCode: user.avatarCode,
    avatarType: user.avatarType,
    customAvatar: user.customAvatar,
    title: level.info.title,
    color: level.info.color,
  }
}

export const usePostsStore = defineStore('posts', {
  state: () => ({
    list: [], // 帖子(种子 + 本机新增)
    guestbook: [], // 留言板:公开留言
  }),

  getters: {
    byBoard: (s) => (key) => s.list.filter((p) => p.board === key),
    byId: (s) => (id) => s.list.find((p) => String(p.id) === String(id)),
    mine: (s) => {
      const user = useUserStore()
      return s.list.filter((p) => p.author.nickname === user.nickname)
    },
    favorites: (s) => s.list.filter((p) => p.fav),
  },

  actions: {
    restore() {
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) {
          const data = JSON.parse(raw)
          this.list = data.list || []
          this.guestbook = data.guestbook || []
          return
        }
      } catch (e) {
        // 缓存损坏则重新播种
      }
      this.list = JSON.parse(JSON.stringify(POSTS))
      this.guestbook = [
        {
          id: 'g1',
          from: { nickname: '背带裤政委', avatarCode: 'E01' },
          to: '大长老',
          text: '报告大长老!新的一批坤鸡头像已入库,请检阅',
          ts: Date.now() - 6 * 3600 * 1000,
        },
        {
          id: 'g2',
          from: { nickname: '鸡你太美·美', avatarCode: 'D03' },
          to: '大长老',
          text: '申请周五组织线下应援,望批准',
          ts: Date.now() - 26 * 3600 * 1000,
        },
      ]
      this.persist()
    },
    persist() {
      localStorage.setItem(KEY, JSON.stringify({ list: this.list, guestbook: this.guestbook }))
    },

    toggleLike(id) {
      const p = this.byId(id)
      if (!p) return false
      p.liked = !p.liked
      p.likes += p.liked ? 1 : -1
      this.persist()
      return p.liked
    },
    toggleFav(id) {
      const p = this.byId(id)
      if (!p) return false
      p.fav = !p.fav
      this.persist()
      return p.fav
    },

    addPost({ board, content, images }) {
      const post = {
        id: 'u' + ++seq,
        board,
        content,
        images: images || [],
        ts: Date.now(),
        likes: 0,
        liked: false,
        fav: false,
        featured: false,
        comments: [],
        author: meAuthor(),
      }
      this.list.unshift(post)
      this.persist()
      const user = useUserStore()
      user.addContribution(5) // 发布帖子 +5(设计文档·六)
      useNotifyStore().push('post', '发帖成功', '动态已发布到圈子,贡献值 +5')
      return post
    },

    addComment(postId, text) {
      const p = this.byId(postId)
      if (!p) return null
      const c = {
        id: 'c' + ++seq,
        user: meAuthor(),
        text,
        ts: Date.now(),
        likes: 0,
        liked: false,
        replies: [],
      }
      p.comments.push(c)
      this.persist()
      return c
    },

    addReply(postId, commentId, text) {
      const p = this.byId(postId)
      const c = p && p.comments.find((x) => String(x.id) === String(commentId))
      if (!c) return null
      const r = {
        id: 'r' + ++seq,
        user: meAuthor(),
        replyTo: c.user.nickname,
        text,
        ts: Date.now(),
        likes: 0,
        liked: false,
      }
      c.replies.push(r)
      this.persist()
      return r
    },

    toggleCommentLike(postId, commentId) {
      const p = this.byId(postId)
      if (!p) return false
      const all = [...p.comments, ...p.comments.flatMap((c) => c.replies || [])]
      const c = all.find((x) => String(x.id) === String(commentId))
      if (!c) return false
      c.liked = !c.liked
      c.likes += c.liked ? 1 : -1
      if (c.liked) {
        const user = useUserStore()
        user.addContribution(1) // 评论被赞 +1(设计文档·六)
      }
      this.persist()
      return c.liked
    },

    addGuestbook(to, text) {
      const user = useUserStore()
      this.guestbook.unshift({
        id: 'g' + ++seq,
        from: { nickname: user.nickname, avatarCode: user.avatarCode },
        to,
        text,
        ts: Date.now(),
      })
      this.persist()
      useNotifyStore().push('guestbook', '留言成功', `你给「${to}」的留言已公开`)
    },
  },
})
