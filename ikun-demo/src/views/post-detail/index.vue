<script setup>
// 帖子详情:完整帖子 + 一级评论/二级回复 + 评论点赞(+1贡献) + 底部输入条
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Heart, ArrowLeft, Send, Mic, Volleyball, Star, Lightbulb, Megaphone, Gem } from 'lucide-vue-next'
import AvatarWithBorder from '@/components/AvatarWithBorder.vue'
import { formatTime } from '@/stores/posts'
import { usePostsStore } from '@/stores/posts'

const IMG_ICONS = { mic: Mic, ball: Volleyball, star: Star, bulb: Lightbulb, horn: Megaphone, gem: Gem }

const route = useRoute()
const router = useRouter()
const store = usePostsStore()

const post = computed(() => store.byId(route.params.id))

const draft = ref('')
const replyTo = ref(null) // { commentId, nickname }
const inputRef = ref(null)

function submitComment() {
  const text = draft.value.trim()
  if (!text) {
    showToast('说点什么吧')
    return
  }
  if (replyTo.value) {
    store.addReply(post.value.id, replyTo.value.commentId, text)
    replyTo.value = null
  } else {
    store.addComment(post.value.id, text)
  }
  draft.value = ''
  showToast('发布成功')
}

function startReply(comment) {
  replyTo.value = { commentId: comment.id, nickname: comment.user.nickname }
  inputRef.value?.focus()
}

function likeComment(comment) {
  store.toggleCommentLike(post.value.id, comment.id)
}
</script>

<template>
  <div class="page pd">
    <van-nav-bar title="动态详情" left-arrow @click-left="router.back()" />

    <template v-if="post">
      <!-- 帖子主体 -->
      <div class="main ik-card">
        <div class="head">
          <AvatarWithBorder
            :avatar-code="post.author.avatarCode"
            :avatar-type="post.author.avatarType || 'default'"
            :custom-avatar="post.author.customAvatar || ''"
            border-id="b-gray"
            :size="46"
          />
          <div class="who">
            <b>{{ post.author.nickname }}</b>
            <div class="meta">
              <span class="title-chip" :style="{ background: post.author.color }">{{ post.author.title }}</span>
              <span>{{ formatTime(post) }}</span>
            </div>
          </div>
        </div>
        <p class="content">{{ post.content }}</p>
        <div v-if="post.images.length" class="imgs" :class="{ multi: post.images.length > 1 }">
          <div v-for="(img, i) in post.images" :key="i" class="img" :style="{ background: img.bg }">
            <img v-if="img.url" :src="img.url" alt="配图" />
            <component :is="IMG_ICONS[img.icon]" v-else :size="42" :stroke-width="1.8" />
          </div>
        </div>
        <div class="acts">
          <button class="act" :class="{ on: post.liked }" @click="store.toggleLike(post.id)">
            <Heart :size="16" :stroke-width="2.4" :fill="post.liked ? 'currentColor' : 'none'" />
            {{ post.likes }} 赞
          </button>
          <button class="act" :class="{ on: post.fav }" @click="store.toggleFav(post.id)">
            {{ post.fav ? '已收藏' : '收藏' }}
          </button>
        </div>
      </div>

      <!-- 评论 -->
      <div class="c-sec">
        <b class="c-title">评论 {{ post.comments.length }}</b>

        <div v-if="!post.comments.length" class="c-empty">还没有评论,来抢沙发</div>

        <div v-for="c in post.comments" :key="c.id" class="comment">
          <AvatarWithBorder :avatar-code="c.user.avatarCode" :size="36" border-id="b-gray" />
          <div class="c-body">
            <div class="c-head">
              <b>{{ c.user.nickname }}</b>
              <button class="c-like" :class="{ on: c.liked }" @click="likeComment(c)">
                <Heart :size="13" :stroke-width="2.6" :fill="c.liked ? 'currentColor' : 'none'" />
                {{ c.likes }}
              </button>
            </div>
            <p class="c-text">{{ c.text }}</p>
            <div class="c-foot">
              <span>{{ formatTime(c) }}</span>
              <button @click="startReply(c)">回复</button>
            </div>

            <div v-if="c.replies.length" class="replies">
              <div v-for="r in c.replies" :key="r.id" class="reply">
                <b>{{ r.user.nickname }}</b>
                <span class="arrow"> → </span>
                <b>{{ r.replyTo }}</b>
                <p>{{ r.text }}</p>
                <div class="c-foot">
                  <span>{{ formatTime(r) }}</span>
                  <button @click="startReply(c)">回复</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部输入条 -->
      <div class="input-bar">
        <div v-if="replyTo" class="replying">
          回复 {{ replyTo.nickname }}
          <button @click="replyTo = null"><ArrowLeft :size="12" :stroke-width="3" style="transform: rotate(45deg)" /></button>
        </div>
        <div class="row">
          <input
            ref="inputRef"
            v-model="draft"
            type="text"
            :placeholder="replyTo ? `回复 ${replyTo.nickname}…` : '友善评论,贡献值会涨哦'"
            maxlength="200"
            @keyup.enter="submitComment"
          />
          <button class="send" @click="submitComment"><Send :size="17" :stroke-width="2.4" /></button>
        </div>
      </div>
    </template>

    <div v-else class="missing ik-card">这条动态不存在或已被删除</div>
  </div>
