<script setup>
// 身份证颁发动画页:卡片飞入 → 3D 翻面 → 盖章 → 字母点亮 → 几何彩纸(GSAP 时间线)
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import IdCard from '@/components/IdCard.vue'
import IkonBadge from '@/components/IkonBadge.vue'
import { useUserStore } from '@/stores/user'
import { useLevelStore } from '@/stores/level'
import { useBorderStore } from '@/stores/border'

const router = useRouter()
const user = useUserStore()
const level = useLevelStore()
const border = useBorderStore()

const flipped = ref(false)
const stamped = ref(false)
const lit = ref(0)
const stage = ref(0) // 0 演出中 → 1 完成,出现按钮
const cardRef = ref(null)
const confetti = ref([])

const CONFETTI_COLORS = ['#ffc53d', '#ff5a5f', '#7c5cff', '#35c48d', '#4da3ff']
const SHAPES = ['circle', 'square', 'triangle']

onMounted(() => {
  border.syncDefault()
  confetti.value = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    shape: SHAPES[i % SHAPES.length],
    scale: 0.7 + Math.random() * 0.8,
  }))

  const tl = gsap.timeline()

  // 1. 卡片从宗门"飞"到面前
  tl.fromTo(
    cardRef.value,
    { scale: 2.6, y: 110, opacity: 0, rotation: -8 },
    { scale: 1, y: 0, opacity: 1, rotation: 0, duration: 0.9, ease: 'power3.out' }
  )

  // 2. 翻面露出正面(翻转交给 CSS 3D transition)
  tl.add(() => {
    lit.value = 1
    flipped.value = true
  }, '+=0.45')

  // 3. 盖章 + 字母逐个点亮 + 彩纸
  tl.add(() => {
    stamped.value = true
  }, '+=0.85')

  tl.add(() => {
    lit.value = 2
  }, '<0.1')
  tl.add(() => {
    lit.value = 3
  }, '+=0.14')
  tl.add(() => {
    lit.value = 4
  }, '+=0.14')

  tl.add(() => {
    document.querySelectorAll('.confetti .piece').forEach((el) => {
      gsap.fromTo(
        el,
        { x: 0, y: 0, opacity: 1, scale: 0.4 * Number(el.dataset.scale || 1), rotation: 0 },
        {
          x: (Math.random() - 0.5) * 560,
          y: -(90 + Math.random() * 400),
          rotation: (Math.random() - 0.5) * 540,
          scale: 1.15 * Number(el.dataset.scale || 1),
          opacity: 0,
          duration: 1.3 + Math.random() * 0.8,
          ease: 'power2.out',
        }
      )
    })
  }, '<')

  tl.to({}, { duration: 0.5, onComplete: () => (stage.value = 1) })
})

function finish() {
  user.issueCard()
  router.replace('/home')
}
</script>

<template>
  <div class="issue">
    <p class="tip">{{ stage === 1 ? '身份证颁发完毕' : '宗门正在为你颁发身份证…' }}</p>

    <div ref="cardRef" class="stage-card">
      <IdCard
        :nickname="user.nickname"
        :id-number="user.idNumber"
        :avatar-code="user.avatarCode"
        :avatar-type="user.avatarType"
        :custom-avatar="user.customAvatar"
        :border-id="level.info.borderId || 'b-gray'"
        :title="level.info.title"
        :color="level.info.color"
        :lv-label="`Lv.${level.info.level}`"
        :letters="lit"
        :joined-at="user.joinedAt"
        :flipped="flipped"
        :stamped="stamped"
      />
    </div>

    <div class="badge-line">
      <IkonBadge :lit="lit" :size="34" :color="level.info.color" />
    </div>

    <div v-if="stage === 1" class="done">
      <button class="ik-btn" @click="finish">进入社区</button>
      <p class="hint">长按卡片或截图保存你的 ikun 身份证</p>
    </div>

    <div class="confetti">
      <span
        v-for="c in confetti"
        :key="c.id"
        class="piece"
        :class="c.shape"
        :style="c.shape === 'triangle' ? { borderBottomColor: c.color } : { background: c.color }"
        :data-scale="c.scale"
      ></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.issue {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding: 30px 34px;
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 197, 61, 0.28), transparent 55%),
    #221f30;
  overflow: hidden;
}

.tip {
  font-size: 14px;
  font-weight: 700;
  color: #ffe9b3;
  letter-spacing: 2px;
}

.stage-card {
  width: 100%;
  max-width: 460px;
}

.badge-line {
  display: flex;
  gap: 10px;
}

.done {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: ik-pop 0.35s ease both;
}

.hint {
  font-size: 11px;
  color: rgba(255, 233, 179, 0.65);
}

// 几何彩纸:圆 / 方 / 三角,品牌色系
.confetti {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 0;
  height: 0;
  pointer-events: none;
}

.piece {
  position: absolute;
  width: 12px;
  height: 12px;
  transform: translate(-50%, -50%);

  &.circle {
    border-radius: 50%;
  }

  &.square {
    border-radius: 3px;
  }

  &.triangle {
    width: 0;
    height: 0;
    background: transparent;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 12px solid #ffc53d;
  }
}
</style>
