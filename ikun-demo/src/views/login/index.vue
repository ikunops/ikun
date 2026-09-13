<script setup>
// 登录页:手机号 + 验证码(演示环境任意 4 位),或一键体验;平板/桌面居中卡片
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Smartphone, ShieldCheck, ArrowRight, Crown } from 'lucide-vue-next'
import brandLogo from '@/assets/images/brand-logo.png'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const user = useUserStore()

const phone = ref('')
const code = ref('')
const countdown = ref(0)
let timer = null

function sendCode() {
  if (!/^1\d{10}$/.test(phone.value)) {
    showToast('请输入正确的 11 位手机号')
    return
  }
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
  showToast('验证码已发送(演示环境任意 4 位数字均可)')
}

function submit() {
  if (!/^1\d{10}$/.test(phone.value)) {
    showToast('请输入正确的 11 位手机号')
    return
  }
  if (!/^\d{4}$/.test(code.value)) {
    showToast('请输入 4 位验证码')
    return
  }
  user.login(phone.value)
  showToast('欢迎加入 ikun 社区')
  router.replace('/avatar-select')
}

function quickLogin() {
  const randomPhone = '138' + String(Math.floor(10000000 + Math.random() * 89999999))
  user.login(randomPhone)
  showToast('演示一键登录')
  router.replace('/avatar-select')
}

function elderLogin() {
  user.loginAsElder()
  showToast('大长老驾到')
  router.replace('/home')
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
        <div class="row">
          <span class="label"><Smartphone :size="17" :stroke-width="2.2" /></span>
          <input v-model="phone" type="tel" maxlength="11" placeholder="请输入手机号" />
        </div>
        <div class="divider"></div>
        <div class="row">
          <span class="label"><ShieldCheck :size="17" :stroke-width="2.2" /></span>
          <input v-model="code" type="tel" maxlength="4" placeholder="4 位验证码" />
          <button class="code-btn" :disabled="countdown > 0" @click="sendCode">
            {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
          </button>
        </div>

        <button class="ik-btn is-block" @click="submit">登 录</button>
        <button class="ik-btn is-block ghost" @click="quickLogin">
          演示一键体验 <ArrowRight :size="16" :stroke-width="2.4" />
        </button>
        <button class="ik-btn is-block ghost" @click="elderLogin">
          <Crown :size="16" :stroke-width="2.4" /> 大长老登录(管理后台 · 全边框)
        </button>
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

  .ik-btn {
    margin-top: 18px;
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
