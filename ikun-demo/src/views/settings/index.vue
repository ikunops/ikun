<script setup>
// 设置页:通用入口(头像/边框/留言板/身份证/后台/退出) / 编辑资料 / 数据 / 关于
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { PenLine, Gem, Bird, Info, Trash2, Smartphone, Mail, LockKeyhole, ShieldCheck, MessageSquare, LogOut, CreditCard, Medal } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { useAdminStore } from '@/stores/admin'
import { remove as dbRemove } from '@/stores/db'

const router = useRouter()
const user = useUserStore()
const admin = useAdminStore()
admin.restore()

const nick = ref(user.nickname)
const rec = admin.users.find((x) => x.nickname === user.nickname)
const phone = ref(rec?.phone || '')
const email = ref(rec?.email || '')
const pw1 = ref('')
const pw2 = ref('')

const ADMIN_ENTRY = computed(() => ['grand_elder', 'core_elder'].includes(user.roleType))

async function logout() {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '确定退出当前账号?',
      confirmButtonText: '退出',
    })
  } catch (e) {
    return
  }
  user.reset()
  router.replace('/login')
}

function saveNick() {
  // user.setNickname 内部做唯一校验并写表+指针
  if (user.setNickname(nick.value)) {
    showToast('昵称已更新')
  } else {
    showToast('昵称为空或已被占用')
  }
}

function savePassword() {
  if ((pw1.value || '').length < 6) {
    showToast('新密码至少 6 位')
    return
  }
  if (pw1.value !== pw2.value) {
    showToast('两次密码不一致')
    return
  }
  admin.setOwnPassword(user.nickname, pw1.value)
  pw1.value = ''
  pw2.value = ''
  showToast('密码已更新')
}

function saveContact() {
  admin.updateContact(user.nickname, { phone: phone.value.trim(), email: email.value.trim() })
  user.phone = phone.value.trim()
  user.email = email.value.trim()
  showToast('联系方式已保存')
}

async function resetAll() {
  try {
    await showConfirmDialog({
      title: '清空演示数据',
      message: '将清除本机全部数据(账号/发帖/打卡/留言),确定吗?',
      confirmButtonText: '清空',
      cancelButtonText: '再想想',
    })
  } catch (e) {
    return
  }
  user.reset()
  localStorage.removeItem('ikun-demo-posts-v1')
  localStorage.removeItem('ikun-demo-notify-v1')
  localStorage.removeItem('ikun-demo-border-v1')
  dbRemove('admin') // v2 用户表(唯一数据源)
  dbRemove('session')
  router.replace('/login')
}
</script>

