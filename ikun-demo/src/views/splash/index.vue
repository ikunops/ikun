<script setup>
// 启动页:品牌小鸡弹跳 + ikun 字母逐个点亮,2.2s 后自动进入
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import splashLogo from '@/assets/images/splash-logo.png'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const user = useUserStore()

function go() {
  router.replace(user.isLoggedIn && user.hasIdCard ? '/home' : '/login')
}

onMounted(() => setTimeout(go, 2200))
</script>

<template>
  <div class="splash" @click="go">
    <div class="logo">
      <img :src="splashLogo" alt="ikun社区" />
    </div>
    <h1 class="name">ikun社区</h1>
    <p class="slogan">天下ikun是一家</p>
    <div class="letters">
      <span v-for="(ch, i) in ['i', 'k', 'u', 'n']" :key="ch" :style="{ animationDelay: 0.3 + i * 0.22 + 's' }">
        {{ ch }}
      </span>
    </div>
    <p class="skip">点击任意处跳过</p>
  </div>
</template>

<style scoped lang="scss">
.splash {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(160deg, var(--paper-warm) 0%, #ffc53d 60%, #f5a623 100%);
}

.logo {
  width: 132px;
  height: 132px;
  border: 1px solid var(--line-strong);
  border-radius: 32px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: ik-bounce 1.4s ease-in-out infinite;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.name {
  margin-top: 10px;
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 2px;
  color: var(--ink);
}

.slogan {
  font-size: 14px;
  font-weight: 700;
  color: rgba(38, 35, 56, 0.75);
  letter-spacing: 4px;
}

.letters {
  display: flex;
  gap: 12px;
  margin-top: 22px;

  span {
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 900;
    color: #7a5200;
    background: var(--brand-grad);
    box-shadow: var(--shadow-md);
    border-radius: 14px;
    animation: ik-pop 0.4s ease both;
  }
}

.skip {
  position: absolute;
  bottom: 34px;
  font-size: 11px;
  color: rgba(38, 35, 56, 0.55);
}
</style>
