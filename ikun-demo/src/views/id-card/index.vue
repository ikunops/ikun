<script setup>
// 身份证展示页:点击卡片 3D 翻面;桌面居中限宽
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import IdCard from '@/components/IdCard.vue'
import { useUserStore } from '@/stores/user'
import { useLevelStore } from '@/stores/level'
import { useBorderStore } from '@/stores/border'

const router = useRouter()
const user = useUserStore()
const level = useLevelStore()
const border = useBorderStore()

const flipped = ref(false)

onMounted(() => border.syncDefault())
</script>

<template>
  <div class="idc-page">
    <van-nav-bar title="我的身份证" left-arrow @click-left="router.back()" />

    <div class="wrap" @click="flipped = !flipped">
      <IdCard
        :nickname="user.nickname"
        :id-number="user.idNumber"
        :avatar-code="user.avatarCode"
        :avatar-type="user.avatarType"
        :custom-avatar="user.customAvatar"
        :border-id="border.currentId || level.info.borderId || 'b-gray'"
        :title="level.info.title"
        :color="level.info.color"
        :lv-label="`Lv.${level.info.level}`"
        :letters="level.info.letters"
        :joined-at="user.joinedAt"
        :flipped="flipped"
        :stamped="true"
      />
    </div>

    <p class="hint">点击卡片翻面 · 长按或截图保存</p>
  </div>
</template>

<style scoped lang="scss">
.idc-page {
  min-height: 100vh;
}

.wrap {
  max-width: 520px;
  margin: 0 auto;
  padding: 26px 24px;
  cursor: pointer;
}

.hint {
  text-align: center;
  font-size: 12px;
  color: var(--text-2);
}
</style>
