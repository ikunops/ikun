<script setup>
// 留言板:公开留言墙,选择对象留言(设计文档·七:给用户主页留言,公开)
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { MessagesSquare, Send } from 'lucide-vue-next'
import AvatarWithBorder from '@/components/AvatarWithBorder.vue'
import { formatTime, usePostsStore } from '@/stores/posts'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const store = usePostsStore()
const user = useUserStore()

const TARGETS = ['大长老', '宗主', '核心长老团', '全体 ikun']
const to = ref(TARGETS[0])
const text = ref('')
const mineOnly = computed(() => route.query.mine === '1')

const list = computed(() =>
  mineOnly.value ? store.guestbook.filter((g) => g.to === user.nickname) : store.guestbook
)

function submit() {
  const t = text.value.trim()
  if (!t) {
    showToast('写点什么吧')
    return
  }
  store.addGuestbook(to.value, t)
  text.value = ''
  showToast('留言已公开')
}
</script>

<template>
  <div class="page gb">
    <van-nav-bar
      :title="mineOnly ? '我的留言板' : '留言板'"
      left-arrow
      @click-left="router.back()"
    />

    <p class="lead">
      {{ mineOnly ? '大家给你的公开留言都会出现在这里' : '公开留言墙:给大长老递话、给宗主请安,或给全体 ikun 喊话' }}
    </p>

    <!-- 发布 -->
    <div class="composer ik-card">
      <div class="targets">
        <button
          v-for="t in TARGETS"
          :key="t"
          class="target"
          :class="{ active: to === t }"
          @click="to = t"
        >
          {{ t }}
        </button>
      </div>
      <div class="row">
        <input v-model="text" type="text" maxlength="100" placeholder="友善留言,天下 ikun 是一家" @keyup.enter="submit" />
        <button class="send" @click="submit"><Send :size="17" :stroke-width="2.4" /></button>
      </div>
    </div>

    <!-- 留言列表 -->
    <div v-if="list.length" class="list">
      <div v-for="g in list" :key="g.id" class="gb-item ik-card">
        <AvatarWithBorder :avatar-code="g.from.avatarCode" :size="38" border-id="b-gray" />
        <div class="gb-body">
          <div class="gb-head">
            <b>{{ g.from.nickname }}</b>
            <span class="to">给「{{ g.to }}」</span>
            <span class="time">{{ formatTime(g) }}</span>
          </div>
          <p class="gb-text">{{ g.text }}</p>
        </div>
      </div>
    </div>
    <div v-else class="empty ik-card">
      <MessagesSquare :size="26" :stroke-width="2" />
      <p>{{ mineOnly ? '还没有人给你留言,去社区活跃一下吧' : '还没有留言,来写第一条' }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.gb {
  padding-top: 0;
}

.lead {
  padding: 10px 2px 12px;
  font-size: 12px;
  color: var(--text-2);
}

.composer {
  padding: 12px;
  margin-bottom: 14px;

  .targets {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .target {
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-2);
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 999px;
    cursor: pointer;

    &.active {
      color: var(--ink);
      background: var(--yellow);
      border-color: rgba(255, 176, 31, 0.6);
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
      background: var(--bg);
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

.list {
  display: grid;
  gap: 10px;
}

.gb-item {
  display: flex;
  gap: 10px;
  padding: 12px;
}

.gb-body {
  flex: 1;
  min-width: 0;
}

.gb-head {
  display: flex;
  align-items: center;
  gap: 8px;

  b {
    font-size: 13px;
  }

  .to {
    padding: 1px 8px;
    font-size: 10px;
    font-weight: 700;
    color: var(--purple);
    background: #f3e8ff;
    border: 1px solid rgba(124, 92, 255, 0.45);
    border-radius: 999px;
  }

  .time {
    margin-left: auto;
    font-size: 10px;
    color: var(--gray);
  }
}

.gb-text {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.empty {
  padding: 34px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--gray);

  p {
    font-size: 12px;
  }
}
</style>
