<script setup>
// CheckinCalendar —— 打卡日历:周一为始,标记已打卡日,禁点未来
import { computed, ref } from 'vue'

const props = defineProps({
  checked: { type: Array, default: () => [] },
})

const WEEK = ['一', '二', '三', '四', '五', '六', '日']
const now = new Date()
const view = ref({ y: now.getFullYear(), m: now.getMonth() })

const pad = (n) => String(n).padStart(2, '0')
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const checkedSet = computed(() => new Set(props.checked))
const todayKey = keyOf(now)

const monthLabel = computed(() => `${view.value.y}年${view.value.m + 1}月`)
const isCurrentMonth = computed(
  () => view.value.y === now.getFullYear() && view.value.m === now.getMonth()
)

const cells = computed(() => {
  const first = new Date(view.value.y, view.value.m, 1)
  const offset = (first.getDay() + 6) % 7 // 周一为始
  const daysInMonth = new Date(view.value.y, view.value.m + 1, 0).getDate()
  const arr = Array(offset).fill(null)
  for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(view.value.y, view.value.m, d))
  return arr
})

function shift(delta) {
  const d = new Date(view.value.y, view.value.m + delta, 1)
  view.value = { y: d.getFullYear(), m: d.getMonth() }
}

function stateOf(d) {
  if (!d) return null
  const key = keyOf(d)
  if (key > todayKey) return 'future'
  if (key === todayKey) return checkedSet.value.has(key) ? 'checked today' : 'today'
  return checkedSet.value.has(key) ? 'checked' : 'past'
}
</script>

<template>
  <div class="cal">
    <div class="cal-head">
      <button class="cal-nav" :disabled="false" @click="shift(-1)">‹</button>
      <b>{{ monthLabel }}</b>
      <button class="cal-nav" :disabled="isCurrentMonth" @click="shift(1)">›</button>
    </div>

    <div class="cal-week">
      <span v-for="w in WEEK" :key="w">{{ w }}</span>
    </div>

    <div class="cal-grid">
      <div
        v-for="(d, i) in cells"
        :key="i"
        class="cal-cell"
        :class="stateOf(d)"
      >
        <template v-if="d">{{ d.getDate() }}</template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  b {
    font-size: 15px;
  }
}

.cal-nav {
  width: 30px;
  height: 30px;
  font-size: 16px;
  font-weight: 900;
  color: var(--ink);
  background: #fff;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  cursor: pointer;

  &:disabled {
    color: var(--gray);
    border-color: #e5e1d5;
  }
}

.cal-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;

  span {
    text-align: center;
    font-size: 11px;
    color: var(--text-2);
  }
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cal-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  border-radius: 10px;
  color: var(--text);

  &.future {
    color: #d8d4c8;
  }

  &.today {
    border: 1.5px dashed var(--red);
  }

  &.checked {
    background: var(--yellow);
    border: 1px solid var(--line-strong);
    box-shadow: var(--shadow-sm);
  }

  &.checked.today {
    background: var(--yellow);
  }
}
</style>
