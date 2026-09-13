<script setup>
// 用户管理:列表/搜索/角色任命/封禁(权限矩阵:任命与管理员仅大长老)
import { computed, onMounted, ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { Search, Crown, Ban as BanIcon, RotateCcw } from 'lucide-vue-next'
import AvatarWithBorder from '@/components/AvatarWithBorder.vue'
import { useAdminStore, ROLE_LABEL, can } from '@/stores/admin'
import { useUserStore } from '@/stores/user'

const admin = useAdminStore()
const user = useUserStore()
const q = ref('')

onMounted(() => admin.restore())

const role = computed(() => user.roleType || 'user')
const list = computed(() =>
  admin.users.filter((u) => !q.value || u.nickname.includes(q.value) || u.idNumber.includes(q.value))
)

async function appoint(u) {
  try {
    await showConfirmDialog({
      title: '任命核心长老',
      message: `将「${u.nickname}」任命为核心长老?需 Lv5 条件(打卡≥50·贡献≥50·加精≥2)`,
      confirmButtonText: '任命',
    })
  } catch (e) {
    return
  }
  admin.setRole(u.id, 'core_elder')
  showToast('已任命为核心长老')
}

async function unappoint(u) {
  await admin.setRole(u.id, 'user')
  showToast('已撤任为普通用户')
}

async function banToggle(u) {
  const toBan = !u.banned
  try {
    await showConfirmDialog({
      title: toBan ? '封禁用户' : '解除封禁',
      message: `确定${toBan ? '封禁' : '解封'}「${u.nickname}」?`,
      confirmButtonText: '确定',
    })
  } catch (e) {
    return
  }
  admin.toggleBan(u.id)
}
</script>

<template>
  <div class="um">
    <header class="page-head">
      <div>
        <h1>用户管理</h1>
        <p>共 {{ admin.users.length }} 位 ikun · 保留号(宗主/大长老)不可操作</p>
      </div>
      <div class="search">
        <Search :size="15" :stroke-width="2.4" />
        <input v-model="q" type="text" placeholder="搜昵称 / 编号" />
      </div>
    </header>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>用户</th>
            <th>编号</th>
            <th>等级</th>
            <th>数据(打卡/贡献/加精)</th>
            <th>角色</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in list" :key="u.id" :class="{ banned: u.banned, reserved: u.reserved }">
            <td>
              <div class="u-cell">
                <AvatarWithBorder :avatar-code="u.avatarCode" :size="36" :show-badge="false" />
                <div>
                  <b>{{ u.nickname }}</b>
                  <span v-if="u.banned" class="banned-tag">已封禁</span>
                </div>
              </div>
            </td>
            <td class="mono">{{ u.idNumber }}</td>
            <td><span class="lvl-chip">{{ u.title }} Lv.{{ u.level }}<i v-if="u.subLevel">.{{ u.subLevel }}</i></span></td>
            <td class="muted">{{ u.checkinDays }} / {{ u.contribution }} / {{ u.featured }}</td>
            <td>
              <span class="role-chip" :class="u.roleType">{{ ROLE_LABEL[u.roleType] || '用户' }}</span>
            </td>
            <td>
              <div class="acts">
                <template v-if="!u.reserved">
                  <button
                    v-if="can(role, 'appoint') && u.roleType === 'user' && u.level >= 4"
                    class="act primary"
                    @click="appoint(u)"
                  >
                    <Crown :size="13" :stroke-width="2.4" /> 任命
                  </button>
                  <button v-if="can(role, 'manage_admins') && u.roleType === 'core_elder'" class="act" @click="unappoint(u)">
                    撤任
                  </button>
                  <button v-if="can(role, 'ban')" class="act" :class="{ danger: !u.banned }" @click="banToggle(u)">
                    <component :is="u.banned ? RotateCcw : BanIcon" :size="13" :stroke-width="2.4" />
                    {{ u.banned ? '解封' : '封禁' }}
                  </button>
                </template>
                <span v-else class="muted">保留号</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.um {
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

.table-wrap {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 780px;

  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-2);
    border-bottom: 1px solid var(--line);
    background: var(--bg);
    white-space: nowrap;
  }

  td {
    padding: 12px 16px;
    font-size: 13px;
    border-bottom: 1px solid var(--line);
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr.banned td {
    opacity: 0.55;
  }

  tr.reserved td {
    background: rgba(255, 176, 31, 0.05);
  }
}

.u-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  b {
    display: block;
    font-size: 13px;
  }
}

.banned-tag {
  display: inline-block;
  margin-top: 2px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--red);
  background: rgba(255, 90, 95, 0.1);
  border-radius: 999px;
}

.lvl-chip {
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-2);
  background: var(--bg);
  border-radius: 999px;

  i {
    font-style: normal;
    font-size: 10px;
  }
}

.muted {
  color: var(--gray);
  font-size: 12px;
}

.role-chip {
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-2);
  background: var(--bg);
  border-radius: 999px;

  &.core_elder {
    color: #5b3df5;
    background: rgba(124, 92, 255, 0.12);
  }

  &.grand_elder {
    color: #9c6b00;
    background: rgba(255, 184, 0, 0.15);
  }

  &.sect_master {
    color: var(--text);
    background: rgba(29, 27, 40, 0.08);
  }
}

.acts {
  display: flex;
  gap: 6px;

  .act {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 11px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-2);
    background: var(--bg);
    border: none;
    border-radius: 9px;
    cursor: pointer;

    &.primary {
      color: #7a4d00;
      background: var(--brand-grad);
    }

    &.danger {
      color: var(--red);
      background: rgba(255, 90, 95, 0.08);
    }

    &:hover {
      filter: brightness(0.97);
    }
  }
}
</style>
