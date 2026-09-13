<script setup>
// 圈子:四大板块 + 动态数统计,点进板块详情(第二期·内容互动)
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, Vote, Gift, Palette, PenLine, Construction, FolderTree } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import { usePostsStore } from '@/stores/posts'

const router = useRouter()
const posts = usePostsStore()
const admin = useAdminStore()

const ICONS = { meitu: Camera, dazuo: Vote, zhoubian: Gift, erchuang: Palette }

const boards = computed(() =>
  admin.boards.map((b) => ({
    ...b,
    icon: ICONS[b.key] || FolderTree,
    count: posts.byBoard(b.key).length,
  }))
)
</script>

<template>
  <div class="page">
    <button class="compose ik-btn is-block" @click="router.push('/post-create')">
      <PenLine :size="17" :stroke-width="2.4" /> 发个动态
    </button>

    <div class="grid">
      <div
        v-for="b in boards"
        :key="b.key"
        class="board ik-card"
        @click="router.push('/circles/' + b.key)"
      >
        <span class="board-icon"><component :is="b.icon" :size="26" :stroke-width="2.2" /></span>
        <b>{{ b.name }}</b>
        <p>{{ b.desc }}</p>
        <span class="board-tag">{{ b.count }} 条动态</span>
      </div>
    </div>

    <div class="more ik-card">
      <span class="more-icon"><Construction :size="20" :stroke-width="2.2" /></span>
      <p>更多板块(直播区/表白墙)规划中,先在现有板块玩起来</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.compose {
  margin-bottom: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.board {
  padding: 18px 12px;
  text-align: center;
  cursor: pointer;

  &:active {
    transform: translate(2px, 2px);
    box-shadow: var(--shadow-sm);
  }

  b {
    display: block;
    margin-top: 10px;
    font-size: 15px;
  }

  p {
    font-size: 10px;
    color: var(--text-2);
    margin-top: 3px;
  }
}

.board-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
}

.board-tag {
  display: inline-block;
  margin-top: 8px;
  padding: 2px 10px;
  font-size: 10px;
  font-weight: 700;
  color: var(--yellow-deep);
  background: #fff7e0;
  border: 1px solid rgba(255, 176, 31, 0.55);
  border-radius: 999px;
}

.more {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  margin-top: 16px;
  opacity: 0.75;

  .more-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    color: var(--ink);
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: 12px;
  }

  p {
    font-size: 11px;
    color: var(--text-2);
  }
}

@media (min-width: 1200px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}
</style>
