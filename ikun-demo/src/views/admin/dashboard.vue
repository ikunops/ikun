<script setup>
// 管理后台·仪表盘:核心数据 + 用户等级分布 + 审批待办 + 操作日志
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Ban, ShieldCheck, ClipboardCheck, ChevronRight } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import { usePostsStore } from '@/stores/posts'
import { formatTime } from '@/stores/posts'
import { useUserStore } from '@/stores/user'
import { can, ROLE_LABEL } from '@/stores/admin'

const router = useRouter()
const admin = useAdminStore()
const posts = usePostsStore()
const user = useUserStore()

onMounted(() => admin.restore())

const role = computed(() => user.roleType || 'user')

const DIST = [
  { title: '外门弟子', color: '#b9b5c4', match: (u) => u.level === 1 },
  { title: '内门弟子', color: '#4da3ff', match: (u) => u.level === 2 },
  { title: '核心弟子', color: '#7c5cff', match: (u) => u.level === 3 },
  { title: '亲传弟子', color: '#ffb800', match: (u) => u.level === 4 },
  { title: '长老阶', color: '#ff5a5f', match: (u) => u.level === 5 },
]

const dist = computed(() =>
  DIST.map((d) => ({ ...d, count: admin.users.filter(d.match).length }))
)

const CARDS = computed(() => [
  { key: 'total', icon: Users, label: '注册用户', value: admin.stats.total, tone: '#4da3ff' },
  { key: 'admins', icon: ShieldCheck, label: '管理员', value: admin.stats.admins, tone: '#7c5cff' },
  { key: 'banned', icon: Ban, label: '封禁中', value: admin.stats.banned, tone: '#ff5a5f' },
  { key: 'pending', icon: ClipboardCheck, label: '待审批', value: admin.stats.pending, tone: '#ffb800' },
])
</script>

<template>
  <div class="dash">
    <header class="page-head">
      <div>
        <h1>仪表盘</h1>
        <p>{{ ROLE_LABEL[role] }}视角 · {{ posts.list.length }} 条动态 · {{ admin.approvals.length }} 条审批记录</p>
      </div>
    </header>

    <div class="cards">
      <div v-for="c in CARDS" :key="c.key" class="card">
        <span class="card-icon" :style="{ color: c.tone }"><component :is="c.icon" :size="20" :stroke-width="2.2" /></span>
        <div>
          <b>{{ c.value }}</b>
          <span>{{ c.label }}</span>
        </div>
      </div>
    </div>

    <div class="grid">
      <section class="panel">
        <b class="panel-title">用户等级分布</b>
        <div v-for="d in dist" :key="d.title" class="dist-row">
          <span class="dist-label">{{ d.title }}</span>
          <div class="dist-bar">
            <div
              class="dist-fill"
              :style="{
                width: (d.count / Math.max(1, admin.stats.total)) * 100 + '%',
                background: d.color,
              }"
            ></div>
          </div>
          <span class="dist-num">{{ d.count }}</span>
        </div>
      </section>

      <section v-if="can(role, 'approve')" class="panel">
        <b class="panel-title">待办审批</b>
        <div v-if="!admin.approvals.length" class="empty">暂无审批</div>
        <div v-for="a in admin.approvals.slice(0, 5)" :key="a.id" class="approval">
          <div class="approval-text">
            <b>{{ a.status === 'pending' ? '删除热帖申请' : a.status === 'approved' ? '已批准删除' : '已驳回' }}</b>
            <p>「{{ a.postText }}…」 · {{ a.by }}</p>
          </div>
          <div v-if="a.status === 'pending'" class="approval-acts">
            <button class="ok" @click="admin.resolveApproval(a.id, true)">批准</button>
            <button class="no" @click="admin.resolveApproval(a.id, false)">驳回</button>
          </div>
        </div>
      </section>

      <section class="panel">
        <b class="panel-title">操作日志</b>
        <div v-if="!admin.logs.length" class="empty">暂无操作记录</div>
        <div v-for="l in admin.logs.slice(0, 8)" :key="l.id" class="log-row">
          <ChevronRight :size="13" :stroke-width="2.4" />
          <span class="log-text">{{ l.text }}</span>
          <span class="log-time">{{ formatTime(l) }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dash {
  display: grid;
  gap: 18px;
}

.page-head {
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

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: var(--bg);
    border-radius: 12px;
  }

  b {
    display: block;
    font-size: 24px;
    font-weight: 900;
    line-height: 1.1;
  }

  span {
    font-size: 12px;
    color: var(--text-2);
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;
}

.panel {
  padding: 16px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);

  .panel-title {
    display: block;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 800;
  }
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;

  .dist-label {
    width: 62px;
    flex-shrink: 0;
    font-size: 12px;
    color: var(--text-2);
  }

  .dist-bar {
    flex: 1;
    height: 8px;
    background: var(--bg);
    border-radius: 999px;
    overflow: hidden;

    .dist-fill {
      height: 100%;
      border-radius: 999px;
      min-width: 6px;
    }
  }

  .dist-num {
    width: 24px;
    text-align: right;
    font-size: 13px;
    font-weight: 800;
  }
}

.empty {
  padding: 18px;
  font-size: 12px;
  color: var(--gray);
  text-align: center;
  background: var(--bg);
  border-radius: 10px;
}

.approval {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);

  &:last-child {
    border-bottom: none;
  }

  .approval-text {
    flex: 1;
    min-width: 0;

    b {
      font-size: 13px;
    }

    p {
      margin-top: 2px;
      font-size: 11px;
      color: var(--text-2);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .approval-acts {
    display: flex;
    gap: 6px;

    button {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      border: none;
      border-radius: 8px;
      cursor: pointer;

      &.ok {
        color: #fff;
        background: var(--green);
      }

      &.no {
        color: var(--text-2);
        background: var(--bg);
      }
    }
  }
}

.log-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  font-size: 12px;
  border-bottom: 1px solid var(--line);

  &:last-child {
    border-bottom: none;
  }

  svg {
    flex-shrink: 0;
    color: var(--gray);
  }

  .log-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .log-time {
    flex-shrink: 0;
    font-size: 10px;
    color: var(--gray);
  }
}
</style>
