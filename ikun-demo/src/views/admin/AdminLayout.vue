<script setup>
// 管理后台布局:左侧栏 + 顶栏(与用户端共用设计 token)
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  FileText,
  Gem,
  CreditCard,
  FolderTree,
  Megaphone,
  Bell,
  Settings,
  SmilePlus,
  ArrowLeft,
  LogOut,
} from 'lucide-vue-next'
import brandLogo from '@/assets/images/brand-logo.png'
import { useUserStore } from '@/stores/user'
import { useAdminStore, ROLE_LABEL } from '@/stores/admin'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const admin = useAdminStore()

const role = computed(() => user.roleType || 'user')
const roleLabel = computed(() => ROLE_LABEL[role.value] || '管理员')
const menuOpen = ref(false)

const NAV = [
  { key: 'dashboard', to: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { key: 'users', to: '/admin/users', label: '用户管理', icon: Users },
  { key: 'content', to: '/admin/content', label: '内容管理', icon: FileText },
  { key: 'circles', to: '/admin/circles', label: '圈子管理', icon: FolderTree },
  { key: 'activities', to: '/admin/activities', label: '活动运营', icon: Megaphone },
  { key: 'idcards', to: '/admin/idcards', label: '身份证管理', icon: CreditCard },
  { key: 'borders', to: '/admin/borders', label: '边框管理', icon: Gem },
  { key: 'avatars', to: '/admin/avatars', label: '头像管理', icon: SmilePlus },
  { key: 'notices', to: '/admin/notices', label: '消息管理', icon: Bell },
  { key: 'settings', to: '/admin/settings', label: '系统设置', icon: Settings },
]
</script>

<template>
  <div class="admin-shell">
    <button class="m-menu" @click="menuOpen = !menuOpen">
      <LayoutDashboard :size="18" :stroke-width="2.4" />
    </button>
    <div v-if="menuOpen" class="m-overlay" @click="menuOpen = false"></div>

    <aside class="aside" :class="{ open: menuOpen }">
      <div class="brand">
        <img :src="brandLogo" alt="ikun" />
        <div>
          <b>ikun 后台</b>
          <span>{{ roleLabel }}</span>
        </div>
      </div>
      <nav class="nav">
        <router-link
          v-for="n in NAV"
          :key="n.key"
          :to="n.to"
          class="nav-item"
          :class="{ active: route.path === n.to }"
          @click="menuOpen = false"
        >
          <component :is="n.icon" :size="18" :stroke-width="2.2" />
          {{ n.label }}
          <span v-if="n.key === 'dashboard' && admin.stats.pending" class="badge">{{ admin.stats.pending }}</span>
        </router-link>
      </nav>
      <div class="aside-foot">
        <router-link to="/home" class="back"><ArrowLeft :size="15" :stroke-width="2.4" /> 返回社区</router-link>
        <button class="exit" @click="router.push('/home')"><LogOut :size="15" :stroke-width="2.4" /></button>
      </div>
    </aside>

    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

.aside {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  width: 216px;
  height: 100vh;
  flex-shrink: 0;
  background: var(--card);
  border-right: 1px solid var(--line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  border-bottom: 1px solid var(--line);

  img {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid var(--line-strong);
  }

  b {
    display: block;
    font-size: 15px;
  }

  span {
    font-size: 11px;
    color: var(--text-2);
  }
}

.nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-2);
  text-decoration: none;
  border-radius: 12px;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: rgba(29, 27, 40, 0.04);
    color: var(--text);
  }

  &.active {
    color: #221a05;
    background: var(--brand-grad);
    box-shadow: 0 3px 10px rgba(255, 176, 31, 0.35);
  }

  .badge {
    margin-left: auto;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    color: #fff;
    background: var(--red);
    border-radius: 999px;
  }
}

.aside-foot {
  padding: 12px;
  border-top: 1px solid var(--line);
  display: flex;
  gap: 8px;

  .back {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-2);
    background: var(--bg);
    border-radius: 10px;
    text-decoration: none;

    &:hover {
      color: var(--text);
    }
  }

  .exit {
    padding: 9px;
    display: flex;
    align-items: center;
    color: var(--text-2);
    background: var(--bg);
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }
}

.main {
  flex: 1;
  min-width: 0;
  padding: 24px 28px;
}

@media (max-width: 767px) {
  .m-menu {
    position: fixed;
    left: 12px;
    top: 12px;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: var(--text);
    background: var(--card);
    border: 1px solid var(--line-strong);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
    cursor: pointer;
  }

  .m-overlay {
    position: fixed;
    inset: 0;
    z-index: 19;
    background: rgba(29, 27, 40, 0.35);
  }

  .aside {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 20;
    width: 216px;
    transform: translateX(-100%);
    transition: transform 0.2s ease;

    &.open {
      transform: translateX(0);
      box-shadow: var(--shadow-lg);
    }
  }

  .main {
    padding: 64px 14px 16px;
  }
}
</style>
