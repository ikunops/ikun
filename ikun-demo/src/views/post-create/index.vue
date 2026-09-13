<script setup>
// 发帖页:选板块 + 文字 + 配图(≤3张,压缩存储);发帖 +5 贡献,触发升级检查
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { ImagePlus, Delete, PenLine, Globe, UsersRound, Lock } from 'lucide-vue-next'
import { usePostsStore } from '@/stores/posts'
import { useUserStore } from '@/stores/user'
import { useLevelStore } from '@/stores/level'
import { useBorderStore } from '@/stores/border'
import { useNotifyStore } from '@/stores/notify'
import { useAdminStore } from '@/stores/admin'
import { findBorder } from '@/mock/borders'

const route = useRoute()
const router = useRouter()
const posts = usePostsStore()
const user = useUserStore()
const level = useLevelStore()
const border = useBorderStore()
const notify = useNotifyStore()
const admin = useAdminStore()

const board = ref(route.query.board ? String(route.query.board) : 'meitu')
const content = ref('')
const visibility = ref('public') // public | friends | private
const VIS = [
  { v: 'public', label: '公开', icon: Globe },
  { v: 'friends', label: '好友', icon: UsersRound },
  { v: 'private', label: '私密', icon: Lock },
]
const images = ref([]) // dataURL 列表
const fileRef = ref(null)
const posting = ref(false)

const canPost = computed(() => content.value.trim().length >= 2 && !posting.value)

function openFile() {
  if (images.value.length >= 3) {
    showToast('最多配 3 张图')
    return
  }
  fileRef.value?.click()
}

function compress(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 720
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.8))
    }
    img.src = url
  })
}

async function onFile(e) {
  const files = Array.from(e.target.files || [])
  e.target.value = ''
  for (const f of files) {
    if (images.value.length >= 3) {
      showToast('最多配 3 张图')
      break
    }
    images.value.push(await compress(f))
  }
}

function removeImage(i) {
  images.value.splice(i, 1)
}

function submit() {
  if (!canPost.value) {
    showToast('写点什么吧(至少 2 个字)')
    return
  }
  posting.value = true
  const before = level.info
  posts.addPost({ board: board.value, content: content.value.trim(), images: [...images.value], visibility: visibility.value })
  border.syncDefault()
  const after = level.info
  if (after.level > before.level) {
    notify.push('levelup', '恭喜升级', `你已晋升「${after.title}」,解锁边框「${findBorder(after.borderId)?.name || '神秘环'}」`)
  }
  showToast('发布成功,贡献值 +5')
  setTimeout(() => router.replace('/circles/' + board.value), 600)
}
</script>

<template>
  <div class="page pc-create">
    <van-nav-bar title="发动态" left-arrow @click-left="router.back()" />

    <!-- 可见性 -->
    <div class="sec-label"><Globe :size="14" :stroke-width="2.4" /> 谁可以看</div>
    <div class="chips">
      <button
        v-for="v in VIS"
        :key="v.v"
        class="chip"
        :class="{ active: visibility === v.v }"
        @click="visibility = v.v"
      >
        <component :is="v.icon" :size="13" :stroke-width="2.4" />
        {{ v.label }}
      </button>
    </div>

    <!-- 板块选择 -->
    <div class="sec-label"><PenLine :size="14" :stroke-width="2.4" /> 选择板块</div>
    <div class="chips">
      <button
        v-for="b in admin.boards"
        :key="b.key"
        class="chip"
        :class="{ active: board === b.key }"
        @click="board = b.key"
      >
        {{ b.name }}
      </button>
    </div>

    <!-- 正文 -->
    <div class="editor ik-card">
      <textarea
        v-model="content"
        rows="6"
        maxlength="500"
        placeholder="分享你的坤圈日常…(2-500 字)"
      ></textarea>
      <span class="count">{{ content.length }}/500</span>
    </div>

    <!-- 配图 -->
    <div class="sec-label">添加配图(最多 3 张)</div>
    <div class="imgs">
      <div v-for="(img, i) in images" :key="i" class="img-cell">
        <img :src="img" alt="配图" />
        <button class="img-del" @click="removeImage(i)"><Delete :size="14" :stroke-width="2.6" /></button>
      </div>
      <button v-if="images.length < 3" class="img-cell add" @click="openFile">
        <ImagePlus :size="26" :stroke-width="2" />
        <span>添加</span>
      </button>
      <input ref="fileRef" type="file" accept="image/*" multiple hidden @change="onFile" />
    </div>

    <div class="footer">
      <button class="ik-btn is-block" :class="{ 'is-disabled': !canPost }" @click="submit">
        发布(贡献值 +5)
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pc-create {
  padding-top: 0;
  padding-bottom: 110px;
}

.sec-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 16px 0 8px;
  font-size: 13px;
  font-weight: 800;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  padding: 8px 16px;
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

.editor {
  position: relative;
  margin-top: 4px;
  padding: 12px;

  textarea {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    font-size: 15px;
    line-height: 1.7;
    color: var(--text);
    font-family: inherit;
  }

  .count {
    display: block;
    text-align: right;
    font-size: 10px;
    color: var(--gray);
  }
}

.imgs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.img-cell {
  position: relative;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--line-strong);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.add {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--gray);
    background: var(--card);
    border-style: dashed;
    border-color: var(--gray);
    cursor: pointer;

    span {
      font-size: 11px;
    }
  }
}

.img-del {
  position: absolute;
  right: 6px;
  top: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(38, 35, 56, 0.85);
  border: none;
  border-radius: 50%;
  cursor: pointer;
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
}
</style>
