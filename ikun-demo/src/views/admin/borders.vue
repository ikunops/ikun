<script setup>
// 边框管理:边框库增删 + 特殊授予(权限:grant_border);预置 10 档锁定,自定义可删
import { computed, onMounted, ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { Gem, Send, Plus, Trash2, Undo2 } from 'lucide-vue-next'
import BorderRing from '@/components/BorderRing.vue'
import { allBorders, BORDERS as SEEDS } from '@/mock/borders'
import { useAdminStore, can } from '@/stores/admin'
import { useUserStore } from '@/stores/user'

const admin = useAdminStore()
const user = useUserStore()

const form = ref({ name: '', level: '', color: '#7c5cff', color2: '#ffb800', style: 'gradient' })
const pendingImg = ref('')
const fileRef = ref(null)
const grantTo = ref('')
const grantBorderId = ref('')

onMounted(() => {
  admin.restore()
  user.restore()
})

const role = computed(() => user.roleType || 'user')
const list = computed(() => allBorders().filter((b) => !b.hidden))

function pick() {
  fileRef.value?.click()
}

// 压成 256px PNG(保透明度,环图必须)
function onFile(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    c.getContext('2d').drawImage(img, 0, 0, 256, 256)
    URL.revokeObjectURL(url)
    pendingImg.value = c.toDataURL('image/png')
  }
  img.src = url
}

function add() {
  const f = form.value
  if (!f.name.trim() || !f.level.trim()) {
    showToast('名称和等级标注必填')
    return
  }
  admin.addCustomBorder({
    id: 'bx' + Date.now(),
    name: f.name.trim(),
    level: f.level.trim(),
    color: f.color,
    color2: !pendingImg.value && f.style === 'gradient' ? f.color2 : undefined,
    style: pendingImg.value ? 'solid' : f.style,
    img: pendingImg.value || undefined,
    custom: true,
  })
  showToast(pendingImg.value ? '图片边框已新增,大长老可在边框选择页换上' : '边框已新增,大长老可在边框选择页换上')
  form.value.name = ''
  form.value.level = ''
  pendingImg.value = ''
}

async function remove(b) {
  if (!b.custom) {
    try {
      await showConfirmDialog({
        title: '删除预置边框',
        message: `「${b.name}」是等级规则引用的预置档,删除后相关用户将暂时无环。可在下方回收站一键恢复。确定删除?`,
        confirmButtonText: '删除',
      })
    } catch (e) {
      return
    }
    admin.removeSeedBorder(b.id)
    showToast(`已删除「${b.name}」,可在回收站恢复`)
    return
  }
  admin.removeCustomBorder(b.id)
  showToast(`已删除「${b.name}」`)
}

function grant() {
  const u = admin.users.find((x) => x.id === Number(grantTo.value))
  const b = list.value.find((x) => x.id === grantBorderId.value)
  if (!u || !b) {
    showToast('选择用户和边框')
    return
  }
  admin.grantBorder(u.id, b.name)
  showToast(`已为「${u.nickname}」授予「${b.name}」`)
  grantTo.value = ''
  grantBorderId.value = ''
}
</script>

