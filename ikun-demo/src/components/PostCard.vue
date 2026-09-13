<script setup>
// PostCard —— 帖子卡片:点赞/收藏直连 posts store,点击卡片进详情
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, MessageCircle, Star, Bookmark, Mic, Volleyball, Lightbulb, Megaphone, Gem } from 'lucide-vue-next'
import AvatarWithBorder from './AvatarWithBorder.vue'
import { formatTime, commentCount, usePostsStore } from '@/stores/posts'

const props = defineProps({
  post: { type: Object, required: true },
  link: { type: Boolean, default: true }, // 是否可点击进详情
})

const emit = defineEmits(['open'])
const router = useRouter()
const store = usePostsStore()

const IMG_ICONS = { mic: Mic, ball: Volleyball, star: Star, bulb: Lightbulb, horn: Megaphone, gem: Gem }

const timeText = computed(() => formatTime(props.post))
const cCount = computed(() => commentCount(props.post))
const mine = computed(() => props.post.author?.avatarType === 'custom')
</script>

<template>
  <div class="pc ik-card" :class="{ clickable: link }" @click="link && emit('open')">
    <div class="pc-head">
      <AvatarWithBorder
        :avatar-code="post.author.avatarCode"
        :avatar-type="post.author.avatarType || 'default'"
        :custom-avatar="post.author.customAvatar || ''"
        border-id="b-gray"
        :size="40"
      />
      <div class="pc-who">
        <span class="pc-name">{{ post.author.nickname }}</span>
        <span class="pc-title" :style="{ background: post.author.color }">{{ post.author.title }}</span>
      </div>
      <span class="pc-time">{{ timeText }}</span>
    </div>

    <p class="pc-content">{{ post.content }}</p>

    <div
      v-if="post.images.length"
      class="pc-imgs"
      :style="{ gridTemplateColumns: `repeat(${post.images.length > 1 ? 3 : 1}, 1fr)` }"
    >
      <div v-for="(img, i) in post.images" :key="i" class="pc-img" :style="{ background: img.bg }">
        <img v-if="img.url" :src="img.url" alt="帖子配图" />
        <component :is="IMG_ICONS[img.icon]" v-else :size="34" :stroke-width="1.8" />
      </div>
    </div>

    <div class="pc-foot">
      <button class="pc-act" :class="{ on: post.liked }" @click.stop="store.toggleLike(post.id)">
        <Heart :size="15" :stroke-width="2.4" :fill="post.liked ? 'currentColor' : 'none'" />
        {{ post.likes }}
      </button>
      <button class="pc-act" @click.stop="link ? router.push('/post-detail/' + post.id) : emit('open')">
        <MessageCircle :size="15" :stroke-width="2.4" />
        {{ cCount }}
      </button>
      <button
        class="pc-act"
        :class="{ fav: post.fav }"
        @click.stop="store.toggleFav(post.id)"
      >
        <Bookmark :size="15" :stroke-width="2.4" :fill="post.fav ? 'currentColor' : 'none'" />
        收藏
      </button>
      <span v-if="post.featured" class="pc-featured"><Star :size="12" :stroke-width="2.6" /> 加精</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pc {
  padding: 12px;

  &.clickable {
    cursor: pointer;
  }
}

.pc-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pc-who {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.pc-name {
  font-size: 14px;
  font-weight: 800;
}

.pc-title {
  align-self: flex-start;
  padding: 1px 8px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
}

.pc-time {
  margin-left: auto;
  font-size: 11px;
  color: var(--gray);
  flex-shrink: 0;
}

.pc-content {
  margin-top: 9px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.pc-imgs {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.pc-img {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.pc-foot {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
}

.pc-act {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  font-size: 12px;
  color: var(--text-2);
  background: none;
  border: none;
  cursor: pointer;

  &.on {
    color: var(--red);
  }

  &.fav {
    color: var(--yellow-deep);
  }
}

.pc-featured {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  color: var(--yellow-deep);
}
</style>
