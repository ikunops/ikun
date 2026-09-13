<script setup>
// 身份证管理:编号总表(保留号规则 + 发放进度)
import { computed, onMounted } from 'vue'
import { CreditCard, Hash, Users } from 'lucide-vue-next'
import AvatarWithBorder from '@/components/AvatarWithBorder.vue'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()

onMounted(() => admin.restore())

const RULES = [
  { label: '编号格式', value: 'IKUN- + 6 位数字' },
  { label: '宗主', value: 'IKUN-000000(保留,不展示)' },
  { label: '大长老', value: 'IKUN-000001(保留)' },
  { label: '普通用户', value: '从 IKUN-000002 起自增' },
]

const issued = computed(() => admin.users.length)
</script>

<template>
  <div class="im">
    <header class="page-head">
      <div>
        <h1>身份证管理</h1>
        <p>编号规则与发放总表</p>
      </div>
    </header>

    <div class="cards">
      <div class="card">
        <CreditCard :size="20" :stroke-width="2.2" />
        <div>
          <b>{{ issued }}</b>
          <span>已发放</span>
        </div>
      </div>
      <div class="card">
        <Hash :size="20" :stroke-width="2.2" />
        <div>
          <b>IKUN-00000{{ issued }}</b>
          <span>下一个可用号</span>
        </div>
      </div>
      <div class="card">
        <Users :size="20" :stroke-width="2.2" />
        <div>
          <b>2</b>
          <span>保留号</span>
        </div>
      </div>
    </div>

    <section class="panel">
      <b class="panel-title">编号规则</b>
      <div v-for="r in RULES" :key="r.label" class="rule-row">
        <span class="rule-label">{{ r.label }}</span>
        <span class="rule-value mono">{{ r.value }}</span>
      </div>
    </section>

    <section class="panel">
      <b class="panel-title">发放总表</b>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>证件</th>
              <th>持有人</th>
              <th>编号</th>
              <th>称号</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in admin.users" :key="u.id">
              <td><AvatarWithBorder :avatar-code="u.avatarCode" :size="32" :show-badge="false" /></td>
              <td><b class="nick">{{ u.nickname }}</b></td>
              <td class="mono">{{ u.idNumber }}</td>
              <td>{{ u.title }}</td>
              <td>
                <span class="state" :class="{ reserved: u.reserved, banned: u.banned }">
                  {{ u.banned ? '已封禁' : u.reserved ? '保留' : '正常' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.im {
  display: grid;
  gap: 16px;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  .card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 14px;
    box-shadow: var(--shadow-sm);
    color: var(--yellow-deep);

    b {
      display: block;
      font-size: 18px;
      font-weight: 900;
      color: var(--text);
    }

    span {
      font-size: 11px;
      color: var(--text-2);
    }
  }
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

.rule-row {
  display: flex;
  gap: 14px;
  padding: 7px 0;
  border-bottom: 1px solid var(--line);
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }

  .rule-label {
    width: 70px;
    flex-shrink: 0;
    color: var(--text-2);
  }
}

.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;

  th {
    padding: 9px 12px;
    text-align: left;
    font-size: 11px;
    color: var(--text-2);
    border-bottom: 1px solid var(--line);
    white-space: nowrap;
  }

  td {
    padding: 9px 12px;
    font-size: 13px;
    border-bottom: 1px solid var(--line);
  }

  tr:last-child td {
    border-bottom: none;
  }

  .nick {
    font-size: 13px;
  }
}

.state {
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 700;
  color: var(--green);
  background: rgba(53, 196, 141, 0.1);
  border-radius: 999px;

  &.reserved {
    color: #9c6b00;
    background: rgba(255, 184, 0, 0.15);
  }

  &.banned {
    color: var(--red);
    background: rgba(255, 90, 95, 0.1);
  }
}
</style>
