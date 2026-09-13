<script setup>
// 个人中心:身份证入口 + 等级进度 + 功能菜单;桌面双列(左身份/右进度菜单)
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { Bird, Gem, FileText, MessageSquare, Settings, LogOut, Contact, ShieldCheck } from 'lucide-vue-next'
import AvatarWithBorder from '@/components/AvatarWithBorder.vue'
import IkonBadge from '@/components/IkonBadge.vue'
import IdCard from '@/components/IdCard.vue'
import LevelProgress from '@/components/LevelProgress.vue'
import { useUserStore } from '@/stores/user'
import { useLevelStore } from '@/stores/level'
import { useBorderStore } from '@/stores/border'

const router = useRouter()
const user = useUserStore()
const level = useLevelStore()
const border = useBorderStore()

onMounted(() => border.syncDefault())

const MENU = [
  { key: 'avatar', icon: Bird, label: '更换工种头像', action: '/avatar-select' },
  { key: 'border', icon: Gem, label: '边框选择', action: '/border-select' },
  { key: 'posts', icon: FileText, label: '我的动态 / 收藏', action: '/my-content' },
  { key: 'guestbook', icon: MessageSquare, label: '我的留言板', action: '/guestbook?mine=1' },
  { key: 'settings', icon: Settings, label: '设置', action: '/settings' },
]

// 管理入口:大长老(含演示体验号)与核心长老可见
const ADMIN_ENTRY = computed(() => ['grand_elder', 'core_elder'].includes(user.roleType))

function onMenu(item) {
  router.push(item.action)
}

function openLevel() {
  router.push('/level')
}

async function logout() {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '退出将清空本机演示数据(身份证号会被回收),确定吗?',
      confirmButtonText: '退出',
      cancelButtonText: '再玩会',
    })
  } catch (e) {
    return
  }
  user.reset()
  router.replace('/login')
}
</script>

<template>
  <div class="page profile">
    <div class="layout">
      <div class="col">
        <!-- 头部身份卡 -->
        <div
          class="head"
          :style="{ background: `linear-gradient(150deg, ${level.info.color}33, ${level.info.color}66)` }"
        >
          <div class="head-row">
            <AvatarWithBorder
              :avatar-code="user.avatarCode"
              :avatar-type="user.avatarType"
              :custom-avatar="user.customAvatar"
              :border-id="border.currentId || level.info.borderId || 'b-gray'"
              :size="76"
            />
            <div class="head-info">
              <b class="nick">{{ user.nickname }}</b>
              <span class="no mono">{{ user.idNumber }}</span>
              <div class="chips">
                <span class="ik-chip" :style="{ background: level.info.color, color: '#fff' }">
                  {{ level.info.title }}
                </span>
                <span class="ik-chip">Lv.{{ level.info.level }}</span>
              </div>
            </div>
          </div>
          <div class="head-foot">
            <IkonBadge :lit="level.info.letters" :size="22" :color="level.info.color" />
            <span class="join">入教 {{ user.joinedAt }}</span>
          </div>
        </div>

        <!-- 身份证入口 -->
        <div class="idc-entry" @click="router.push('/id-card')">
          <div class="idc-scale">
            <IdCard
              :nickname="user.nickname"
              :id-number="user.idNumber"
              :avatar-code="user.avatarCode"
              :avatar-type="user.avatarType"
              :custom-avatar="user.customAvatar"
              :border-id="border.currentId || level.info.borderId || 'b-gray'"
              :title="level.info.title"
              :color="level.info.color"
              :lv-label="`Lv.${level.info.level}`"
              :letters="level.info.letters"
              :joined-at="user.joinedAt"
              :stamped="true"
            />
          </div>
          <p class="idc-hint"><Contact :size="13" :stroke-width="2.4" /> 点击查看身份证大图(可翻面)</p>
        </div>
      </div>

      <div class="col">
        <!-- 等级进度 -->
        <div class="ik-card lv-card">
          <div class="lv-head" @click="openLevel">
            <b>升级进度</b>
            <span>
              {{ level.next ? `距「${level.next.rule.title}」还差一点` : '已是弟子天花板,长老需大长老任命' }}
            </span>
          </div>
          <template v-if="level.next">
            <LevelProgress :conditions="level.next.conditions" :color="level.info.color" />
            <div class="lv-go" @click="openLevel">查看完整等级体系 →</div>
          </template>
          <div v-else class="lv-max">冲击长老阶梯:打卡≥50 · 贡献≥50 · 加精≥2</div>
        </div>

        <!-- 菜单 -->
        <div class="menu ik-card">
          <button
            v-for="m in MENU"
            :key="m.key"
            class="menu-item"
            @click="onMenu(m)"
          >
            <span class="mi-icon"><component :is="m.icon" :size="18" :stroke-width="2.2" /></span>
            <span class="mi-label">{{ m.label }}</span>
            <span class="mi-arrow">›</span>
          </button>
          <button v-if="ADMIN_ENTRY" class="menu-item admin" @click="router.push('/admin')">
            <span class="mi-icon"><ShieldCheck :size="18" :stroke-width="2.2" /></span>
            <span class="mi-label">管理后台</span>
            <span class="mi-note admin-note">admin</span>
            <span class="mi-arrow">›</span>
          </button>
          <button class="menu-item logout" @click="logout">
            <span class="mi-icon"><LogOut :size="18" :stroke-width="2.2" /></span>
            <span class="mi-label">退出登录(清空演示数据)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile {
  padding-top: 16px;
}

