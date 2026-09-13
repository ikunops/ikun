<script setup>
// BorderRing v3 —— 游戏头像框:12 宝石座 + 金属渐变主环 + 内金线 + 高光/暗弧 + 扫光旋转 + 顶部饰徽
// 几何契约:viewBox 120,头像圆 r40(直径 96/120),环带 r 48~57,AvatarWithBorder inset 10% 咬合
import { computed } from 'vue'

const props = defineProps({
  border: { type: Object, default: null },
})

const uid = Math.random().toString(36).slice(2, 8)

// 档位主题:宝石座双色 / 内金线色 / 顶部饰徽形状 / 动效开关
const THEMES = {
  'b-gray':        { gems: ['#c9cdd6', '#9aa0ad'], inner: '#b9b5c4', shape: 'diamond' },
  'b-blue':        { gems: ['#8fd0ff', '#4da3ff'], inner: '#8fd0ff', shape: 'drop', sweep: true },
  'b-purple':      { gems: ['#b18cff', '#7c5cff'], inner: '#b18cff', shape: 'star4', sweep: true, glow: '#7c5cff' },
  'b-gold':        { gems: ['#ffd54a', '#f5a623'], inner: '#ffd54a', shape: 'star4', sweep: true, pulse: true, glow: '#ffb800' },
  'b-cyan-gray':   { gems: ['#b7c6cd', '#8fa3ad'], inner: '#b7c6cd', shape: 'diamond' },
  'b-silver':      { gems: ['#eef2f6', '#c0c8d0'], inner: '#e8edf2', shape: 'diamond', sweep: true },
  'b-azure':       { gems: ['#9ff0f6', '#2ec5d3'], inner: '#9ff0f6', shape: 'drop', sweep: true },
  'b-violet-gold': { gems: ['#8f6cff', '#ffb800'], inner: '#ffd54a', shape: 'star4', sweep: true },
  'b-rainbow':     { rainbow: true, gems: ['#ff5a5f', '#ffc53d'], inner: '#ffd54a', shape: 'star4', sweep: true, spin: true, twinkle: true },
}

const theme = computed(() => {
  const id = props.border?.id
  return (
    THEMES[id] || {
      gems: [props.border?.color || '#b9b5c4', props.border?.color2 || props.border?.color || '#b9b5c4'],
      inner: props.border?.color || '#b9b5c4',
      shape: 'diamond',
    }
  )
})

const isRainbow = computed(() => props.border?.color === 'rainbow')
const stroke = computed(() => {
  const b = props.border
  if (!b) return 'transparent'
  if (b.color === 'rainbow' || b.color2) return `url(#rg-${uid})`
  return b.color
})

// 12 宝石座:每 30° 一颗,外缘 r=57,大小交替
const GEMS = Array.from({ length: 12 }, (_, i) => {
  const a = ((i * 30 + 15) * Math.PI) / 180
  return {
    x: 60 + 57 * Math.cos(a),
    y: 60 + 57 * Math.sin(a),
    r: i % 2 ? 2.1 : 3.1,
    big: i % 2 === 0,
  }
})

// 5.5 闪烁星:环外四角
const STARS = [
  [16, 24],
  [104, 18],
  [106, 104],
  [14, 98],
]

function star4(cx, cy, R) {
  const k = R * 0.3
  return `M ${cx} ${cy - R} L ${cx + k} ${cy - k} L ${cx + R} ${cy} L ${cx + k} ${cy + k} L ${cx} ${cy + R} L ${cx - k} ${cy + k} L ${cx - R} ${cy} L ${cx - k} ${cy - k} Z`
}
</script>

