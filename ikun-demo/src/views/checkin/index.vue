<script setup>
// 打卡页:每日签到 +5 贡献 → 等级判定 → 解锁边框(流程2);日历与活动打卡
// 桌面双列:左(今日+数据+活动) 右(日历)
import { computed, onMounted } from 'vue'
import { showNotify, showToast } from 'vant'
import { Bird, CalendarCheck, Flame, CalendarDays, Megaphone } from 'lucide-vue-next'
import CheckinCalendar from '@/components/CheckinCalendar.vue'
import { useUserStore, dayKey } from '@/stores/user'
import { useLevelStore } from '@/stores/level'
import { useBorderStore } from '@/stores/border'
import { useNotifyStore } from '@/stores/notify'
import { useAdminStore } from '@/stores/admin'
import { findBorder } from '@/mock/borders'

const user = useUserStore()
const level = useLevelStore()
const border = useBorderStore()
const notify = useNotifyStore()
const admin = useAdminStore()

const activities = computed(() => admin.activities)

onMounted(() => {
  border.syncDefault()
  admin.restore()
})

// 连续打卡天数(今天没打则从昨天起算)
const streak = computed(() => {
  const set = new Set(user.checkins)
  const d = new Date()
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (set.has(dayKey(d))) {
    n += 1
    d.setDate(d.getDate() - 1)
  }
  return n
})

function doCheckin() {
  const before = level.info
  const res = user.checkinToday()
  if (!res.ok) {
    showToast(res.msg)
    return
  }
  border.syncDefault()
  const after = level.info
  if (after.level > before.level) {
    showNotify({
      type: 'success',
      message: `恭喜升级「${after.title}」!解锁新边框「${findBorder(after.borderId)?.name || '神秘环'}」`,
    })
    notify.push('levelup', '恭喜升级', `打卡达成,你已晋升「${after.title}」`)
    notify.push('border', '解锁新边框', `「${findBorder(after.borderId)?.name || '神秘环'}」已解锁,去「我的-边框选择」换上吧`)
  } else {
    showToast('+5 贡献值')
  }
}

function joinActivity(a) {
  user.joinLeaveActivity(a.id)
  showToast(a.participations?.includes(a.id) ? '已取消参与' : '参与成功,记录已同步到你的主页')
}
</script>

<template>
  <div class="page checkin">
    <div class="layout">
      <div class="col">
        <!-- 今日打卡 -->
        <div class="today ik-card" :class="{ done: user.checkedToday }">
          <div class="today-left">
            <span class="today-icon">
              <CalendarCheck v-if="user.checkedToday" :size="30" :stroke-width="2.2" />
              <Bird v-else :size="30" :stroke-width="2.2" />
            </span>
            <div>
              <b>{{ user.checkedToday ? '今日已打卡' : '今天还没打卡' }}</b>
              <span class="streak"><Flame :size="12" :stroke-width="2.6" /> 已连续 {{ streak }} 天</span>
            </div>
          </div>
          <button class="ik-btn" :class="{ 'is-disabled': user.checkedToday }" @click="doCheckin">
            {{ user.checkedToday ? '明天再来' : '打卡 +5' }}
          </button>
        </div>

        <!-- 三项数据 -->
        <div class="stats">
          <div class="stat ik-card">
            <b>{{ user.checkinDays }}</b>
            <span>累计打卡</span>
          </div>
          <div class="stat ik-card">
            <b>{{ user.contribution }}</b>
            <span>贡献值</span>
          </div>
          <div class="stat ik-card">
            <b>{{ user.featured }}</b>
            <span>加精帖</span>
          </div>
        </div>

        <!-- 活动打卡 -->
        <div class="ik-sec">
          <b><Megaphone :size="17" :stroke-width="2.4" /> 活动打卡</b>
          <span>按活动规则奖励贡献值</span>
        </div>
        <div v-for="a in activities" :key="a.id" class="act ik-card">
          <div class="act-top">
            <b>{{ a.title }}</b>
            <span class="ik-chip">{{ a.status }}</span>
          </div>
          <p class="act-desc">{{ a.desc }}</p>
          <div class="act-foot">
            <span class="act-reward">{{ a.reward }} · {{ a.deadline }}</span>
            <button
              class="ik-btn small"
              :class="{ ghost: user.participations.includes(a.id) }"
              @click="joinActivity(a)"
            >
              {{ user.participations.includes(a.id) ? '已参与·取消' : '参与' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 日历 -->
      <div class="col">
        <div class="ik-card cal-card">
          <div class="cal-title"><CalendarDays :size="16" :stroke-width="2.4" /> 打卡日历</div>
          <CheckinCalendar :checked="user.checkins" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.checkin {
  padding-top: 16px;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.today {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, var(--cream), var(--paper-warm));

  &.done {
    background: linear-gradient(135deg, #e9f9f0, #d9f3e5);
  }

  .today-left {
    display: flex;
    align-items: center;
    gap: 10px;

    b {
      display: block;
      font-size: 16px;
    }

    .streak {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 3px;
      font-size: 11px;
      color: var(--text-2);
    }
  }

  .today-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    color: var(--ink);
    background: var(--card);
    border: 1px solid var(--line-strong);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
  }
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 12px 0;

  .stat {
    padding: 14px 6px;
    text-align: center;

    b {
      display: block;
      font-size: 22px;
      font-weight: 900;
    }

    span {
      font-size: 11px;
      color: var(--text-2);
    }
  }
}

.cal-card {
  padding: 14px;
  margin-top: 6px;

  .cal-title {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 10px;
  }
}

.act {
  padding: 14px;
  margin-bottom: 12px;

  .act-top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    b {
      font-size: 15px;
    }
  }

  .act-desc {
    margin-top: 7px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-2);
  }

  .act-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;

    .act-reward {
      font-size: 11px;
      font-weight: 700;
      color: var(--yellow-deep);
    }

    .small {
      padding: 7px 16px;
      font-size: 12px;
    }
  }
}

@media (min-width: 1200px) {
  .layout {
    grid-template-columns: minmax(0, 7fr) minmax(320px, 5fr);
    gap: 20px;
    align-items: start;
  }

  .cal-card {
    position: sticky;
    top: 24px;
    margin-top: 0;
  }
}
</style>
