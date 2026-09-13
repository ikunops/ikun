<script setup>
// 头像管理:30 工种库维护 + 新增自定义工种头像(图片压缩 128px 入库)
import { computed, onMounted, ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { ImagePlus, Plus, Trash2, Undo2 } from 'lucide-vue-next'
import AvatarWithBorder from '@/components/AvatarWithBorder.vue'
import { allAvatars, DEFAULT_AVATARS as SEEDS } from '@/mock/avatars'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const job = ref('')
const fileRef = ref(null)
const pendingImg = ref('') // 待提交的 dataURL

onMounted(() => admin.restore())

const list = computed(() => allAvatars())

function pick() {
  fileRef.value?.click()
}

function onFile(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    c.getContext('2d').drawImage(img, 0, 0, 128, 128)
    URL.revokeObjectURL(url)
    pendingImg.value = c.toDataURL('image/jpeg', 0.82)
  }
  img.src = url
}

function add() {
  if (!job.value.trim()) {
    showToast('先填工种名称')
    return
  }
  if (!pendingImg.value) {
    showToast('先选一张头像图片')
    return
  }
  const code = admin.addCustomAvatar(job.value.trim(), pendingImg.value)
  job.value = ''
  pendingImg.value = ''
  showToast(`已新增 ${code},用户端头像选择页「管理员定制」可见`)
}

async function remove(a) {
  if (!a.custom) {
    try {
      await showConfirmDialog({
        title: '删除预置头像',
        message: `「${a.job}(${a.code})」是预置工种头像,使用它的用户将回退为第一个工种。可在下方回收站一键恢复。确定删除?`,
        confirmButtonText: '删除',
      })
    } catch (e) {
      return
    }
    admin.removeSeedAvatar(a.code)
    showToast(`已删除「${a.job}」,可在回收站恢复`)
    return
  }
  admin.removeCustomAvatar(a.code)
  showToast(`已删除「${a.job}」`)
}
</script>

<template>
  <div class="am">
    <header class="page-head">
      <div>
        <h1>头像管理</h1>
        <p>工种库 {{ list.length }} 个 · 新增头像进「管理员定制」分类,删除仅限自定义</p>
      </div>
    </header>

    <section class="panel">
      <b class="panel-title"><Plus :size="15" :stroke-width="2.4" /> 新增工种头像</b>
      <div class="form">
        <input v-model="job" type="text" maxlength="8" placeholder="工种名称(如:应援画家)" class="inp" />
        <button class="pub" @click="pick">
          <ImagePlus :size="14" :stroke-width="2.4" /> {{ pendingImg ? '重选图片' : '选图片' }}
        </button>
        <img v-if="pendingImg" :src="pendingImg" class="preview" alt="预览" />
        <button class="pub" :disabled="!pendingImg" @click="add">新增</button>
        <input ref="fileRef" type="file" accept="image/*" hidden @change="onFile" />
      </div>
    </section>

    <section class="panel">
      <b class="panel-title">工种库</b>
      <div class="grid">
        <div v-for="a in list" :key="a.code" class="cell" :class="{ custom: a.custom }">
          <AvatarWithBorder :avatar-code="a.code" :size="52" :show-badge="false" />
          <b class="job">{{ a.job }}</b>
          <span class="code mono">{{ a.code }}</span>
          <button class="del" @click="remove(a)">
            <Trash2 :size="12" :stroke-width="2.4" />
          </button>
        </div>
      </div>
    </section>

    <!-- 回收站:被删除的预置头像 -->
    <section v-if="admin.deletedAvatarCodes.length" class="panel trash">
      <b class="panel-title"><Undo2 :size="15" :stroke-width="2.4" /> 回收站(预置头像)</b>
      <div class="trash-list">
        <span v-for="code in admin.deletedAvatarCodes" :key="code" class="trash-chip">
          {{ SEEDS.find((x) => x.code === code)?.job || code }}
          <button @click="admin.restoreSeedAvatar(code)">恢复</button>
        </span>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.am {
  display: grid;
  gap: 16px;
}

.page-head {
  h1 {
    font-size: 22px;
    font-weight: 900;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-2);
  }
}

.panel {
  padding: 16px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);

  .panel-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 800;
  }
}

.form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;

  .inp {
    padding: 10px 12px;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    outline: none;
    width: 190px;
  }

  .pub {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 800;
    color: #221a05;
    background: var(--brand-grad);
    border: none;
    border-radius: 10px;
    box-shadow: 0 3px 10px rgba(255, 176, 31, 0.35);
    cursor: pointer;

    &:disabled {
      background: var(--line-soft);
      color: var(--gray);
      box-shadow: none;
    }
  }

  .preview {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--line-strong);
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 12px 6px;
  background: var(--bg);
  border-radius: 12px;

  &.custom {
    outline: 1.5px dashed rgba(255, 176, 31, 0.6);
  }

  .job {
    margin-top: 3px;
    font-size: 11px;
    font-weight: 700;
  }

  .code {
    font-size: 9px;
    color: var(--gray);
  }

  .del {
    margin-top: 4px;
    display: inline-flex;
    align-items: center;
    padding: 4px 7px;
    color: var(--red);
    background: rgba(255, 90, 95, 0.08);
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
}

.trash {
  .trash-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .trash-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-2);
    background: var(--bg);
    border-radius: 999px;

    button {
      padding: 2px 10px;
      font-size: 11px;
      font-weight: 800;
      color: #221a05;
      background: var(--brand-grad);
      border: none;
      border-radius: 999px;
      cursor: pointer;
    }
  }
}
</style>
