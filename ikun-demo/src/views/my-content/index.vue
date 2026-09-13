<script setup>
// 我的内容:我的动态 / 我的收藏(两个 tab)
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PenLine, Bookmark } from 'lucide-vue-next'
import PostCard from '@/components/PostCard.vue'
import { usePostsStore } from '@/stores/posts'

const router = useRouter()
const posts = usePostsStore()
const tab = ref('posts')

const list = computed(() => (tab.value === 'posts' ? posts.mine : posts.favorites))
</script>

<template>
  <div class="page mc">
    <van-nav-bar title="我的内容" left-arrow @click-left="router.back()" />

    <div class="tabs">
      <button class="tab" :class="{ active: tab === 'posts' }" @click="tab = 'posts'">
        <PenLine :size="15" :stroke-width="2.4" /> 我的动态 {{ posts.mine.length }}
      </button>
      <button class="tab" :class="{ active: tab === 'fav' }" @click="tab = 'fav'">
        <Bookmark :size="15" :stroke-width="2.4" /> 我的收藏 {{ posts.favorites.length }}
      </button>
    </div>

    <div v-if="list.length" class="feed">
      <PostCard v-for="p in list" :key="p.id" :post="p" @open="router.push('/post-detail/' + p.id)" />
    </div>
    <div v-else class="empty ik-card">
      <Bookmark v-if="tab === 'fav'" :size="26" :stroke-width="2" />
      <PenLine v-else :size="26" :stroke-width="2" />
      <p>{{ tab === 'fav' ? '收藏的动态会出现在这里' : '还没发过动态,去圈子发第一帖吧' }}</p>
      <button v-if="tab === 'posts'" class="ik-btn" @click="router.push('/post-create')">去发帖</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mc {
  padding-top: 0;
}

.tabs {
  display: flex;
  gap: 10px;
  margin: 12px 0 14px;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-2);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;

  &.active {
    color: var(--ink);
    background: var(--yellow);
    border-color: rgba(255, 176, 31, 0.6);
    box-shadow: var(--shadow-sm);
  }
}

.feed {
  display: grid;
  gap: 12px;
}

.empty {
  padding: 38px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--gray);

  p {
    font-size: 12px;
  }

  .ik-btn {
    padding: 9px 20px;
    font-size: 13px;
  }
}

@media (min-width: 1200px) {
  .feed {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>
