<script setup>
// LevelProgress —— 升级条件进度条(打卡天数 / 贡献值 / 加精帖数)
import { Check } from 'lucide-vue-next'

defineProps({
  conditions: { type: Array, default: () => [] },
  color: { type: String, default: '#ffc53d' },
})
</script>

<template>
  <div class="lp">
    <div v-for="c in conditions" :key="c.label" class="lp-row">
      <span class="lp-label">{{ c.label }}</span>
      <van-progress
        class="lp-bar"
        :percentage="Math.min(100, Math.round((c.value / c.target) * 100))"
        :color="c.value >= c.target ? 'var(--green)' : color"
        track-color="var(--line-soft)"
        :show-pivot="false"
      />
      <span class="lp-val" :class="{ done: c.value >= c.target }">
        <template v-if="c.value >= c.target"><Check :size="12" :stroke-width="3" /> 已达成</template>
        <template v-else>{{ c.value }}/{{ c.target }}{{ c.unit }}</template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.lp-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
}

.lp-label {
  width: 62px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
}

.lp-bar {
  flex: 1;
}

.lp-val {
  width: 76px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-2);
}

.lp-val.done {
  color: var(--green);
}
</style>
