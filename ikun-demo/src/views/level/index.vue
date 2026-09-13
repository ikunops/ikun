<script setup>
// 等级详情:弟子四阶(ikun 字母点亮)+ 长老 5.x 阶梯 + 当前升级进度;桌面双列
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Medal, Landmark, Gem } from 'lucide-vue-next'
import IkonBadge from '@/components/IkonBadge.vue'
import LevelProgress from '@/components/LevelProgress.vue'
import { useUserStore } from '@/stores/user'
import { useLevelStore } from '@/stores/level'
import { useBorderStore } from '@/stores/border'
import { DISCIPLE_LEVELS } from '@/mock/levels'
import { findBorder } from '@/mock/borders'

const router = useRouter()
const user = useUserStore()
const level = useLevelStore()
const border = useBorderStore()

onMounted(() => border.syncDefault())

function condText(r) {
  const parts = [`打卡≥${r.days}天`]
  if (r.contribution > 0) parts.push(`贡献≥${r.contribution}`)
  if (r.featured > 0) parts.push(`加精≥${r.featured}篇`)
  return parts.join(' · ')
}

function discipleState(rule) {
  const s = user.stats
  const ok =
    s.checkinDays >= rule.days && s.contribution >= rule.contribution && s.featured >= rule.featured
  const isCurrent = level.info.level === rule.level
  return { ok, isCurrent }
}

function borderName(id) {
  return findBorder(id)?.name || '—'
}
</script>

<template>
  <div class="page lv-page">
    <van-nav-bar title="等级详情" left-arrow @click-left="router.back()" />

    <div class="layout">
      <div class="col">
        <!-- 当前等级 -->
        <div
          class="cur ik-card"
          :style="{ background: `linear-gradient(150deg, ${level.info.color}26, ${level.info.color}59)` }"
        >
          <div class="cur-badge">
            <IkonBadge :lit="level.info.letters" :size="38" :color="level.info.color" />
          </div>
          <b class="cur-title">{{ level.info.title }}</b>
          <span class="cur-lv mono">Lv.{{ level.info.level }}</span>
          <p class="cur-desc">点亮 i · k · u · n,每一级都是一次成长</p>
        </div>

        <!-- 升级进度 -->
        <div v-if="level.next" class="ik-card prog">
          <div class="prog-head">
            <b>距「{{ level.next.rule.title }}」</b>
            <span class="prog-pct">{{ level.next.progress }}%</span>
          </div>
          <LevelProgress :conditions="level.next.conditions" :color="level.next.rule.color" />
        </div>
      </div>

      <div class="col">
        <!-- 弟子阶梯 -->
        <div class="ik-sec">
          <b><Medal :size="17" :stroke-width="2.4" /> 弟子阶梯</b>
          <span>量化晋升</span>
        </div>
        <div
          v-for="rule in DISCIPLE_LEVELS"
          :key="rule.level"
          class="tier ik-card"
          :class="{ current: discipleState(rule).isCurrent }"
        >
          <IkonBadge :lit="rule.letters" :size="24" :color="rule.color" />
          <div class="tier-mid">
            <b>{{ rule.title }} <i class="mono">Lv.{{ rule.level }}</i></b>
            <p>{{ condText(rule) }}</p>
            <p class="tier-border"><Gem :size="11" :stroke-width="2.4" /> 边框:{{ borderName(rule.borderId) }}</p>
          </div>
          <span v-if="discipleState(rule).ok" class="tier-state ok">已达成</span>
          <span v-else class="tier-state lock">未达成</span>
        </div>

        <!-- 长老阶梯 -->
        <div class="ik-sec">
          <b><Landmark :size="17" :stroke-width="2.4" /> 长老之路</b>
          <span>Lv5 内部细分</span>
        </div>
        <div v-for="e in level.elderLadder" :key="e.subLevel" class="tier ik-card elder">
          <span class="elder-sub mono">{{ e.subLevel }}</span>
          <div class="tier-mid">
            <b>{{ e.title }}</b>
            <p>{{ e.reserved ? e.reserved : condText(e) }}</p>
            <p class="tier-border">
              <Gem :size="11" :stroke-width="2.4" /> {{ borderName(e.borderId) }}
              <span v-if="e.admin" class="admin-tag">管理员</span>
              <span v-if="e.appointed" class="admin-tag appoint">需任命</span>
            </p>
          </div>
          <span class="tier-state lock">锁定</span>
        </div>
        <p class="elder-note">
          长老阶段不靠打卡自然晋升:核心长老由大长老任命,大长老/宗主为系统保留席位(ID=1 / ID=0)。
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lv-page {
  padding-top: 0;
}

.cur {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  margin-top: 12px;

  .cur-title {
    font-size: 22px;
    font-weight: 900;
  }

  .cur-lv {
    font-size: 12px;
    color: var(--text-2);
  }

  .cur-desc {
    font-size: 11px;
    color: var(--text-2);
  }
}

.prog {
  padding: 14px;
  margin-top: 12px;

  .prog-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    b {
      font-size: 14px;
    }

    .prog-pct {
      font-size: 13px;
      font-weight: 900;
      color: var(--yellow-deep);
    }
  }
}

.tier {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;

  &.current {
    background: var(--cream);
    box-shadow: var(--shadow-md);
  }

  .tier-mid {
    flex: 1;
    min-width: 0;

    b {
      font-size: 14px;

      i {
        font-style: normal;
        font-size: 10px;
        color: var(--text-2);
        margin-left: 4px;
      }
    }

    p {
      font-size: 11px;
      color: var(--text-2);
      margin-top: 3px;
    }

    .tier-border {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
  }

  .tier-state {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 800;

    &.ok {
      color: var(--green);
    }

    &.lock {
      color: var(--gray);
    }
  }
}

.admin-tag {
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: var(--purple);
  border-radius: 999px;

  &.appoint {
    background: var(--red);
  }
}

.elder-sub {
  flex-shrink: 0;
  width: 34px;
  text-align: center;
  font-size: 13px;
  font-weight: 900;
  padding: 6px 0;
  background: #f1eee6;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
}

.elder-note {
  font-size: 11px;
  color: var(--gray);
  line-height: 1.7;
  margin-top: 4px;
}

@media (min-width: 1200px) {
  .layout {
    display: grid;
    grid-template-columns: minmax(340px, 5fr) minmax(0, 7fr);
    gap: 24px;
    align-items: start;
  }

  .cur,
  .prog {
    position: sticky;
  }

  .prog {
    top: 24px;
  }
}
</style>
