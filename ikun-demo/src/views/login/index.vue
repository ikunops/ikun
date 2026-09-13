<script setup>
// 登录/注册:昵称 + 密码(users 表校验);大长老一键直达;平板/桌面居中卡片
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { UserRound, LockKeyhole, ArrowRight, Crown } from 'lucide-vue-next'
import brandLogo from '@/assets/images/brand-logo.png'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const user = useUserStore()

const mode = ref('login') // login | register
const username = ref('')
const password = ref('')
const password2 = ref('')

function submit() {
  const name = username.value.trim()
  if (!name) {
    showToast('请输入昵称')
    return
  }
  if (!password.value) {
    showToast('请输入密码')
    return
  }

  if (mode.value === 'register') {
    if (password.value !== password2.value) {
      showToast('两次密码不一致')
      return
    }
    const res = user.registerAccount(name, password.value)
    if (!res.ok) {
      showToast(res.msg)
      return
    }
    showToast('注册成功,选个头像领身份证吧')
    router.replace('/avatar-select')
    return
  }

  const res = user.loginByPassword(name, password.value)
  if (!res.ok) {
    showToast(res.msg)
    return
  }
  showToast(`欢迎回来,${name}`)
  router.replace('/home')
}

function elderLogin() {
  const res = user.loginAsElder()
  if (!res.ok) {
    showToast(res.msg)
    return
  }
  showToast('大长老驾到')
  router.replace('/home')
}

function fillDemo(name) {
  mode.value = 'login'
  username.value = name
  password.value = '123456'
}
</script>

<template>
  <div class="login fullpage">
    <div class="login-inner">
      <div class="brand">
        <img class="brand-logo" :src="brandLogo" alt="ikun社区" />
        <h1>ikun社区</h1>
        <p>天下ikun是一家</p>
      </div>

      <div class="form ik-card">
        <div class="tabs">
          <button class="tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">登录</button>
          <button class="tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">注册</button>
        </div>

        <div class="row">
          <span class="label"><UserRound :size="17" :stroke-width="2.2" /></span>
          <input
            v-model="username"
            type="text"
            maxlength="12"
            :placeholder="mode === 'login' ? '昵称' : '设置昵称(2-12 位,即用户名)'"
            @keyup.enter="submit"
          />
        </div>
        <div class="divider"></div>
        <div class="row">
          <span class="label"><LockKeyhole :size="17" :stroke-width="2.2" /></span>
          <input
            v-model="password"
            type="password"
            maxlength="20"
            :placeholder="mode === 'login' ? '密码' : '设置密码(至少 6 位)'"
            @keyup.enter="submit"
          />
        </div>
        <template v-if="mode === 'register'">
          <div class="divider"></div>
          <div class="row">
            <span class="label"><LockKeyhole :size="17" :stroke-width="2.2" /></span>
            <input
              v-model="password2"
              type="password"
              maxlength="20"
              placeholder="确认密码"
              @keyup.enter="submit"
            />
          </div>
        </template>

        <button class="ik-btn is-block" @click="submit">
          {{ mode === 'login' ? '登 录' : '注册并进入' }}
        </button>

        <template v-if="mode === 'login'">
          <button class="ik-btn is-block ghost" @click="elderLogin">
            <Crown :size="16" :stroke-width="2.4" /> 大长老一键登录(管理后台 · 全边框)
          </button>
          <p class="demo-hint">
            演示账号密码均为 123456:
            <button class="demo-name" @click="fillDemo('大长老')">大长老</button>
            <button class="demo-name" @click="fillDemo('阿坤不打篮球')">阿坤不打篮球</button>
            <button class="demo-name" @click="fillDemo('背带裤政委')">背带裤政委</button>
          </p>
        </template>
        <p v-else class="demo-hint">注册后自选工种头像、领取身份证;手机号/邮箱可在「设置」中补充</p>

        <p class="agreement">登录即代表同意《ikun社区公约》· 天下ikun是一家</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background:
    radial-gradient(circle at 85% 12%, rgba(255, 197, 61, 0.35), transparent 42%),
    radial-gradient(circle at 8% 88%, rgba(255, 90, 95, 0.16), transparent 45%),
    var(--bg);
}

.login-inner {
  width: 100%;
  max-width: 420px;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 30px;

  h1 {
    margin-top: 12px;
    font-size: 30px;
    font-weight: 900;
    letter-spacing: 2px;
  }

  p {
    font-size: 12px;
    color: var(--text-2);
    letter-spacing: 4px;
  }
}

.brand-logo {
  width: 88px;
  height: 88px;
  border: 1px solid var(--line-strong);
  border-radius: 24px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  animation: ik-float 2.6s ease-in-out infinite;
}

.form {
  padding: 22px 18px;

  .row {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 0;

    .label {
      display: flex;
      align-items: center;
      color: var(--ink);
    }

    input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      font-size: 15px;
      color: var(--text);
    }
  }

  .divider {
    height: 1.5px;
    background: var(--line-soft);
    margin: 4px 0;
  }

  .code-btn {
    flex-shrink: 0;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 800;
    color: var(--ink);
    background: var(--yellow);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    cursor: pointer;

    &:disabled {
      background: var(--line-soft);
      color: var(--gray);
      border-color: #d8d4c8;
    }
  }

  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    padding: 4px;
    background: var(--bg);
    border-radius: 12px;
  }

  .tab {
    flex: 1;
    padding: 9px 0;
    font-size: 14px;
    font-weight: 800;
    color: var(--text-2);
    background: transparent;
    border: none;
    border-radius: 10px;
    cursor: pointer;

    &.active {
      color: #221a05;
      background: var(--brand-grad);
      box-shadow: 0 2px 8px rgba(255, 176, 31, 0.35);
    }
  }

  .ik-btn {
    margin-top: 18px;
  }

  .demo-hint {
    margin-top: 14px;
    font-size: 11px;
    line-height: 2;
    color: var(--gray);
    text-align: center;
  }

  .demo-name {
    padding: 2px 9px;
    margin: 0 2px;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-2);
    background: var(--bg);
    border: none;
    border-radius: 999px;
    cursor: pointer;

    &:hover {
      color: var(--text);
    }
  }

  .agreement {
    margin-top: 14px;
    font-size: 10px;
    color: var(--gray);
    text-align: center;
  }
}

@media (min-width: 1200px) {
  .brand-logo {
    width: 108px;
    height: 108px;
  }

  .brand h1 {
    font-size: 36px;
  }
}
</style>
