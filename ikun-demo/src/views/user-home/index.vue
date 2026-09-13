<script setup>
// 用户主页:/u/:nickname —— 自己=「我的」(含可见性管理),他人=只看公开内容
// tabs:动态 / 评论 / 收藏 / 活动
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PenLine,
  MessageSquare,
  Bookmark,
  Flag,
  Settings,
  ShieldCheck,
  Globe,
  UsersRound,
  Lock,
} from 'lucide-vue-next'
import AvatarWithBorder from '@/components/AvatarWithBorder.vue'
import IkonBadge from '@/components/IkonBadge.vue'
import PostCard from '@/components/PostCard.vue'
import { formatTime, commentCount, usePostsStore } from '@/stores/posts'
import { useUserStore } from '@/stores/user'
import { useAdminStore } from '@/stores/admin'
import { userLevel } from '@/mock/levels'

const route = useRoute()
const router = useRouter()
const posts = usePostsStore()
const user = useUserStore()
const admin = useAdminStore()

posts.restore()
admin.restore()

const nick = computed(() => decodeURIComponent(route.params.name))
const isSelf = computed(() => nick.value === user.nickname)
const rec = computed(() => admin.byNickname(nick.value)) // 未入驻用户(纯快照)为 null
const lvl = computed(() => userLevel(rec.value))

// 头部信息:入驻用户取表记录;游民取最近一条帖子快照
const ghost = computed(() => {
  if (rec.value) return null
  const authored = posts.byAuthor(nick.value)
  return authored.length ? authored[0].author : null
})

const VIS = {
  public: { label: '公开', icon: Globe },
  friends: { label: '好友', icon: UsersRound },
  private: { label: '私密', icon: Lock },
}

const tab = ref('posts')
const TABS = [
  { key: 'posts', label: '动态', icon: PenLine },
  { key: 'comments', label: '评论', icon: MessageSquare },
  { key: 'fav', label: '收藏', icon: Bookmark },
  { key: 'acts', label: '活动', icon: Flag },
]

// 动态:自己全部;他人仅公开
const myPosts = computed(() =>
  posts.byAuthor(nick.value).filter((p) => isSelf.value || (p.visibility || 'public') === 'public')
)
const myComments = computed(() => posts.commentsBy(nick.value, isSelf.value))
const myFavs = computed(() => posts.byAuthor(nick.value).filter((p) => p.fav && (isSelf.value || p.visibility === 'public')))
const joinedActs = computed(() => {
  if (!rec.value) return []
  return admin.activities.filter((a) => rec.value.participations.includes(a.id))
})

function cycleVis(p) {
  posts.cycleVisibility(p.id)
}
</script>

