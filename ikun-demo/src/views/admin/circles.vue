<script setup>
// 圈子管理:板块增删改(删除需板块无动态)
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { FolderPlus, Trash2 } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import { usePostsStore } from '@/stores/posts'

const admin = useAdminStore()
const posts = usePostsStore()
const drafts = ref({})
const newName = ref('')
const newDesc = ref('')

onMounted(() => {
  admin.restore()
  posts.restore()
})

function add() {
  const n = newName.value.trim()
  const d = newDesc.value.trim()
  if (!n || !d) {
    showToast('名称和描述必填')
    return
  }
  admin.addBoard(n, d)
  newName.value = ''
  newDesc.value = ''
  showToast('板块已新增,用户端圈子页可见')
}

function remove(key, name) {
  if (posts.byBoard(key).length) {
    showToast('板块下还有动态,先清空或迁移再删')
    return
  }
  admin.removeBoard(key)
  showToast(`已删除「${name}」`)
}

function save(key) {
  const d = (drafts.value[key] || '').trim()
  if (!d) {
    showToast('描述不能为空')
    return
  }
  admin.setBoardDesc(key, d)
  showToast('描述已更新')
}
</script>

<template>
  <div class="bom">
    <header class="page-head">
      <div>
        <h1>圈子管理</h1>
        <p>板块增删改,用户端实时同步 · 共 {{ admin.boards.length }} 个板块</p>
      </div>
    </header>

    <section class="panel">
      <b class="panel-title"><FolderPlus :size="15" :stroke-width="2.4" /> 新增板块</b>
      <div class="form">
        <input v-model="newName" type="text" maxlength="8" placeholder="板块名称" class="inp" />
        <input v-model="newDesc" type="text" maxlength="24" placeholder="板块描述" class="inp wide" />
        <button class="pub" @click="add">新增</button>
      </div>
    </section>

    <section class="panel">
      <b class="panel-title">板块列表</b>
      <div v-for="b in admin.boards" :key="b.key" class="row">
        <b class="name">{{ b.name }}</b>
        <input v-model="drafts[b.key]" type="text" :placeholder="b.desc" class="desc" />
        <button class="save" @click="save(b.key)">保存</button>
        <span class="count">{{ posts.byBoard(b.key).length }} 条动态</span>
        <button class="del" @click="remove(b.key, b.name)"><Trash2 :size="14" :stroke-width="2.4" /></button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.bom {
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

  .inp {
    padding: 10px 12px;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    outline: none;
    width: 160px;

    &.wide {
      flex: 1;
      min-width: 200px;
    }
  }

  .pub {
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 800;
    color: #221a05;
    background: var(--brand-grad);
    border: none;
    border-radius: 10px;
    box-shadow: 0 3px 10px rgba(255, 176, 31, 0.35);
    cursor: pointer;
  }
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);

  &:last-child {
    border-bottom: none;
  }

  .name {
    width: 72px;
    flex-shrink: 0;
    font-size: 13px;
  }

  .desc {
    flex: 1;
    min-width: 0;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: 9px;
    outline: none;
  }

  .save {
    flex-shrink: 0;
    padding: 7px 13px;
    font-size: 12px;
    font-weight: 700;
    color: #221a05;
    background: var(--brand-grad);
    border: none;
    border-radius: 9px;
    cursor: pointer;
  }

  .count {
    flex-shrink: 0;
    width: 64px;
    text-align: right;
    font-size: 11px;
    color: var(--text-2);
  }

  .del {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 7px;
    color: var(--red);
    background: rgba(255, 90, 95, 0.08);
    border: none;
    border-radius: 9px;
    cursor: pointer;
  }
}
</style>
