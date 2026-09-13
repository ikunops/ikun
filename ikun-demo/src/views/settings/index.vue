<script setup>
// 设置页:编辑资料(昵称)/ 头像与边框入口 / 清空演示数据 / 关于(第三期)
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { PenLine, Gem, Bird, Info, Trash2, Smartphone, Mail, LockKeyhole } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { useAdminStore } from '@/stores/admin'

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

function saveNick() {
  if (user.setNickname(nick.value)) {
    const u = admin.users.find((x) => x.nickname === user.nickname)
    if (u) u.nickname = user.nickname
    admin.persist()
    showToast('昵称已更新')
  } else {
    showToast('昵称不能为空')
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
  router.replace('/login')
}
</script>

<template>
  <div class="page st">
    <van-nav-bar title="设置" left-arrow @click-left="router.back()" />

    <!-- 编辑资料 -->
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
