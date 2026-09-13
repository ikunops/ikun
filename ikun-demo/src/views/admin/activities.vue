<script setup>
// 活动运营:发布/结束打卡活动(用户端打卡页同步显示)
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { Megaphone, CircleStop, Trash2 } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const title = ref('')
const desc = ref('')
const reward = ref('+10 贡献值')

onMounted(() => admin.restore())

function publish() {
  const t = title.value.trim()
  const d = desc.value.trim()
  if (!t || !d) {
    showToast('标题和描述必填')
    return
  }
  admin.addActivity({ title: t, desc: d, reward: reward.value.trim() || '+10 贡献值' })
  title.value = ''
  desc.value = ''
  showToast('活动已发布,用户端打卡页可见')
}
</script>

<template>
  <div class="ao">
    <header class="page-head">
      <div>
        <h1>活动运营</h1>
        <p>发布打卡活动,用户端打卡页实时同步</p>
      </div>
    </header>

    <section class="panel">
      <b class="panel-title"><Megaphone :size="15" :stroke-width="2.4" /> 发布新活动</b>
      <div class="form">
        <input v-model="title" type="text" maxlength="20" placeholder="活动标题" class="inp" />
        <input v-model="desc" type="text" maxlength="60" placeholder="活动描述" class="inp wide" />
        <input v-model="reward" type="text" maxlength="16" placeholder="奖励" class="inp" />
        <button class="pub" @click="publish">发布</button>
      </div>
    </section>

    <section class="panel">
      <b class="panel-title">活动列表({{ admin.activities.length }})</b>
      <div v-for="a in admin.activities" :key="a.id" class="act-row">
        <div class="act-main">
          <b>{{ a.title }}</b>
          <p>{{ a.desc }}</p>
          <span class="meta">{{ a.reward }} · {{ a.deadline }}</span>
        </div>
        <button v-if="a.status === '进行中'" class="end" @click="admin.endActivity(a.id)">
          <CircleStop :size="14" :stroke-width="2.4" /> 结束
        </button>
        <span v-else class="done">已结束</span>
        <button v-if="a.status === '已结束'" class="del" @click="admin.deleteActivity(a.id)">
          <Trash2 :size="13" :stroke-width="2.4" />
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.ao {
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
    width: 200px;

    &.wide {
      flex: 1;
      min-width: 240px;
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

.act-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);

  &:last-child {
    border-bottom: none;
  }

  .act-main {
    flex: 1;
    min-width: 0;

    b {
      font-size: 13px;
    }

    p {
      margin-top: 2px;
      font-size: 12px;
      color: var(--text-2);
    }

    .meta {
      display: block;
      margin-top: 2px;
      font-size: 10px;
      color: var(--gray);
    }
  }

  .end {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--red);
    background: rgba(255, 90, 95, 0.08);
    border: none;
    border-radius: 9px;
    cursor: pointer;
  }

  .done {
    font-size: 11px;
    color: var(--gray);
  }

  .del {
    display: flex;
    align-items: center;
    padding: 6px;
    color: var(--red);
    background: rgba(255, 90, 95, 0.08);
    border: none;
    border-radius: 9px;
    cursor: pointer;
  }
}
</style>
