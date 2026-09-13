// Demo 阶段直接读 mock;接后端时把这些函数替换为 axios 请求即可(HTTP 层见设计文档·十)
// 动态流在 stores/posts.js,活动在 stores/admin.js,此处只保留静态公告
export const fetchAnnouncements = () =>
  Promise.resolve([
    { id: 1, icon: 'rocket', title: '天下ikun是一家', desc: '欢迎来到 ikun 社区,先去打卡点亮你的 ikun 字母吧!', bg: '#fff3d6' },
    { id: 2, icon: 'checkin', title: '每日打卡 +5 贡献值', desc: '累计打卡解锁等级与专属边框', bg: '#e8f1ff' },
    { id: 3, icon: 'coming', title: '圈子 / 发帖 / 留言板已上线', desc: '去圈子发第一帖,贡献值 +5', bg: '#ffe8ee' },
  ])
