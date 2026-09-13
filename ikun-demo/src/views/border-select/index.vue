<script setup>
// 边框选择页:全 10 档边框库,解锁可选/锁定置灰,大预览 + 设为当前(第三期⭐)
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Lock, Check } from 'lucide-vue-next'
import BorderRing from '@/components/BorderRing.vue'
import AvatarWithBorder from '@/components/AvatarWithBorder.vue'
import { useUserStore } from '@/stores/user'
import { useLevelStore } from '@/stores/level'
import { useBorderStore } from '@/stores/border'

const router = useRouter()
const user = useUserStore()
const level = useLevelStore()
const border = useBorderStore()

const picked = ref('')

onMounted(() => {
  border.syncDefault()
  picked.value = border.currentId || level.info.borderId || 'b-gray'
})

const list = computed(() =>
  border.all.map((b) => ({
    ...b,
    unlocked: border.unlockedIds.includes(b.id),
    current: b.id === border.currentId,
    picked: b.id === picked.value,
  }))
)

const preview = computed(() => picked.value)

function pick(id, unlocked) {
  if (!unlocked) {
    showToast('该边框尚未解锁,继续打卡升级吧')
    return
  }
  picked.value = id
}

function confirm() {
  if (border.setCurrent(picked.value)) {
    showToast('边框已更新')
    router.back()
  }
}
</script>

<template>
  <div class="page bs">
    <van-nav-bar title="边框选择" left-arrow @click-left="router.back()" />

    <!-- 大预览 -->
    <div class="preview-wrap">
      <AvatarWithBorder
        :avatar-code="user.avatarCode"
        :avatar-type="user.avatarType"
        :custom-avatar="user.customAvatar"
        :border-id="preview"
        :size="110"
        :show-badge="false"
      />
      <b class="preview-name">{{ border.all.find((b) => b.id === preview)?.name }}</b>
    </div>

    <!-- 边框库 -->
    <div class="grid">
      <div
        v-for="b in list"
        :key="b.id"
        class="cell"
        :class="{ picked: b.picked, locked: !b.unlocked, current: b.current }"
        @click="pick(b.id, b.unlocked)"
      >
        <div class="ring">
          <BorderRing :border="b" />
          <span v-if="!b.unlocked" class="lock"><Lock :size="14" :stroke-width="2.6" /></span>
          <span v-if="b.picked && b.unlocked" class="check"><Check :size="13" :stroke-width="3" /></span>
        </div>
        <b class="name">{{ b.name }}</b>
        <span class="lvl mono">{{ b.level }}</span>
      </div>
    </div>

    <div class="footer">
      <button class="ik-btn is-block" @click="confirm">设为当前边框</button>
      <p class="hint">边框随等级解锁:打卡升级自动点亮新环,大长老也可特别授予</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bs {
  padding-top: 0;
  padding-bottom: 140px;
}

.preview-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 26px 0 18px;

  .preview-name {
    font-size: 15px;
    font-weight: 900;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 12px 6px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  cursor: pointer;

  &.picked {
    background: var(--cream);
    border-color: rgba(255, 176, 31, 0.6);
    box-shadow: var(--shadow-sm);
  }

  &.locked {
    opacity: 0.55;

    .ring {
      filter: grayscale(0.9);
    }
  }

  &.current .name::after {
    content: ' · 当前';
    font-size: 9px;
    color: var(--green);
  }
}

.ring {
  position: relative;
  width: 64px;
  height: 64px;
}

.lock,
.check {
  position: absolute;
  right: -4px;
  top: -4px;
  z-index: 2;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--card);
  background: var(--gray);
  border: 1px solid var(--line-strong);
  border-radius: 50%;
}

.check {
  background: var(--green);
}

.name {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
}

.lvl {
  font-size: 9px;
  color: var(--gray);
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: var(--bg);
  border-top: 1px solid var(--line);

  @media (min-width: 1200px) {
    left: 96px;
  }

  .hint {
    margin-top: 7px;
    text-align: center;
    font-size: 10px;
    color: var(--gray);
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
    max-width: 880px;
  }
}
</style>