<template>
  <div class="page st">
    <van-nav-bar title="设置" left-arrow @click-left="router.back()" />

    <!-- 编辑资料 -->
    <div class="sec-title">通用</div>
    <div class="menu ik-card">
      <button class="menu-item" @click="router.push('/avatar-select')">
        <span class="mi-icon"><Bird :size="18" :stroke-width="2.2" /></span>
        <span class="mi-label">更换工种头像</span>
        <span class="mi-arrow">›</span>
      </button>
      <button class="menu-item" @click="router.push('/border-select')">
        <span class="mi-icon"><Gem :size="18" :stroke-width="2.2" /></span>
        <span class="mi-label">边框选择</span>
        <span class="mi-arrow">›</span>
      </button>
      <button class="menu-item" @click="router.push('/guestbook?mine=1')">
        <span class="mi-icon"><MessageSquare :size="18" :stroke-width="2.2" /></span>
        <span class="mi-label">我的留言板</span>
        <span class="mi-arrow">›</span>
      </button>
      <button class="menu-item" @click="router.push('/id-card')">
        <span class="mi-icon"><CreditCard :size="18" :stroke-width="2.2" /></span>
        <span class="mi-label">我的身份证</span>
        <span class="mi-arrow">›</span>
      </button>
      <button class="menu-item" @click="router.push('/level')">
        <span class="mi-icon"><Medal :size="18" :stroke-width="2.2" /></span>
        <span class="mi-label">等级与成长体系</span>
        <span class="mi-arrow">›</span>
      </button>
      <button v-if="ADMIN_ENTRY" class="menu-item" @click="router.push('/admin')">
        <span class="mi-icon"><ShieldCheck :size="18" :stroke-width="2.2" /></span>
        <span class="mi-label">管理后台</span>
        <span class="mi-note">admin</span>
        <span class="mi-arrow">›</span>
      </button>
      <button class="menu-item" @click="logout">
        <span class="mi-icon"><LogOut :size="18" :stroke-width="2.2" /></span>
        <span class="mi-label" style="color:var(--red)">退出登录</span>
        <span class="mi-arrow">›</span>
      </button>
    </div>

    <div class="sec-title">编辑资料</div>
    <div class="ik-card nick-card">
      <span class="label">昵称</span>
      <input v-model="nick" type="text" maxlength="12" />
      <button class="save" @click="saveNick"><PenLine :size="14" :stroke-width="2.4" /> 保存</button>
    </div>

    <div class="ik-card contact-card">
      <div class="c-row">
        <span class="c-label"><Smartphone :size="15" :stroke-width="2.2" /> 手机号</span>
        <input v-model="phone" type="tel" maxlength="11" placeholder="选填" />
      </div>
      <div class="c-row">
        <span class="c-label"><Mail :size="15" :stroke-width="2.2" /> 邮箱</span>
        <input v-model="email" type="email" maxlength="40" placeholder="选填" />
      </div>
      <button class="c-save" @click="saveContact">保存联系方式</button>
    </div>

    <div class="ik-card contact-card">
      <div class="c-title"><LockKeyhole :size="14" :stroke-width="2.4" /> 修改密码</div>
      <div class="c-row">
        <span class="c-label">新密码</span>
        <input v-model="pw1" type="password" maxlength="20" placeholder="至少 6 位" />
      </div>
      <div class="c-row">
        <span class="c-label">确认密码</span>
        <input v-model="pw2" type="password" maxlength="20" placeholder="再次输入" />
      </div>
      <button class="c-save" @click="savePassword">保存新密码</button>
    </div>

    <!-- 数据 -->
    <div class="sec-title">数据</div>
    <div class="menu ik-card">
      <button class="menu-item danger" @click="resetAll">
        <span class="mi-icon"><Trash2 :size="18" :stroke-width="2.2" /></span>
        <span class="mi-label">清空演示数据并退出</span>
        <span class="mi-arrow">›</span>
      </button>
    </div>

    <!-- 关于 -->
    <div class="sec-title">关于</div>
    <div class="about ik-card">
      <span class="about-icon"><Info :size="18" :stroke-width="2.2" /></span>
      <div>
        <b>ikun社区 Demo v0.2</b>
        <p>宗门制粉丝社区 · 天下ikun是一家</p>
        <p>Vue 3 + Vite + Vant 4 + Pinia + GSAP · 第一/二/三期功能全量演示</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.st {
  padding-top: 0;
}

.sec-title {
  margin: 18px 2px 8px;
  font-size: 13px;
  font-weight: 800;
  color: var(--text-2);
}

.nick-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;

  .label {
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 700;
  }

  input {
    flex: 1;
    min-width: 0;
    padding: 8px 12px;
    font-size: 14px;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    outline: none;
  }

  .save {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 800;
    color: var(--ink);
    background: var(--yellow);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    box-shadow: var(--shadow-sm);
    cursor: pointer;

    &:active {
      transform: translate(2px, 2px);
      box-shadow: none;
    }
  }
}

.contact-card {
  padding: 14px;

  .c-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 800;
    color: var(--text-2);
  }

  .c-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;

    .c-label {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 76px;
      flex-shrink: 0;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-2);
    }

    input {
      flex: 1;
      min-width: 0;
      padding: 8px 12px;
      font-size: 13px;
      color: var(--text);
      background: var(--bg);
      border: 1px solid var(--line-strong);
      border-radius: 10px;
      outline: none;
    }
  }

  .c-save {
    margin-top: 8px;
    width: 100%;
    padding: 10px 0;
    font-size: 13px;
    font-weight: 800;
    color: #221a05;
    background: var(--brand-grad);
    border: none;
    border-radius: 10px;
    box-shadow: 0 3px 10px rgba(255, 176, 31, 0.35);
    cursor: pointer;
  }
}

.menu {
  overflow: hidden;

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 14px;
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    background: var(--card);
    border: none;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
    text-align: left;

    &:last-child {
      border-bottom: none;
    }

    .mi-icon {
      display: flex;
      align-items: center;
      color: var(--ink);
    }

    .mi-label {
      flex: 1;
    }

    .mi-note {
      flex-shrink: 0;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 800;
      color: #7a4d00;
      background: rgba(255, 184, 0, 0.16);
      border-radius: 999px;
    }

    .mi-arrow {
      color: var(--gray);
      font-size: 18px;
    }

    &.danger .mi-label {
      color: var(--red);
    }
  }
}

.about {
  display: flex;
  gap: 12px;
  padding: 16px;

  .about-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    color: var(--ink);
    background: var(--yellow);
    border: 1px solid var(--line-strong);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
  }

  b {
    display: block;
    font-size: 14px;
  }

  p {
    margin-top: 4px;
    font-size: 11px;
    color: var(--text-2);
    line-height: 1.6;
  }
}
</style>