</template>

<style scoped lang="scss">
.pd {
  padding-top: 0;
  padding-bottom: 130px;
}

.main {
  margin-top: 10px;
  padding: 14px;

  .head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .who {
    display: flex;
    flex-direction: column;
    gap: 4px;

    b {
      font-size: 15px;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--text-2);
    }
  }

  .title-chip {
    padding: 1px 8px;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
  }

  .content {
    margin-top: 12px;
    font-size: 15px;
    line-height: 1.7;
    word-break: break-word;
  }

  .imgs {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 12px;

    &.multi {
      grid-template-columns: repeat(3, 1fr);
    }

    .img {
      aspect-ratio: 1;
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
  }

  .acts {
    display: flex;
    gap: 18px;
    margin-top: 12px;
    border-top: 1.5px solid var(--line-soft);
    padding-top: 10px;

    .act {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-2);
      background: none;
      border: none;
      cursor: pointer;

      &.on {
        color: var(--red);
      }
    }

    .act.fav,
    .act:nth-child(2) {
      color: var(--yellow-deep);
    }

    .act.on {
      color: var(--red);
    }

    .act.fav.on,
    .act:nth-child(2).on {
      color: var(--yellow-deep);
    }
  }
}

.c-sec {
  margin-top: 16px;

  .c-title {
    display: block;
    font-size: 15px;
    margin-bottom: 12px;
  }

  .c-empty {
    padding: 24px;
    text-align: center;
    font-size: 12px;
    color: var(--gray);
    background: var(--card);
    border: 2px dashed #e5e1d5;
    border-radius: 14px;
  }
}

.comment {
  display: flex;
  gap: 10px;
  padding: 12px;
  margin-bottom: 10px;
  background: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: 14px;
}

.c-body {
  flex: 1;
  min-width: 0;
}

.c-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  b {
    font-size: 13px;
  }
}

.c-like {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  font-size: 11px;
  color: var(--text-2);
  background: none;
  border: none;
  cursor: pointer;

  &.on {
    color: var(--red);
  }
}

.c-text {
  margin-top: 5px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.c-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  font-size: 10px;
  color: var(--gray);

  button {
    padding: 0;
    font-size: 10px;
    font-weight: 700;
    color: var(--text-2);
    background: none;
    border: none;
    cursor: pointer;
  }
}

.replies {
  margin-top: 8px;
  padding: 8px 10px;
  background: var(--bg);
  border-radius: 10px;

  .reply {
    padding: 4px 0;

    b {
      font-size: 12px;
    }

    .arrow {
      font-size: 11px;
      color: var(--gray);
    }

    p {
      margin-top: 3px;
      font-size: 12px;
      line-height: 1.6;
    }
  }
}

.input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: var(--bg);
  border-top: 1px solid var(--line);

  @media (min-width: 1200px) {
    left: 96px;
  }

  .replying {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--yellow-deep);

    button {
      display: flex;
      align-items: center;
      padding: 0 4px;
      color: var(--gray);
      background: none;
      border: none;
      cursor: pointer;
    }
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;

    input {
      flex: 1;
      min-width: 0;
      padding: 10px 14px;
      font-size: 14px;
      color: var(--text);
      background: var(--card);
      border: 1px solid var(--line-strong);
      border-radius: 999px;
      outline: none;
    }

    .send {
      flex-shrink: 0;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ink);
      background: var(--yellow);
      border: 1px solid var(--line-strong);
      border-radius: 50%;
      box-shadow: var(--shadow-sm);
      cursor: pointer;

      &:active {
        transform: translate(2px, 2px);
        box-shadow: var(--shadow-sm);
      }
    }
  }
}

.missing {
  margin-top: 20px;
  padding: 30px;
  text-align: center;
  font-size: 13px;
  color: var(--text-2);
}
</style>
