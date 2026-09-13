<script setup>
// 消息中心:系统通知(升级/解锁边框/发帖/留言)+ 留言板入口(第三期)
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bell,
  Trophy,
  Gem,
  PenLine,
  MessageSquare,
  Megaphone,
  MessagesSquare,
  CheckCheck,
} from 'lucide-vue-next'
import { useNotifyStore } from '@/stores/notify'
import { formatTime } from '@/stores/posts'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const notify = useNotifyStore()
const user = useUserStore()

const ICONS = {
  system: { icon: Megaphone, color: 'var(--blue)' },
  levelup: { icon: Trophy, color: 'var(--gold)' },
  border: { icon: Gem, color: 'var(--purple)' },
  post: { icon: PenLine, color: 'var(--green)' },
  guestbook: { icon: MessageSquare, color: 'var(--red)' },
  comment: { icon: MessageSquare, color: 'var(--cyan)' },
}

const list = computed(() => notify.list)
</script>

<template>
  <div class="page msg">
    <div class="head">
      <div class="head-text">
        <b>消息中心</b>
        <span>升级提醒 / 解锁边框 / 留言回复</span>
      </div>
      <button v-if="notify.unread" class="read-all" @click="notify.markAllRead()">
        <CheckCheck :size="14" :stroke-width="2.4" /> 全部已读
      </button>
    </div>

    <div class="list">
      <div v-for="n in list" :key="n.id" class="item ik-card" :class="{ unread: !n.read }">
        <span class="item-icon" :style="{ color: ICONS[n.type]?.color || 'var(--ink)' }">
          <component :is="ICONS[n.type]?.icon || Bell" :size="20" :stroke-width="2.2" />
        </span>
        <div class="item-body">
          <div class="item-head">
            <b>{{ n.title }}</b>
            <span class="time">{{ formatTime(n) }}</span>
          </div>
          <p>{{ n.text }}</p>
        </div>
        <span v-if="!n.read" class="dot"></span>
      </div>
    </div>

    <!-- 留言板入口 -->
    <button class="gb-entry ik-card" @click="router.push('/guestbook?mine=1')">
      <span class="gb-icon"><MessagesSquare :size="22" :stroke-width="2.2" /></span>
      <div class="gb-text">
        <b>我的留言板</b>
        <p>看看大家给「{{ user.nickname }}」留了什么话</p>
      </div>
      <span class="arrow">›</span>
    </button>
    <button class="gb-entry ik-card" @click="router.push('/guestbook')">
      <span class="gb-icon"><MessagesSquare :size="22" :stroke-width="2.2" /></span>
      <div class="gb-text">
        <b>公开留言墙</b>
        <p>给大长老递话、给全体 ikun 喊话</p>
      </div>
      <span class="arrow">›</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.msg {
  padding-top: 16px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  b {
    display: block;
    font-size: 18px;
    font-weight: 900;
  }

  span {
    font-size: 11px;
    color: var(--text-2);
  }

  .read-all {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--ink);
    background: var(--card);
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    cursor: pointer;
  }
}

.list {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;

  &.unread {
    background: var(--cream);
  }

  .item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: 12px;
  }

  .item-body {
    flex: 1;
    min-width: 0;

    .item-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      b {
        font-size: 14px;
      }

      .time {
        flex-shrink: 0;
        font-size: 10px;
        color: var(--gray);
      }
    }

    p {
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.6;
      color: var(--text-2);
      word-break: break-word;
    }
  }

  .dot {
    position: absolute;
    right: 12px;
    top: 12px;
    width: 9px;
    height: 9px;
    background: var(--red);
    border: 1px solid var(--line-strong);
    border-radius: 50%;
  }
}

.gb-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  text-align: left;

  &:active {
    transform: translate(2px, 2px);
    box-shadow: var(--shadow-sm);
  }

  .gb-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    color: var(--ink);
    background: var(--yellow);
    border: 1px solid var(--line-strong);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
  }

  .gb-text {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 14px;
    }

    p {
      margin-top: 3px;
      font-size: 11px;
      color: var(--text-2);
    }
  }

  .arrow {
    color: var(--gray);
    font-size: 20px;
  }
}
</style>
