<script setup>
// 用户管理:列表/搜索/详情抽屉(资料编辑/等级配置/角色/密码重置/封禁/删号/任命)
import { computed, onMounted, ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { Search, Crown, Ban as BanIcon, RotateCcw, Pencil, Trash2, Undo2 } from 'lucide-vue-next'
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

// —— 详情抽屉 ——
const drawer = ref(false)
const cur = ref(null) // 当前管理的用户记录引用
const form = ref({ nickname: '', phone: '', email: '' })
const newLevel = ref(0)
const newRole = ref('user')
const newPassword = ref('')

const LEVEL_OPTS = [
  { v: 0, t: '预备弟子' },
  { v: 1, t: '外门弟子' },
  { v: 2, t: '内门弟子' },
  { v: 3, t: '核心弟子' },
  { v: 4, t: '亲传弟子' },
]

const ROLE_OPTS = [
  { v: 'user', t: '用户' },
  { v: 'reviewer', t: '内容审核员' },
  { v: 'operator', t: '活动运营' },
  { v: 'board_admin', t: '板块管理员' },
  { v: 'core_elder', t: '核心长老' },
]

function openDrawer(u) {
  cur.value = u
  form.value = { nickname: u.nickname, phone: u.phone || '', email: u.email || '' }
  newLevel.value = u.level
  newRole.value = ['user', 'reviewer', 'operator', 'board_admin', 'core_elder'].includes(u.roleType)
    ? u.roleType
    : 'user'
  newPassword.value = ''
  drawer.value = true
}

function saveProfile() {
  const n = form.value.nickname.trim()
  if (!n) {
    showToast('昵称不能为空')
    return
  }
  admin.updateUser(cur.value.id, {
    nickname: n,
    phone: form.value.phone.trim(),
    email: form.value.email.trim(),
  })
  showToast('资料已更新')
}

function saveLevel() {
  const opt = LEVEL_OPTS.find((o) => o.v === newLevel.value)
  admin.updateUser(cur.value.id, { level: opt.v, title: opt.t }, '等级配置')
  showToast(`等级已调整为「${opt.t}」`)
}

function saveRole() {
  if (newRole.value === 'core_elder') {
    admin.setRole(cur.value.id, 'core_elder')
    showToast('已任命为核心长老')
  } else {
    admin.updateUser(cur.value.id, { roleType: newRole.value }, '角色调整')
    showToast(`角色已调整为「${ROLE_OPTS.find((o) => o.v === newRole.value).t}」`)
  }
}

async function resetPassword() {
  if ((newPassword.value || '').length < 6) {
    showToast('新密码至少 6 位')
    return
  }
  try {
    await showConfirmDialog({
      title: '重置密码',
      message: `将「${cur.value.nickname}」的密码重置为新密码?`,
      confirmButtonText: '重置',
    })
  } catch (e) {
    return
  }
  admin.updateUser(cur.value.id, { password: newPassword.value }, '重置密码')
  newPassword.value = ''
  showToast('密码已重置')
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
  admin.setRole(u.id, 'user')
  showToast('已撤任为普通用户')
}

async function removeUser() {
  try {
    await showConfirmDialog({
      title: '删除用户',
      message: `将永久删除「${cur.value.nickname}」(${cur.value.idNumber}),其动态保留但无法登录。确定?`,
      confirmButtonText: '删除',
    })
  } catch (e) {
    return
  }
  admin.removeUser(cur.value.id)
  drawer.value = false
  showToast('用户已删除')
}
</script>

<template>
  <div class="um">
    <header class="page-head">
      <div>
        <h1>用户管理</h1>
        <p>共 {{ admin.users.length }} 位 ikun · 点「详情」管理单个用户 · 保留号只读</p>
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
            <td><span class="lvl-chip">{{ u.title }} Lv.{{ u.subLevel || u.level }}</span></td>
            <td class="muted">{{ u.checkinDays }} / {{ u.contribution }} / {{ u.featured }}</td>
            <td>
              <span class="role-chip" :class="u.roleType">{{ ROLE_LABEL[u.roleType] || '用户' }}</span>
            </td>
            <td>
              <div class="acts">
                <button class="act primary" @click="openDrawer(u)">
                  <Pencil :size="13" :stroke-width="2.4" /> 详情
                </button>
                <template v-if="!u.reserved">
                  <button
                    v-if="can(role, 'appoint') && u.roleType === 'user' && u.level >= 4"
                    class="act appoint"
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

    <!-- 详情管理抽屉 -->
    <teleport to="body">
      <div v-if="drawer && cur" class="drawer-mask" @click="drawer = false"></div>
      <aside v-if="drawer && cur" class="drawer">
        <header class="d-head">
          <AvatarWithBorder :avatar-code="cur.avatarCode" :size="52" :show-badge="false" />
          <div class="d-head-text">
            <b>{{ cur.nickname }}</b>
            <span class="mono">{{ cur.idNumber }}</span>
            <div class="d-chips">
              <span class="role-chip" :class="cur.roleType">{{ ROLE_LABEL[cur.roleType] || '用户' }}</span>
              <span class="lvl-chip">{{ cur.title }} Lv.{{ cur.subLevel || cur.level }}</span>
              <span v-if="cur.banned" class="banned-tag">已封禁</span>
            </div>
          </div>
          <button class="d-close" @click="drawer = false">×</button>
        </header>

        <div class="d-body">
          <p v-if="cur.reserved" class="d-note">系统保留席位,仅可查看。</p>

          <template v-else>
            <!-- 档案 -->
            <section v-if="can(role, 'users')" class="d-sec">
              <b class="d-title">档案资料</b>
              <div class="field">
                <span>昵称</span>
                <input v-model="form.nickname" type="text" maxlength="12" />
              </div>
              <div class="field">
                <span>手机号</span>
                <input v-model="form.phone" type="tel" maxlength="11" placeholder="选填" />
              </div>
              <div class="field">
                <span>邮箱</span>
                <input v-model="form.email" type="email" maxlength="40" placeholder="选填" />
              </div>
              <button class="d-save" @click="saveProfile">保存资料</button>
            </section>

            <!-- 等级配置 -->
            <section v-if="can(role, 'users')" class="d-sec">
              <b class="d-title">等级配置</b>
              <div class="field">
                <span>弟子等级</span>
                <select v-model.number="newLevel" class="sel">
                  <option v-for="o in LEVEL_OPTS" :key="o.v" :value="o.v">{{ o.t }}(Lv.{{ o.v }})</option>
                </select>
              </div>
              <p class="d-tip">数据(打卡 {{ cur.checkinDays }} / 贡献 {{ cur.contribution }} / 加精 {{ cur.featured }})</p>
              <button class="d-save" @click="saveLevel">保存等级</button>
            </section>

            <!-- 角色 -->
            <section v-if="can(role, 'manage_admins')" class="d-sec">
              <b class="d-title">角色</b>
              <div class="field">
                <select v-model="newRole" class="sel">
                  <option v-for="o in ROLE_OPTS" :key="o.v" :value="o.v">{{ o.t }}</option>
                </select>
              </div>
              <button class="d-save" @click="saveRole">保存角色</button>
            </section>

            <!-- 密码 -->
            <section v-if="can(role, 'manage_admins')" class="d-sec">
              <b class="d-title">重置密码</b>
              <div class="field">
                <span>新密码</span>
                <input v-model="newPassword" type="text" maxlength="20" placeholder="至少 6 位" />
              </div>
              <button class="d-save ghosted" @click="resetPassword">重置密码</button>
            </section>

            <!-- 危险区 -->
            <section class="d-sec danger" v-if="can(role, 'manage_admins') || can(role, 'ban')">
              <b class="d-title">危险操作</b>
              <div class="d-danger-acts">
                <button v-if="can(role, 'ban')" class="d-act" :class="{ danger: !cur.banned }" @click="banToggle(cur)">
                  <component :is="cur.banned ? RotateCcw : BanIcon" :size="14" :stroke-width="2.4" />
                  {{ cur.banned ? '解除封禁' : '封禁账号' }}
                </button>
                <button v-if="can(role, 'manage_admins')" class="d-act danger" @click="removeUser">
                  <Trash2 :size="14" :stroke-width="2.4" /> 删除用户
                </button>
              </div>
            </section>
          </template>
        </div>
      </aside>
    </teleport>
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
  min-width: 760px;

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

    &.primary,
    &.appoint {
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

// —— 抽屉 ——
.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(29, 27, 40, 0.4);
}

.drawer {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 41;
  width: min(400px, 92vw);
  display: flex;
  flex-direction: column;
  background: var(--card);
  border-left: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
  animation: d-in 0.22s ease;
}

@keyframes d-in {
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.d-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  border-bottom: 1px solid var(--line);

  .d-head-text {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 16px;
    }

    span.mono {
      font-size: 11px;
      color: var(--text-2);
    }
  }

  .d-chips {
    display: flex;
    gap: 5px;
    margin-top: 5px;
    flex-wrap: wrap;
  }

  .d-close {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    font-size: 20px;
    color: var(--text-2);
    background: var(--bg);
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }
}

