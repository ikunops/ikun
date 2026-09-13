import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vant from 'vant'
import 'vant/lib/index.css'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import { usePostsStore } from './stores/posts'
import { useNotifyStore } from './stores/notify'
import { useAdminStore } from './stores/admin'
import './assets/styles/global.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Vant)

// 恢复本地状态(刷新不丢号/帖子/通知;admin.restore 注册自定义边框/头像)
useUserStore(pinia).restore()
usePostsStore(pinia).restore()
useNotifyStore(pinia).restore()
useAdminStore(pinia).restore()

app.mount('#app')
