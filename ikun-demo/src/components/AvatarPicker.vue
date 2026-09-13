<script setup>
// AvatarPicker —— 30 工种默认头像选择器 + 自定义上传(网格随断点 3→4→6 列)
import { computed, ref } from 'vue'
import { Check, ImagePlus } from 'lucide-vue-next'
import KunChicken from './KunChicken.vue'
import { AVATAR_CATEGORIES, allAvatars, avatarImage } from '@/mock/avatars'
import { AVATAR_ICONS } from './avatarIcons'

const props = defineProps({
  modelCode: { type: String, default: '' },
  modelCustom: { type: String, default: '' },
  modelType: { type: String, default: 'default' },
})

const emit = defineEmits(['select'])

const activeCat = ref('A')
const fileRef = ref(null)

const list = computed(() => allAvatars().filter((a) => a.category === activeCat.value))

function bgOf(code) {
  const a = allAvatars().find((x) => x.code === code)
  return categoryBg(a ? a.category : 'A')
}

const categoryBg = (key) => findCategory(key).bg
const imgOf = (code) => avatarImage(code)

function findCategory(key) {
  return AVATAR_CATEGORIES.find((c) => c.key === key) || AVATAR_CATEGORIES[0]
}

function pick(code) {
  emit('select', { type: 'default', code })
}

function openFile() {
  fileRef.value?.click()
}

function onFile(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => emit('select', { type: 'custom', dataUrl: String(reader.result) })
  reader.readAsDataURL(file)
  e.target.value = ''
}
</script>

<template>
  <div class="ap">
    <div class="ap-cats">
      <button
        v-for="c in AVATAR_CATEGORIES"
        :key="c.key"
        class="ap-cat"
        :class="{ active: activeCat === c.key }"
        @click="activeCat = c.key"
      >
        {{ c.name }}
      </button>
    </div>

    <div class="ap-grid">
      <div
        v-for="a in list"
        :key="a.code"
        class="ap-cell"
        :class="{ selected: modelType === 'default' && modelCode === a.code }"
        @click="pick(a.code)"
      >
        <div class="ap-ava">
          <div class="ap-pic">
            <img v-if="imgOf(a.code)" :src="imgOf(a.code)" :alt="a.job + '头像'" />
            <KunChicken v-else :bg="bgOf(a.code)" />
          </div>
          <span class="ap-badge">
            <component :is="AVATAR_ICONS[a.code]" :size="16" :stroke-width="2.4" />
          </span>
          <span v-if="modelType === 'default' && modelCode === a.code" class="ap-check">
            <Check :size="12" :stroke-width="3.2" />
          </span>
        </div>
        <span class="ap-job">{{ a.job }}</span>
        <span class="ap-code mono">{{ a.code }}</span>
      </div>

      <!-- 自定义上传 -->
      <div class="ap-cell" :class="{ selected: modelType === 'custom' }" @click="openFile">
        <div class="ap-ava">
          <div class="ap-pic custom">
            <img v-if="modelType === 'custom' && modelCustom" :src="modelCustom" alt="自定义头像" />
            <ImagePlus v-else :size="26" :stroke-width="2" />
          </div>
          <span v-if="modelType === 'custom'" class="ap-check">
            <Check :size="12" :stroke-width="3.2" />
          </span>
        </div>
        <span class="ap-job">自定义</span>
        <span class="ap-code mono">UP</span>
        <input ref="fileRef" type="file" accept="image/*" hidden @change="onFile" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ap-cats {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 10px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.ap-cat {
  flex-shrink: 0;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-2);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;

  &.active {
    color: var(--ink);
    background: var(--yellow);
    border-color: rgba(255, 176, 31, 0.6);
    box-shadow: var(--shadow-sm);
  }
}

.ap-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .ap-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

@media (min-width: 1200px) {
  .ap-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.ap-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 6px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.96);
  }

  &.selected {
    background: var(--cream);
    border-color: rgba(255, 176, 31, 0.6);
    box-shadow: var(--shadow-sm);
  }
}

.ap-ava {
  position: relative;
  width: 72px;
  height: 72px;
}

.ap-pic {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  background: #fafaf7;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.custom {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray);
    border-style: dashed;
    border-color: var(--gray);
  }
}

.ap-badge {
  position: absolute;
  right: -6px;
  top: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--ink);
  background: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}

.ap-check {
  position: absolute;
  left: -6px;
  top: -6px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  color: var(--card);
  background: var(--green);
  border: 1px solid var(--line-strong);
  border-radius: 50%;
}

.ap-job {
  font-size: 12px;
  font-weight: 700;
}

.ap-code {
  font-size: 10px;
  color: var(--gray);
}
</style>
