<script setup>
// 头像选择页:30 工种默认坤鸡头像 + 自定义上传(流程1 第二步);网格随断点扩展
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AvatarPicker from '@/components/AvatarPicker.vue'
import { findAvatar } from '@/mock/avatars'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const user = useUserStore()

const selection = ref(null) // { type:'default', code } | { type:'custom', dataUrl }

onMounted(() => {
  // 重选头像场景:预选当前头像
  if (user.hasIdCard && user.avatarType === 'default' && user.avatarCode) {
    selection.value = { type: 'default', code: user.avatarCode }
  }
})

const confirmText = computed(() => {
  if (!selection.value) return user.hasIdCard ? '选一个头像换上吧' : '先选一个工种头像,领取身份证'
  if (selection.value.type === 'custom') return '使用自定义头像,领取身份证'
  return `以「${findAvatar(selection.value.code).job}」身份领取身份证`
})

function onSelect(sel) {
  selection.value = sel
}

function confirm() {
  if (!selection.value) return
  if (selection.value.type === 'default') user.setAvatar(selection.value.code)
  else user.setCustomAvatar(selection.value.dataUrl)
  router.replace(user.hasIdCard ? '/profile' : '/id-card-issue')
}
</script>

<template>
  <div class="ava-page">
    <van-nav-bar
      :title="user.hasIdCard ? '更换头像' : '选择你的工种头像'"
      :left-arrow="user.hasIdCard"
      @click-left="router.back()"
    />

    <div class="ava-body">
      <p class="lead">30 个工种都是坤系小鸡,选一个最像你的;也可以直接上传自己的照片。</p>

      <AvatarPicker
        :model-code="user.avatarType === 'default' ? user.avatarCode : ''"
        :model-custom="user.customAvatar"
        :model-type="user.avatarType"
        @select="onSelect"
      />
    </div>

    <div class="footer">
      <div class="footer-inner">
        <button class="ik-btn is-block" :class="{ 'is-disabled': !selection }" @click="confirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ava-page {
  min-height: 100vh;
  padding-bottom: 104px;
}

.ava-body {
  max-width: 880px;
  margin: 0 auto;
  padding: 8px 16px;
}

.lead {
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-2);
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
}

.footer-inner {
  max-width: 880px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .ava-page {
    padding-bottom: 96px;
  }
}

@media (min-width: 1200px) {
  // 桌面左侧导航栏占位,底栏跟着让位
  .footer {
    left: 96px;
  }
}
</style>
