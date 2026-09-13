<script setup>
// 板块详情:板块内动态流 + 悬浮发帖(带板块参数)
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PenLine } from 'lucide-vue-next'
import PostCard from '@/components/PostCard.vue'
import { usePostsStore } from '@/stores/posts'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const router = useRouter()
const posts = usePostsStore()
const admin = useAdminStore()

const board = computed(
  () => admin.boards.find((b) => b.key === route.params.key) || { name: '板块', desc: '' }
)
const list = computed(() => posts.byBoard(route.params.key))
</script>

<template>
  <div class="page cd">
    <van-nav-bar :title="board.name" left-arrow @click-left="router.back()" />

    <p class="lead">{{ board.desc }} · {{ list.length }} 条动态</p>

    <div v-if="list.length" class="feed">
      <PostCard v-for="p in list" :key="p.id" :post="p" @open="router.push('/post-detail/' + p.id)" />
    </div>
    <div v-else class="empty ik-card">
      <b>{{ board.name }}还没有动态</b>
      <p>来抢第一帖,贡献值 +5</p>
    </div>

    <button class="fab" @click="router.push({ path: '/post-create', query: { board: board.key } })">
      <PenLine :size="22" :stroke-width="2.4" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.cd {
  padding-top: 0;
}

.lead {
  padding: 10px 2px 12px;
  font-size: 12px;
  color: var(--text-2);
}

.feed {
  display: grid;
  gap: 12px;
}

.empty {
  padding: 34px 16px;
  text-align: center;

  b {
    display: block;
    font-size: 15px;
  }

  p {
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-2);
  }
}

.fab {
  position: fixed;
  right: 22px;
  bottom: calc(96px + env(safe-area-inset-bottom));
  z-index: 5;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  background: var(--yellow);
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  box-shadow: var(--shadow-md);
  cursor: pointer;

  &:active {
    transform: translate(2px, 2px);
    box-shadow: var(--shadow-sm);
  }
}

@media (min-width: 768px) {
  .fab {
    bottom: 40px;
  }
}

@media (min-width: 1200px) {
  .feed {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>
