<script setup>
// 消息管理:发送系统通知 + 最近通知列表
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { Send } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import { useNotifyStore } from '@/stores/notify'
import { formatTime } from '@/stores/posts'

const admin = useAdminStore()
const notify = useNotifyStore()
const title = ref('')
const text = ref('')

onMounted(() => {
  admin.restore()
  notify.restore()
})

function send() {
  const t = title.value.trim()
  const x = text.value.trim()
  if (!t || !x) {
    showToast('标题和内容必填')
    return
  }
  notify.push('system', t, x)
  admin.log(`发布了系统通知「${t}」`)
  title.value = ''
  text.value = ''
  showToast('通知已发送,用户端消息中心可见')
}
</script>

<template>
  <div class="mm">
    <header class="page-head">
      <div>
        <h1>消息管理</h1>
        <p>系统通知直达用户消息中心,未读红点提醒</p>
      </div>
    </header>

    <section class="panel">
      <b class="panel-title">发送系统通知</b>
      <div class="form">
        <input v-model="title" type="text" maxlength="20" placeholder="标题" class="inp" />
        <input v-model="text" type="text" maxlength="80" placeholder="通知内容" class="inp wide" />
        <button class="pub" @click="send"><Send :size="14" :stroke-width="2.4" /> 发送</button>
      </div>
    </section>

    <section class="panel">
      <b class="panel-title">最近通知({{ notify.list.length }})</b>
      <div v-for="n in notify.list.slice(0, 12)" :key="n.id" class="n-row">
        <b>{{ n.title }}</b>
        <p>{{ n.text }}</p>
        <span class="time">{{ formatTime(n) }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.mm {
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
  flex-wrap: wrap;

  .inp {
    padding: 10px 12px;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    outline: none;
    width: 200px;

    &.wide {
      flex: 1;
      min-width: 240px;
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
    cursor: pointer;
  }
}

.n-row {
  padding: 9px 0;
  border-bottom: 1px solid var(--line);

  &:last-child {
    border-bottom: none;
  }

  b {
    font-size: 13px;
  }

  p {
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-2);
  }

  .time {
    display: block;
    margin-top: 2px;
    font-size: 10px;
    color: var(--gray);
  }
}
</style>
