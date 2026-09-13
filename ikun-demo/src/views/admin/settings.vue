<script setup>
// 系统设置:站点公告(首页 banner)+ 操作日志
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { useAdminStore } from '@/stores/admin'
import { formatTime } from '@/stores/posts'

const admin = useAdminStore()
const draft = ref('')

onMounted(() => {
  admin.restore()
  draft.value = admin.announcement
})

function save() {
  admin.setAnnouncement(draft.value.trim())
  showToast('公告已更新,首页顶部可见')
}
</script>

<template>
  <div class="ss">
    <header class="page-head">
      <div>
        <h1>系统设置</h1>
        <p>站点公告与操作日志</p>
      </div>
    </header>

    <section class="panel">
      <b class="panel-title">站点公告(展示在首页顶部)</b>
      <div class="form">
        <input v-model="draft" type="text" maxlength="30" placeholder="留空则不展示" class="inp" />
        <button class="pub" @click="save">保存</button>
      </div>
    </section>

    <section class="panel">
      <b class="panel-title">操作日志({{ admin.logs.length }})</b>
      <div v-if="!admin.logs.length" class="empty">暂无操作记录</div>
      <div v-for="l in admin.logs" :key="l.id" class="log-row">
        <span class="log-text">{{ l.text }}</span>
        <span class="log-time">{{ formatTime(l) }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.ss {
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
    display: block;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 800;
  }
}

.form {
  display: flex;
  gap: 10px;

  .inp {
    flex: 1;
    padding: 10px 12px;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    outline: none;
  }

  .pub {
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 800;
    color: #221a05;
    background: var(--brand-grad);
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }
}

.empty {
  padding: 18px;
  font-size: 12px;
  color: var(--gray);
  text-align: center;
  background: var(--bg);
  border-radius: 10px;
}

.log-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--line);
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }

  .log-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .log-time {
    flex-shrink: 0;
    font-size: 10px;
    color: var(--gray);
  }
}
</style>