.d-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.d-note {
  padding: 14px;
  font-size: 12px;
  color: var(--text-2);
  background: var(--bg);
  border-radius: 10px;
  text-align: center;
}

.d-sec {
  padding: 14px;
  background: var(--bg);
  border-radius: 12px;

  &.danger {
    background: rgba(255, 90, 95, 0.05);
  }

  .d-title {
    display: block;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 800;
  }
}

.field {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;

  span {
    width: 52px;
    flex-shrink: 0;
    font-size: 12px;
    color: var(--text-2);
  }

  input,
  .sel {
    flex: 1;
    min-width: 0;
    padding: 9px 12px;
    font-size: 13px;
    color: var(--text);
    background: var(--card);
    border: 1px solid var(--line-strong);
    border-radius: 9px;
    outline: none;
  }
}

.d-tip {
  font-size: 11px;
  color: var(--gray);
  margin-bottom: 8px;
}

.d-save {
  width: 100%;
  padding: 9px 0;
  font-size: 13px;
  font-weight: 800;
  color: #221a05;
  background: var(--brand-grad);
  border: none;
  border-radius: 9px;
  box-shadow: 0 3px 10px rgba(255, 176, 31, 0.3);
  cursor: pointer;

  &.ghosted {
    background: var(--card);
    color: var(--text);
    box-shadow: var(--shadow-sm);
  }
}

.d-danger-acts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .d-act {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-2);
    background: var(--card);
    border: 1px solid var(--line-strong);
    border-radius: 9px;
    cursor: pointer;

    &.danger {
      color: var(--red);
      background: rgba(255, 90, 95, 0.08);
    }
  }
}
</style>
