<script setup>
// 首页:轮播公告 + 推荐动态流(posts store,可点赞/进详情);桌面动态流双列
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bird, Rocket, CalendarCheck, Construction, Flame, PenLine } from 'lucide-vue-next'
import PostCard from '@/components/PostCard.vue'
import { fetchAnnouncements } from '@/api'
import { usePostsStore } from '@/stores/posts'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const postsStore = usePostsStore()
const admin = useAdminStore()

const banners = ref([])
const posts = computed(() => postsStore.list)

onMounted(async () => {
  admin.restore()
  const base = (await fetchAnnouncements()).map((b, i) => ({
    ...b,
    icon: [Rocket, CalendarCheck, Construction][i % 3],
  }))
  // 管理端设置的站点公告插到最前(系统设置·站点公告)
  banners.value = admin.announcement
    ? [{ id: 'anno', icon: Construction, title: '站点公告', desc: admin.announcement, bg: '#e8f1ff' }, ...base]
    : base
})
</script>

<template>
  <div class="page home">
    <header class="brand">
      <img class="brand-logo" src="@/assets/images/brand-logo.png" alt="ikun社区" />
      <div class="brand-text">
        <b>ikun社区</b>
        <span>天下ikun是一家</span>
      </div>
      <span class="ik-chip brand-chip"><Bird :size="13" :stroke-width="2.4" /> 宗门制粉丝社区</span>
    </header>

    <van-swipe class="banner" :autoplay="3500" :show-indicators="true" indicator-color="#262338">
      <van-swipe-item v-for="b in banners" :key="b.id">
        <div class="banner-card" :style="{ background: b.bg }">
          <span class="banner-icon"><component :is="b.icon" :size="26" :stroke-width="2.2" /></span>
          <div>
            <b>{{ b.title }}</b>
            <p>{{ b.desc }}</p>
          </div>
        </div>
      </van-swipe-item>
    </van-swipe>

    <div class="ik-sec">
      <b><Flame :size="17" :stroke-width="2.4" /> 推荐动态</b>
      <button class="compose" @click="router.push('/post-create')">
        <PenLine :size="14" :stroke-width="2.4" /> 发动态
      </button>
    </div>

    <div class="feed">
      <PostCard
        v-for="p in posts"
        :key="p.id"
        :post="p"
        @open="router.push('/post-detail/' + p.id)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  padding-top: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  .brand-logo {
    display: block;
    width: 46px;
    height: 46px;
    border: 1px solid var(--line-strong);
    border-radius: 14px;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .brand-text {
    display: flex;
    flex-direction: column;

    b {
      font-size: 18px;
      font-weight: 900;
    }

    span {
      font-size: 10px;
      color: var(--text-2);
      letter-spacing: 2px;
    }
  }

  .brand-chip {
    margin-left: auto;
  }
}

.banner {
  border-radius: 16px;

  .banner-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--line-strong);
    border-radius: 16px;
    box-shadow: var(--shadow-md);

    b {
      display: block;
      font-size: 15px;
    }

    p {
      margin-top: 3px;
      font-size: 11px;
      color: var(--text-2);
    }
  }

  .banner-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    color: var(--ink);
    background: var(--card);
    border: 1px solid var(--line-strong);
    border-radius: 14px;
    box-shadow: var(--shadow-sm);
  }
}

.sec-head,
.ik-sec {
  .compose {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 800;
    color: var(--ink);
    background: var(--yellow);
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    box-shadow: var(--shadow-sm);
    cursor: pointer;

    &:active {
      transform: translate(2px, 2px);
      box-shadow: none;
    }
  }
}

.feed {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .banner .banner-card {
    padding: 20px 22px;
  }
}

@media (min-width: 1200px) {
  .feed {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>