<template>
  <div class="bm">
    <header class="page-head">
      <div>
        <h1>边框管理</h1>
        <p>边框库 {{ list.length }} 档 · 预置档随等级解锁,自定义档大长老全解锁</p>
      </div>
    </header>

    <!-- 新增 -->
    <section class="panel">
      <b class="panel-title"><Plus :size="15" :stroke-width="2.4" /> 新增自定义边框</b>
      <div class="form">
        <input v-model="form.name" type="text" maxlength="12" placeholder="名称(如:星耀环)" class="inp" />
        <input v-model="form.level" type="text" maxlength="8" placeholder="等级标注(如:Lv6)" class="inp sm" />
        <button class="pub" :class="{ ghosted: pendingImg }" @click="pick">
          <ImagePlus :size="14" :stroke-width="2.4" /> {{ pendingImg ? '重选边框图' : '上传边框图' }}
        </button>
        <img v-if="pendingImg" :src="pendingImg" class="preview" alt="预览" />
        <template v-if="!pendingImg">
          <label class="color"><input v-model="form.color" type="color" /> 主色</label>
          <label v-if="form.style === 'gradient'" class="color"><input v-model="form.color2" type="color" /> 副色</label>
          <select v-model="form.style" class="sel">
            <option value="solid">纯色</option>
            <option value="gradient">渐变</option>
            <option value="glow">微光</option>
            <option value="pulse">脉冲呼吸</option>
            <option value="spin">炫彩旋转</option>
          </select>
        </template>
        <span v-else class="hint">已选图片,颜色设置不生效</span>
        <button class="pub" @click="add">新增</button>
        <input ref="fileRef" type="file" accept="image/png,image/webp,image/jpeg" hidden @change="onFile" />
      </div>
    </section>

    <!-- 特殊授予 -->
    <section v-if="can(role, 'grant_border')" class="panel">
      <b class="panel-title"><Gem :size="15" :stroke-width="2.4" /> 特殊授予</b>
      <div class="form">
        <select v-model="grantTo" class="sel wide">
          <option value="" disabled>选择用户</option>
          <option v-for="u in admin.users.filter((x) => !x.reserved)" :key="u.id" :value="u.id">
            {{ u.nickname }}({{ u.idNumber }})
          </option>
        </select>
        <select v-model="grantBorderId" class="sel wide">
          <option value="" disabled>选择边框</option>
          <option v-for="b in list" :key="b.id" :value="b.id">{{ b.name }}({{ b.level }})</option>
        </select>
        <button class="pub" @click="grant"><Send :size="14" :stroke-width="2.4" /> 授予</button>
      </div>
    </section>

    <!-- 边框库 -->
    <section class="panel">
      <b class="panel-title">边框库</b>
      <div class="grid">
        <div v-for="b in list" :key="b.id" class="cell" :class="{ custom: b.custom }">
          <div class="ring"><BorderRing :border="b" /></div>
          <b class="name">{{ b.name }}</b>
          <span class="lvl mono">{{ b.level }}</span>
          <button class="del" @click="remove(b)">
            <Trash2 :size="12" :stroke-width="2.4" />
          </button>
        </div>
      </div>
    </section>

    <!-- 回收站:被删除的预置边框 -->
    <section v-if="admin.deletedBorderIds.length" class="panel trash">
      <b class="panel-title"><Undo2 :size="15" :stroke-width="2.4" /> 回收站(预置边框)</b>
      <div class="trash-list">
        <span v-for="id in admin.deletedBorderIds" :key="id" class="trash-chip">
          {{ SEEDS.find((x) => x.id === id)?.name || id }}
          <button @click="admin.restoreSeedBorder(id)">恢复</button>
        </span>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.bm {
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
    width: 170px;

    &.sm {
      width: 120px;
    }
  }

  .sel {
    padding: 10px 12px;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    outline: none;

    &.wide {
      flex: 1;
      min-width: 200px;
    }
  }

  .color {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-2);

    input {
      width: 40px;
      height: 34px;
      padding: 2px;
      border: 1px solid var(--line-strong);
      border-radius: 8px;
      background: var(--bg);
      cursor: pointer;
    }
  }

  .pub {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 800;
    color: #221a05;
    background: var(--brand-grad);
    border: none;
    border-radius: 10px;
    box-shadow: 0 3px 10px rgba(255, 176, 31, 0.35);
    cursor: pointer;

    &.ghosted {
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }
  }

  .preview {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    border: 1px solid var(--line-strong);
    background:
      conic-gradient(#ddd 0 25%, #fff 0 50%, #ddd 0 75%, #fff 0) 0 0/12px 12px;
  }

  .hint {
    font-size: 11px;
    color: var(--gray);
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  background: var(--bg);
  border-radius: 12px;

  &.custom {
    outline: 1.5px dashed rgba(255, 176, 31, 0.6);
  }

  .ring {
    width: 56px;
    height: 56px;
  }

  .name {
    margin-top: 4px;
    font-size: 11px;
    font-weight: 700;
    text-align: center;
  }

  .lvl {
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
