<script setup>
// 登录/注册:昵称 + 密码(users 表校验);桌面双栏铺满,移动端单列
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { UserRound, LockKeyhole, X } from 'lucide-vue-next'
import brandLogo from '@/assets/images/brand-logo.png'
import { useUserStore } from '@/stores/user'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const user = useUserStore()
const admin = useAdminStore()
admin.restore()

const mode = ref('login') // login | register
const username = ref('')
const password = ref('')
const password2 = ref('')

// 第三方登录:功能已备(模拟授权链路),默认不开放;开启需管理端 loginMethods
const oauthEnabled = computed(
  () => admin.loginMethods.wechat || admin.loginMethods.douyin
)
const PROVIDERS = {
  wechat: { label: '微信登录', name: '微信' },
  douyin: { label: '抖音登录', name: '抖音' },
}
const oauthProvider = ref('')

function startOAuth(key) {
  if (!admin.loginMethods[key]) return
  oauthProvider.value = key
}

function confirmOAuth() {
  const key = oauthProvider.value
  oauthProvider.value = ''
  const res = user.oauthLogin(key)
  if (!res.ok) {
    showToast(res.msg)
    return
  }
  showToast(`授权成功,${PROVIDERS[key].name}账号已接入`)
  router.replace(res.fresh ? '/avatar-select' : '/home')
}

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
</script>

<template>
  <div class="login">
    <!-- 桌面左栏品牌区 -->
    <section class="hero">
      <img class="hero-logo" :src="brandLogo" alt="ikun社区" />
      <h1>ikun社区</h1>
      <p class="slogan">天下ikun是一家</p>
      <div class="hero-tags">
        <span>宗门等级</span>
        <span>坤系头像</span>
        <span>打卡成长</span>
      </div>
    </section>

    <!-- 表单区 -->
    <section class="panel">
      <div class="panel-inner">
        <div class="m-brand">
          <img :src="brandLogo" alt="ikun社区" />
          <div>
            <b>ikun社区</b>
            <span>天下ikun是一家</span>
          </div>
        </div>

        <div class="form">
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

          <!-- 第三方登录:loginMethods 开启才显示(暂不开放) -->
          <template v-if="mode === 'login' && oauthEnabled">
            <div class="oauth-divider"><span>其他登录方式</span></div>
            <div class="oauth-row">
              <button
                v-for="(cfg, key) in PROVIDERS"
                :key="key"
                v-show="admin.loginMethods[key]"
                class="oauth-btn"
                :class="key"
                @click="startOAuth(key)"
              >
                <svg v-if="key === 'wechat'" viewBox="0 0 24 24" class="ob-icon">
                  <path
                    fill="currentColor"
                    d="M9.5 4C5.9 4 3 6.4 3 9.4c0 1.7 1 3.2 2.4 4.2l-.6 2 2.2-1.1c.8.2 1.6.4 2.5.4h.4A5 5 0 0 1 9.7 13c0-2.9 2.8-5.2 6.2-5.2h.3C15.6 5.6 12.8 4 9.5 4Zm-2.3 3a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Zm4.6 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8ZM21 14.9c0-2.5-2.5-4.6-5.5-4.6S10 12.4 10 14.9s2.5 4.6 5.5 4.6c.7 0 1.4-.1 2-.3l1.9.9-.5-1.7c1.3-.8 2.1-2.1 2.1-3.5Zm-7.3-.8a.8.8 0 1 1 0-1.5.8.8 0 0 1 0 1.5Zm3.6 0a.8.8 0 1 1 0-1.5.8.8 0 0 1 0 1.5Z"
                  />
                </svg>
                <svg v-else viewBox="0 0 24 24" class="ob-icon">
                  <path
                    fill="currentColor"
                    d="M16.6 3c.4 2.1 1.8 3.6 3.9 3.9v2.7c-1.5 0-2.8-.5-3.9-1.3v5.8c0 3.3-2.4 5.6-5.5 5.6A5.4 5.4 0 0 1 5.6 14c0-3 2.4-5.4 5.5-5.4l.9.1v2.8a2.7 2.7 0 0 0-3.6 2.5 2.7 2.7 0 0 0 2.7 2.7c1.5 0 2.6-1.1 2.6-2.8V3h2.9Z"
                  />
                </svg>
                {{ cfg.label }}
              </button>
            </div>
          </template>

          <p v-if="mode === 'register'" class="hint">
            注册后自选工种头像、领取身份证;手机号/邮箱可在「设置」中补充
          </p>
          <p class="agreement">登录即代表同意《ikun社区公约》· 天下ikun是一家</p>
        </div>
      </div>
    </section>

    <!-- 模拟扫码授权弹窗(功能保留,默认隐藏) -->
    <teleport to="body">
      <div v-if="oauthProvider" class="scan-mask" @click="oauthProvider = ''">
        <div class="scan-card" @click.stop>
          <button class="scan-close" @click="oauthProvider = ''"><X :size="16" :stroke-width="2.4" /></button>
          <b class="scan-title">{{ PROVIDERS[oauthProvider]?.name }}登录</b>
          <div class="qr">
            <div class="qr-grid"></div>
            <span class="qr-scanline"></span>
          </div>
          <p class="scan-tip">请使用 {{ PROVIDERS[oauthProvider]?.name }} 扫码授权(演示:模拟扫码)</p>
          <button class="scan-confirm" @click="confirmOAuth">我已扫码,确认授权</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped lang="scss">
