<script setup>
// IkonBadge —— i/k/u/n 四字母点亮徽章
// lit: 已点亮字母数(Lv1→1 ... Lv4→4),点亮时按等级色填充并发光
import { computed } from 'vue'

const props = defineProps({
  lit: { type: Number, default: 0 },
  size: { type: Number, default: 56 },
  color: { type: String, default: '#ffc53d' },
})

const LETTERS = ['i', 'k', 'u', 'n']
const uid = Math.random().toString(36).slice(2, 8)

const gradientId = computed(() => `ikg-${uid}`)
</script>

<template>
  <div class="ikon-badge" :style="{ gap: size * 0.12 + 'px' }">
    <svg
      v-for="(ch, i) in LETTERS"
      :key="ch"
      class="letter"
      :class="{ 'is-lit': i < lit }"
      :width="size"
      :height="size"
      viewBox="0 0 48 48"
    >
      <defs>
        <linearGradient :id="`${gradientId}-${i}`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" :stop-color="color" />
          <stop offset="1" :stop-color="color" stop-opacity="0.72" />
        </linearGradient>
      </defs>
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12"
        :fill="i < lit ? `url(#${gradientId}-${i})` : '#f4f2ec'"
        :stroke="i < lit ? 'rgba(29, 27, 40, 0.22)' : 'rgba(29, 27, 40, 0.1)'"
        stroke-width="1.5"
      />
      <text
        x="24"
        y="34"
        text-anchor="middle"
        font-size="27"
        font-weight="900"
        :fill="i < lit ? '#ffffff' : '#b9b5c4'"
      >
        {{ ch }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.ikon-badge {
  display: inline-flex;
  align-items: center;
}

.letter {
  display: block;
  flex-shrink: 0;
}

.letter.is-lit {
  filter: drop-shadow(0 2px 5px rgba(29, 27, 40, 0.18));
  animation: ik-pop 0.35s ease both;
}

.letter text {
  font-family: inherit;
}
</style>
