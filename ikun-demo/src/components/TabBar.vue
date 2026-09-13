<script setup>
// TabBar 双形态:<768px 底部栏(van-tabbar),≥1200px 左侧导航栏(自绘 rail)
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, Users, CalendarCheck, Bell, CircleUserRound } from 'lucide-vue-next'
import { useNotifyStore } from '@/stores/notify'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const notify = useNotifyStore()
const user = useUserStore()

const TABS = [
  { to: '/home', label: '首页', icon: Home },
  { to: '/circles', label: '圈子', icon: Users },
  { to: '/checkin', label: '打卡', icon: CalendarCheck },
  { to: '/messages', label: '消息', icon: Bell, dot: true },
  { to: '/profile', label: '我的', icon: CircleUserRound },
]

// 「我的」实际落在 /u/<自己>;逛别人主页时不点亮
const activeIdx = computed(() => {
  if (route.path.startsWith('/u/')) {
    const isMe = decodeURIComponent(route.params.name || '') === user.nickname
    return isMe ? TABS.length - 1 : -1
  }
  return TABS.findIndex((t) => t.to === route.path)
})
const hasUnread = computed(() => notify.unread > 0)
</script>

<template>
  <!-- 手机/平板:底部栏 -->
  <van-tabbar :model-value="activeIdx" safe-area-inset-bottom class="tb">
    <van-tabbar-item
      v-for="t in TABS"
      :key="t.to"
      @click="router.replace(t.to)"
      :dot="t.dot && hasUnread"
    >
      {{ t.label }}
      <template #icon>
        <component :is="t.icon" :size="22" :stroke-width="2.2" />
      </template>
    </van-tabbar-item>
  </van-tabbar>

  <!-- 桌面:左侧导航栏 -->
  <nav class="rail">
    <router-link
      v-for="(t, i) in TABS"
      :key="t.to"
      :to="t.to"
      class="rail-item"
      :class="{ active: activeIdx === i }"
    >
      <span class="rail-icon">
        <component :is="t.icon" :size="22" :stroke-width="2.2" />
        <i v-if="t.dot && hasUnread" class="rail-dot"></i>
      </span>
      <span>{{ t.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped lang="scss">
.tb {
  border-top: 1px solid var(--line);
}

.tb :deep(.van-tabbar-item) {
  color: var(--text-2);
  font-size: 11px;
  font-weight: 700;
}

.tb :deep(.van-tabbar-item--active) {
  color: var(--yellow-deep);
}

// —— 桌面左栏(移动端隐藏) ——
.rail {
  display: none;
}

@media (min-width: 1200px) {
  .tb {
    display: none;
  }

  .rail {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    width: 96px;
    padding: 24px 12px;
    background: var(--card);
    border-right: 1px solid var(--line);
  }

.rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-2);
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: 14px;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: #fff7e0;
    color: var(--ink);
  }

  &.active {
    color: var(--ink);
    background: var(--yellow);
    border-color: rgba(255, 176, 31, 0.6);
    box-shadow: var(--shadow-sm);
  }
}

.rail-icon {
  position: relative;
  display: flex;

  .rail-dot {
    position: absolute;
    right: -5px;
    top: -4px;
    width: 8px;
    height: 8px;
    background: var(--red);
    border: 2px solid var(--card);
    border-radius: 50%;
  }
}
}
</style>