.login {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

// —— 桌面品牌栏(移动端隐藏) ——
.hero {
  display: none;
}

// —— 表单区 ——
.panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
}

.panel-inner {
  width: 100%;
  max-width: 400px;
}

.m-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 26px;

  img {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid var(--line-strong);
    box-shadow: var(--shadow-sm);
  }

  b {
    display: block;
    font-size: 20px;
    font-weight: 900;
  }

  span {
    display: block;
    font-size: 11px;
    color: var(--text-2);
    letter-spacing: 2px;
  }
}

.form {
  padding: 24px 20px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow-md);

  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 18px;
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
    height: 1px;
    background: var(--line);
    margin: 4px 0;
  }

  .ik-btn {
    margin-top: 20px;
  }

  .oauth-divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    color: var(--gray);
    font-size: 11px;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--line);
    }
  }

  .oauth-row {
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }

  .oauth-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 10px 0;
    font-size: 13px;
    font-weight: 800;
    border-radius: 12px;
    cursor: pointer;
    transition: filter 0.15s ease, transform 0.12s ease;

    .ob-icon {
      width: 18px;
      height: 18px;
    }

    &.wechat {
      color: #06ad40;
      background: rgba(7, 193, 96, 0.09);
    }

    &.douyin {
      color: #161823;
      background: rgba(22, 24, 35, 0.06);
    }

    &:hover {
      transform: translateY(-1px);
    }
  }

  .hint {
    margin-top: 14px;
    font-size: 11px;
    color: var(--gray);
    text-align: center;
    line-height: 1.8;
  }

  .agreement {
    margin-top: 14px;
    font-size: 10px;
    color: var(--gray);
    text-align: center;
  }
}

// —— 桌面:品牌区铺满左栏 ——
@media (min-width: 1024px) {
  .hero {
    position: relative;
    display: flex;
    flex: 1.1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background:
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.35), transparent 40%),
      linear-gradient(160deg, #ffd24d 0%, #ffb01f 100%);
    border-right: 1px solid rgba(29, 27, 40, 0.08);

    .hero-logo {
      width: 128px;
      height: 128px;
      border-radius: 32px;
      border: 2px solid rgba(29, 27, 40, 0.15);
      box-shadow: var(--shadow-lg);
      animation: ik-float 3s ease-in-out infinite;
    }

    h1 {
      margin-top: 12px;
      font-size: 40px;
      font-weight: 900;
      color: #221a05;
      letter-spacing: 2px;
    }

    .slogan {
      font-size: 14px;
      font-weight: 700;
      color: rgba(34, 26, 5, 0.7);
      letter-spacing: 5px;
    }

    .hero-tags {
      display: flex;
      gap: 10px;
      margin-top: 22px;

      span {
        padding: 6px 16px;
        font-size: 12px;
        font-weight: 700;
        color: #221a05;
        background: rgba(255, 255, 255, 0.55);
        border-radius: 999px;
      }
    }
  }

  .m-brand {
    display: none;
  }

  .panel {
    padding: 40px;
  }
}

// —— 模拟扫码弹窗 ——
.scan-mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(29, 27, 40, 0.45);
}

.scan-card {
  position: relative;
  width: min(320px, 88vw);
  padding: 22px 20px 18px;
  text-align: center;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow-lg);

  .scan-close {
    position: absolute;
    right: 12px;
    top: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--text-2);
    background: var(--bg);
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }

  .scan-title {
    font-size: 16px;
    font-weight: 900;
  }

  .qr {
    position: relative;
    width: 168px;
    height: 168px;
    margin: 16px auto 12px;
    border: 1.5px solid var(--line-strong);
    border-radius: 12px;
    overflow: hidden;

    .qr-grid {
      position: absolute;
      inset: 10px;
      background-image:
        linear-gradient(90deg, rgba(29, 27, 40, 0.55) 1px, transparent 1px),
        linear-gradient(rgba(29, 27, 40, 0.55) 1px, transparent 1px);
      background-size: 9px 9px;
      opacity: 0.35;
      border-radius: 4px;
    }

    .qr-scanline {
      position: absolute;
      left: 10px;
      right: 10px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--yellow-deep), transparent);
      animation: scan-move 2.2s ease-in-out infinite;
    }
  }

  .scan-tip {
    font-size: 12px;
    color: var(--text-2);
  }

  .scan-confirm {
    margin-top: 14px;
    width: 100%;
    padding: 11px 0;
    font-size: 14px;
    font-weight: 800;
    color: #221a05;
    background: var(--brand-grad);
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 14px rgba(255, 176, 31, 0.35);
    cursor: pointer;
  }
}

@keyframes scan-move {
  0%,
  100% {
    top: 12px;
  }
  50% {
    top: calc(100% - 14px);
  }
}
</style>