.head {
  border: 1px solid var(--line-strong);
  border-radius: 18px;
  box-shadow: var(--shadow-md);
  padding: 18px 16px;

  .head-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .nick {
    display: block;
    font-size: 20px;
    font-weight: 900;
  }

  .no {
    display: block;
    margin-top: 3px;
    font-size: 12px;
    color: var(--text-2);
  }

  .chips {
    display: flex;
    gap: 6px;
    margin-top: 7px;
  }

  .head-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;

    .join {
      font-size: 11px;
      color: var(--text-2);
    }
  }
}

.idc-entry {
  margin: 14px 0;
  cursor: pointer;

  .idc-scale {
    transform: scale(0.86);
    transform-origin: top center;
  }

  .idc-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-top: 8px;
    font-size: 11px;
    color: var(--text-2);
  }
}

.lv-card {
  padding: 14px;
  margin-bottom: 14px;

  .lv-head {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 8px;

    b {
      font-size: 15px;
    }

    span {
      font-size: 11px;
      color: var(--text-2);
    }
  }

  .lv-go {
    margin-top: 10px;
    font-size: 12px;
    font-weight: 700;
    color: var(--yellow-deep);
  }

  .lv-max {
    font-size: 12px;
    color: var(--text-2);
  }
}

.menu {
  overflow: hidden;

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 14px;
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    background: var(--card);
    border: none;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
    text-align: left;

    &:last-child {
      border-bottom: none;
    }

    &.locked .mi-label {
      color: var(--gray);
    }

    .mi-icon {
      display: flex;
      align-items: center;
      color: var(--ink);
    }

    .mi-label {
      flex: 1;
    }

    .mi-note {
      font-size: 10px;
      color: var(--gray);
      background: var(--line-soft);
      padding: 2px 8px;
      border-radius: 999px;
    }

    .mi-arrow {
      color: var(--gray);
      font-size: 18px;
    }

    &.logout .mi-label {
      color: var(--red);
    }

    &.admin .mi-label {
      color: #7a4d00;
    }

    .admin-note {
      color: #7a4d00;
      background: rgba(255, 184, 0, 0.16);
    }
  }
}

@media (min-width: 1200px) {
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 6fr) minmax(360px, 5fr);
    gap: 24px;
    align-items: start;
  }

  .idc-entry {
    max-width: 480px;
  }
}
</style>
