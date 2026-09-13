<script setup>
// 内容管理:帖子列表/搜索/加精/删除(热帖>100赞删除需走大长老审批流,流程3)
import { computed, onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { Search, Star, Trash2, ClipboardCheck } from 'lucide-vue-next'
import AvatarWithBorder from '@/components/AvatarWithBorder.vue'
import { useAdminStore, can, HOT_POST_LIKES } from '@/stores/admin'
import { usePostsStore, commentCount, formatTime } from '@/stores/posts'
import { useUserStore } from '@/stores/user'

const admin = useAdminStore()
const posts = usePostsStore()
const user = useUserStore()
const q = ref('')

onMounted(() => {
  admin.restore()
  posts.restore()
})

const role = computed(() => user.roleType || 'user')
const actorName = computed(() => ROLE_NAME[role.value] || '管理员')
const ROLE_NAME = { grand_elder: '大长老', core_elder: '核心长老', reviewer: '内容审核员' }

const list = computed(() =>
  posts.list.filter((p) => !q.value || p.content.includes(q.value) || p.author.nickname.includes(q.value))
)

function feature(p) {
  p.featured = !p.featured
  posts.persist()
  admin.log(`${actorName.value}${p.featured ? '加精' : '取消加精'}了帖子「${p.content.slice(0, 14)}…」`)
  showToast(p.featured ? '已加精' : '已取消加精')
}

function remove(p) {
  if (p.likes >= HOT_POST_LIKES && !can(role.value, 'approve')) {
    // 热帖 + 非大长老 → 提交审批(流程3)
    admin.requestDelete(p.id, p.content, actorName.value)
    showToast(`热帖(${p.likes}赞)删除需大长老审批,已提交`)
    return
  }
  posts.list = posts.list.filter((x) => x.id !== p.id)
  posts.persist()
  admin.log(`${actorName.value}删除了帖子「${p.content.slice(0, 14)}…」`)
  showToast('已删除')
}
</script>

<template>
  <div class="cm">
    <header class="page-head">
      <div>
        <h1>内容管理</h1>
        <p>{{ posts.list.length }} 条动态 · 热帖(≥{{ HOT_POST_LIKES }}赞)删除需大长老审批</p>
      </div>
      <div class="search">
        <Search :size="15" :stroke-width="2.4" />
        <input v-model="q" type="text" placeholder="搜内容 / 作者" />
      </div>
    </header>

    <div class="list">
      <div v-for="p in list" :key="p.id" class="row">
        <AvatarWithBorder
          :avatar-code="p.author.avatarCode"
          :avatar-type="p.author.avatarType || 'default'"
          :border-id="''"
          :size="40"
          :show-badge="false"
        />
        <div class="row-main">
          <div class="row-head">
            <b>{{ p.author.nickname }}</b>
            <span class="time">{{ formatTime(p) }}</span>
          </div>
          <p class="content">{{ p.content }}</p>
          <div class="meta">
            <span>{{ p.likes }} 赞</span>
            <span>{{ commentCount(p) }} 评论</span>
            <span v-if="p.featured" class="featured-tag"><Star :size="11" :stroke-width="2.6" /> 加精</span>
          </div>
        </div>
        <div class="acts">
          <button class="act" :class="{ on: p.featured }" @click="feature(p)">
            <Star :size="14" :stroke-width="2.4" /> {{ p.featured ? '取消加精' : '加精' }}
          </button>
          <button class="act danger" @click="remove(p)">
            <Trash2 :size="14" :stroke-width="2.4" /> 删除
          </button>
        </div>
      </div>
      <div v-if="!list.length" class="empty">没有匹配的动态</div>
    </div>

    <div v-if="can(role, 'approve') && admin.approvals.some((a) => a.status === 'pending')" class="notice">
      <ClipboardCheck :size="16" :stroke-width="2.4" />
      有 {{ admin.approvals.filter((a) => a.status === 'pending').length }} 条删帖申请待你审批,去仪表盘处理
    </div>
  </div>
</template>

<style scoped lang="scss">
.cm {
  display: grid;
  gap: 16px;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;

  h1 {
    font-size: 22px;
    font-weight: 900;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-2);
  }
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  background: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  color: var(--text-2);

  input {
    width: 180px;
    border: none;
    outline: none;
    background: transparent;
    font-size: 13px;
    color: var(--text);
  }
}

.list {
  display: grid;
  gap: 10px;
}

.row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
}

.row-main {
  flex: 1;
  min-width: 0;

  .row-head {
    display: flex;
    align-items: center;
    gap: 8px;

    b {
      font-size: 13px;
    }

    .time {
      font-size: 10px;
      color: var(--gray);
    }
  }

  .content {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    display: flex;
    gap: 12px;
    margin-top: 6px;
    font-size: 11px;
    color: var(--gray);
  }
}

.featured-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--yellow-deep);
  font-weight: 700;
}

.acts {
  display: flex;
  gap: 6px;
  flex-shrink: 0;

  .act {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-2);
    background: var(--bg);
    border: none;
    border-radius: 9px;
    cursor: pointer;

    &.on {
      color: #9c6b00;
      background: rgba(255, 184, 0, 0.15);
    }

    &.danger {
      color: var(--red);
      background: rgba(255, 90, 95, 0.08);
    }
  }
}

.empty {
  padding: 30px;
  text-align: center;
  font-size: 12px;
  color: var(--gray);
  background: var(--card);
  border: 1px dashed var(--line-strong);
  border-radius: 14px;
}

.notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #9c6b00;
  background: rgba(255, 184, 0, 0.12);
  border-radius: 12px;
}
</style>