<template>
  <div v-if="border" class="border-ring" :class="[`st-${border.style}`]">
    <!-- 上传的边框图(透明底 PNG)优先;程序绘制兜底 -->
    <img v-if="border.img" :src="border.img" class="ring-img" alt="" />
    <svg v-else viewBox="0 0 120 120">
    <defs>
      <linearGradient :id="`rg-${uid}`" x1="0" y1="0" x2="0.85" y2="1">
        <template v-if="isRainbow">
          <stop offset="0" stop-color="#ff5a5f" />
          <stop offset="0.2" stop-color="#ff9f43" />
          <stop offset="0.4" stop-color="#ffc53d" />
          <stop offset="0.6" stop-color="#35c48d" />
          <stop offset="0.8" stop-color="#4da3ff" />
          <stop offset="1" stop-color="#7c5cff" />
        </template>
        <template v-else>
          <!-- 4-stop 金属光泽:亮-深-亮-深 -->
          <stop offset="0" :stop-color="theme.gems[0]" />
          <stop offset="0.45" :stop-color="theme.gems[1]" />
          <stop offset="0.72" :stop-color="theme.gems[0]" />
          <stop offset="1" :stop-color="theme.gems[1]" />
        </template>
      </linearGradient>
      <!-- 扫光:透明→白→透明 -->
      <linearGradient :id="`sw-${uid}`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0.35" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.55" />
        <stop offset="0.65" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- 12 宝石座(5.5 单独旋转) -->
    <g :class="{ 'ik-slowspin': theme.spin }">
      <circle
        v-for="(g, i) in GEMS"
        :key="i"
        :cx="g.x"
        :cy="g.y"
        :r="g.r"
        :fill="isRainbow ? (i % 2 ? theme.gems[1] : theme.gems[0]) : g.big ? theme.gems[0] : theme.gems[1]"
        stroke="rgba(29, 27, 40, 0.55)"
        stroke-width="1.2"
      />
    </g>

    <!-- 深色底圈 + 金属主环 + 内金线 -->
    <circle cx="60" cy="60" r="52.5" fill="none" stroke="rgba(29, 27, 40, 0.88)" stroke-width="8.5" />
    <circle
      cx="60"
      cy="60"
      r="52.5"
      fill="none"
      :stroke="stroke"
      stroke-width="6"
      :style="theme.glow ? { filter: `drop-shadow(0 0 5px ${theme.glow})` } : null"
    />
    <circle cx="60" cy="60" r="44" fill="none" :stroke="theme.inner" stroke-width="1.8" opacity="0.9" />

    <!-- 静态高光(左上)与暗弧(右下) -->
    <circle
      cx="60"
      cy="60"
      r="52.5"
      fill="none"
      stroke="#ffffff"
      stroke-width="2.6"
      stroke-linecap="round"
      opacity="0.7"
      stroke-dasharray="30 300"
      stroke-dashoffset="-112"
    />
    <circle
      cx="60"
      cy="60"
      r="52.5"
      fill="none"
      stroke="#1d1b28"
      stroke-width="2.2"
      stroke-linecap="round"
      opacity="0.18"
      stroke-dasharray="42 288"
      stroke-dashoffset="-235"
    />

    <!-- 扫光:白光绕环旋转 -->
    <g v-if="theme.sweep" class="ik-sweepg">
      <circle
        cx="60"
        cy="60"
        r="52.5"
        fill="none"
        :stroke="`url(#sw-${uid})`"
        stroke-width="6"
      />
    </g>

    <!-- 顶部饰徽 -->
    <g class="ik-crown">
      <circle cx="60" cy="7.5" r="6.2" fill="#ffffff" stroke="rgba(29, 27, 40, 0.55)" stroke-width="1.5" />
      <rect
        v-if="theme.shape === 'diamond'"
        x="56.6"
        y="4.1"
        width="6.8"
        height="6.8"
        rx="1"
        :fill="theme.gems[0]"
        stroke="rgba(29, 27, 40, 0.55)"
        stroke-width="1.1"
        transform="rotate(45 60 7.5)"
      />
      <circle
        v-else-if="theme.shape === 'drop'"
        cx="60"
        cy="7.5"
        r="2.9"
        :fill="theme.gems[1]"
        stroke="rgba(29, 27, 40, 0.55)"
        stroke-width="1.1"
      />
      <path
        v-else
        :d="star4(60, 7.5, 5)"
        :fill="theme.gems[0]"
        stroke="rgba(29, 27, 40, 0.5)"
        stroke-width="1"
        stroke-linejoin="round"
      />
    </g>

    <!-- 5.5 闪烁星 -->
    <g v-if="theme.twinkle">
      <path
        v-for="(s, i) in STARS"
        :key="i"
        class="ik-tw"
        :style="{ animationDelay: i * 0.6 + 's' }"
        :d="star4(s[0], s[1], 5.5)"
        fill="#ffc53d"
        stroke="rgba(29, 27, 40, 0.45)"
        stroke-width="1.1"
        stroke-linejoin="round"
      />
    </g>
    </svg>
  </div>
</template>

<style scoped>
.border-ring {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.ring-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.st-spin .ring-img {
  animation: ik-spin 8s linear infinite;
}

.st-pulse {
  animation: ik-pulse-ring 2s ease-in-out infinite;
}

.st-pulse .ring-img {
  animation: ik-pulse-ring 2s ease-in-out infinite;
}

.ik-sweepg {
  animation: ik-sweep 5.5s linear infinite;
  transform-origin: 60px 60px;
}

.ik-slowspin {
  animation: ik-spin 14s linear infinite;
  transform-origin: 60px 60px;
}

.ik-crown {
  transform-box: fill-box;
  transform-origin: center;
  animation: ik-float 3s ease-in-out infinite;
}

.ik-tw {
  transform-box: fill-box;
  transform-origin: center;
  animation: ik-twinkle 2.4s ease-in-out infinite;
}
</style>