<template>
  <div class="page uh">
    <van-nav-bar
      :title="isSelf ? '我的主页' : `${nick} 的主页`"
      :left-arrow="!isSelf"
      @click-left="router.back()"
    />

    <!-- 身份卡 -->
    <div
      class="head"
      :style="{ background: `linear-gradient(150deg, ${lvl.color}26, ${lvl.color}59)` }"
    >
      <div class="head-row">
        <AvatarWithBorder
          :avatar-code="rec?.avatarCode || ghost?.avatarCode || 'A01'"
          :avatar-type="rec?.avatarType || 'default'"
          :custom-avatar="rec?.customAvatar || ''"
          :border-id="rec ? userLevel(rec).borderId || 'b-gray' : 'b-gray'"
          :size="72"
        />
        <div class="head-info">
          <b class="nick">{{ nick }}</b>
          <span v-if="rec" class="no mono">{{ rec.idNumber }}</span>
          <span v-else class="no">未入驻 · 内容快照</span>
          <div class="chips">
            <span class="ik-chip" :style="{ background: lvl.color, color: '#fff' }">{{ rec ? lvl.title : '游客' }}</span>
            <span v-if="rec" class="ik-chip">Lv.{{ lvl.subLevel || lvl.level }}</span>
          </div>
        </div>
        <IkonBadge v-if="rec" :lit="lvl.letters" :size="20" :color="lvl.color" />
      </div>
      <div class="head-foot">
        <span>动态 {{ myPosts.length }} · 评论 {{ myComments.length }} · 收藏 {{ myFavs.length }}</span>
        <span v-if="rec">入教 {{ rec.joinedAt }}</span>
      </div>
    </div>

    <!-- tabs -->
    <div class="tabs">
      <button
        v-for="t in TABS"
        :key="t.key"
        class="tab"
        :class="{ active: tab === t.key }"
        @click="tab = t.key"
      >
        <component :is="t.icon" :size="15" :stroke-width="2.4" />
        {{ t.label }}
        <i v-if="t.key === 'posts'" class="n">{{ myPosts.length }}</i>
        <i v-else-if="t.key === 'comments'" class="n">{{ myComments.length }}</i>
        <i v-else-if="t.key === 'fav'" class="n">{{ myFavs.length }}</i>
        <i v-else class="n">{{ joinedActs.length }}</i>
      </button>
    </div>

    <!-- 动态 -->
    <template v-if="tab === 'posts'">
      <div v-if="myPosts.length" class="feed">
        <PostCard v-for="p in myPosts" :key="p.id" :post="p" @open="router.push('/post-detail/' + p.id)">
          <template #foot-extra>
            <button
              v-if="isSelf"
              class="vis-chip"
              :title="'可见性:' + VIS[p.visibility || 'public'].label + '(点击切换)'"
              @click.stop="cycleVis(p)"
            >
              <component :is="VIS[p.visibility || 'public'].icon" :size="12" :stroke-width="2.6" />
              {{ VIS[p.visibility || 'public'].label }}
            </button>
            <span v-else-if="(p.visibility || 'public') !== 'public'" class="vis-chip static">
              <component :is="VIS[p.visibility || 'public'].icon" :size="12" :stroke-width="2.6" />
              {{ VIS[p.visibility || 'public'].label }}
            </span>
          </template>
        </PostCard>
      </div>
      <div v-else class="empty ik-card">
        <PenLine :size="26" :stroke-width="2" />
        <p>{{ isSelf ? '还没发过动态' : 'TA 还没有公开的动态' }}</p>
        <button v-if="isSelf" class="ik-btn" @click="router.push('/post-create')">去发帖</button>
      </div>
    </template>

    <!-- 评论 -->
    <template v-else-if="tab === 'comments'">
      <div v-if="myComments.length" class="cmts">
        <div
          v-for="c in myComments"
          :key="c.id"
          class="cmt ik-card"
          @click="router.push('/post-detail/' + c.post.id)"
        >
          <p class="cmt-text">{{ c.text }}</p>
          <p class="cmt-src">
            <MessageSquare :size="12" :stroke-width="2.4" />
            在「{{ c.post.content.slice(0, 16) }}…」下 · {{ formatTime({ ts: c.ts }) }}
          </p>
        </div>
      </div>
      <div v-else class="empty ik-card">
        <MessageSquare :size="26" :stroke-width="2" />
        <p>{{ isSelf ? '还没发表过评论' : 'TA 还没有公开的评论' }}</p>
      </div>
    </template>

    <!-- 收藏 -->
    <template v-else-if="tab === 'fav'">
      <div v-if="myFavs.length" class="feed">
        <PostCard v-for="p in myFavs" :key="p.id" :post="p" @open="router.push('/post-detail/' + p.id)" />
      </div>
      <div v-else class="empty ik-card">
        <Bookmark :size="26" :stroke-width="2" />
        <p>{{ isSelf ? '收藏的动态会出现在这里' : 'TA 没有公开的收藏' }}</p>
      </div>
    </template>

    <!-- 活动 -->
    <template v-else>
      <div v-if="joinedActs.length" class="acts">
        <div v-for="a in joinedActs" :key="a.id" class="act ik-card">
          <div class="act-top">
            <b>{{ a.title }}</b>
            <span class="ik-chip">{{ a.status }}</span>
          </div>
          <p class="act-desc">{{ a.desc }}</p>
          <span class="act-reward">{{ a.reward }}</span>
        </div>
      </div>
      <div v-else class="empty ik-card">
        <Flag :size="26" :stroke-width="2" />
        <p>{{ isSelf ? '去打卡页参与活动,记录会出现在这里' : 'TA 还没参与过活动' }}</p>
      </div>
    </template>

    <!-- 自己主页:右下角设置按钮 -->
    <button v-if="isSelf" class="fab" @click="router.push('/settings')">
      <Settings :size="22" :stroke-width="2.4" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.uh {
  padding-top: 0;
}

.head {
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow-sm);
  padding: 18px 16px;
  margin-top: 12px;

  .head-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .nick {
    display: block;
    font-size: 20px;
    font-weight: 900;
  }

  .no {
    display: block;
    margin-top: 3px;
    font-size: 12px;
    color: var(--text-2);
  }

  .chips {
    display: flex;
    gap: 6px;
    margin-top: 7px;
    flex-wrap: wrap;
  }

  .head-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
    font-size: 11px;
    color: var(--text-2);
  }
}

.tabs {
  display: flex;
  gap: 8px;
  margin: 14px 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-2);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
  flex-shrink: 0;

  .n {
    font-style: normal;
    font-size: 11px;
    opacity: 0.7;
  }

  &.active {
    color: #221a05;
    background: var(--brand-grad);
    border-color: transparent;
    box-shadow: 0 3px 10px rgba(255, 176, 31, 0.35);
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
    text-align: center;
  }

  .ik-btn {
    padding: 9px 20px;
    font-size: 13px;
  }
}

.cmts {
  display: grid;
  gap: 10px;
}

.cmt {
  padding: 12px 14px;
  cursor: pointer;

  .cmt-text {
    font-size: 13px;
    line-height: 1.6;
  }

  .cmt-src {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
    font-size: 11px;
    color: var(--gray);
  }
}

.acts {
  display: grid;
  gap: 10px;
}

.act {
  padding: 14px;

  .act-top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    b {
      font-size: 14px;
    }
  }

  .act-desc {
    margin-top: 5px;
    font-size: 12px;
    color: var(--text-2);
  }

  .act-reward {
    display: inline-block;
    margin-top: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--yellow-deep);
  }
}

.vis-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 3px 9px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-2);
  background: var(--bg);
  border: none;
  border-radius: 999px;
  cursor: pointer;

  &.static {
    cursor: default;
  }
}

:deep(.pc-foot) {
  .vis-chip {
    margin-left: auto;
    margin-right: 0;
  }
}

// 设置按钮:右下角浮动
.fab {
  position: fixed;
  z-index: 5;
  right: 20px;
  bottom: calc(96px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  color: var(--ink);
  background: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  box-shadow: var(--shadow-md);
  cursor: pointer;

  &:active {
    transform: scale(0.97);
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
