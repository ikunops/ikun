<script setup>
// AvatarWithBorder —— 圆形头像 + 等级边框 + 工种/边框徽章(Lucide)
// 几何契约:ring inset 0(环内缘直径 96/120),头像圆 inset 10%(直径 96/120)——环内缘正好咬住头像
import { computed } from 'vue'
import { Feather, Shield, Crown } from 'lucide-vue-next'
import KunChicken from './KunChicken.vue'
import BorderRing from './BorderRing.vue'
import { findAvatar, avatarImage, categoryOf } from '@/mock/avatars'
import { findBorder } from '@/mock/borders'
import { AVATAR_ICONS } from './avatarIcons'

const BADGE_ICONS = { feather: Feather, shield: Shield, crown: Crown }

const props = defineProps({
  avatarCode: { type: String, default: '' },
  avatarType: { type: String, default: 'default' },
  customAvatar: { type: String, default: '' },
  borderId: { type: String, default: '' },
  size: { type: Number, default: 56 },
  showBadge: { type: Boolean, default: true },
})

const avatar = computed(() => findAvatar(props.avatarCode))
const bg = computed(() => categoryOf(avatar.value.category).bg)
const border = computed(() => (props.borderId ? findBorder(props.borderId) : null))
const accIcon = computed(() => AVATAR_ICONS[props.avatarCode] || null)
const borderBadge = computed(() =>
  border.value && border.value.badge ? BADGE_ICONS[border.value.badge] : null
)
const image = computed(() => avatarImage(props.avatarCode))
</script>

<template>
  <div class="awb" :style="{ width: size + 'px', height: size + 'px' }">
    <BorderRing v-if="border" class="awb-ring" :border="border" />
    <div class="awb-inner">
      <img v-if="avatarType === 'custom' && customAvatar" :src="customAvatar" alt="自定义头像" />
      <img v-else-if="image" :src="image" :alt="avatar.job + '头像'" />
      <KunChicken v-else :bg="bg" />
    </div>

    <span v-if="showBadge && avatarType === 'default' && accIcon" class="awb-badge">
      <component :is="accIcon" :size="Math.round(size * 0.24)" :stroke-width="2.4" />
    </span>

    <span v-if="borderBadge" class="awb-crest">
      <component :is="borderBadge" :size="Math.round(size * 0.22)" :stroke-width="2.4" />
    </span>
  </div>
</template>

<style scoped>
.awb {
  position: relative;
  flex-shrink: 0;
}

.awb-ring {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.awb-inner {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  background: var(--card);
}

.awb-inner img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.awb-badge {
  position: absolute;
  right: -2%;
  top: -2%;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32%;
  height: 32%;
  color: var(--ink);
  background: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}

.awb-crest {
  position: absolute;
  left: 50%;
  top: -7%;
  z-index: 4;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30%;
  height: 30%;
  color: var(--ink);
  background: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}
</style>
