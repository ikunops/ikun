<script setup>
// IdCard —— ikun 社区弟子证:正面编号/称号/照片,背面口号/条码,点击 3D 翻转
import AvatarWithBorder from './AvatarWithBorder.vue'
import IkonBadge from './IkonBadge.vue'

defineProps({
  nickname: { type: String, default: '' },
  idNumber: { type: String, default: '' },
  avatarCode: { type: String, default: '' },
  avatarType: { type: String, default: 'default' },
  customAvatar: { type: String, default: '' },
  borderId: { type: String, default: '' },
  title: { type: String, default: '预备弟子' },
  color: { type: String, default: '#ffc53d' },
  lvLabel: { type: String, default: 'Lv.0' },
  letters: { type: Number, default: 0 },
  joinedAt: { type: String, default: '' },
  flipped: { type: Boolean, default: false },
  stamped: { type: Boolean, default: false },
})
</script>

<template>
  <div class="idc" :class="{ 'is-flipped': flipped }">
    <div class="idc-inner">
      <!-- 正面 -->
      <div class="face front" :style="{ background: `linear-gradient(135deg, ${color}26, ${color}59)` }">
        <div class="idc-brand">
          <AvatarWithBorder avatar-code="A01" :size="26" />
          <div>
            <b>ikun社区 · 弟子证</b>
            <i>天下ikun是一家</i>
          </div>
        </div>

        <div class="idc-main">
          <div class="idc-photo">
            <AvatarWithBorder
              :avatar-code="avatarCode"
              :avatar-type="avatarType"
              :custom-avatar="customAvatar"
              :border-id="borderId"
              :size="72"
            />
          </div>
          <div class="idc-info">
            <div class="idc-no mono">{{ idNumber }}</div>
            <div class="idc-title">
              <span class="ik-chip" :style="{ background: color, color: '#fff' }">{{ title }}</span>
              <span class="ik-chip">{{ lvLabel }}</span>
            </div>
            <div class="idc-join">入教:{{ joinedAt || '——' }}</div>
          </div>
        </div>

        <div class="idc-foot">
          <div class="idc-code">
            <div class="barcode"></div>
            <span class="mono">{{ idNumber }}</span>
          </div>
          <IkonBadge :lit="letters" :size="20" :color="color" />
        </div>

        <div v-if="stamped" class="idc-stamp">
          <svg viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="40" fill="none" stroke="#e0343c" stroke-width="3" stroke-dasharray="4 3" />
            <circle cx="45" cy="45" r="29" fill="none" stroke="#e0343c" stroke-width="1.5" />
            <text x="45" y="43" text-anchor="middle" font-size="15" font-weight="900" fill="#e0343c">ikun</text>
            <text x="45" y="59" text-anchor="middle" font-size="11" font-weight="700" fill="#e0343c">宗门认证</text>
          </svg>
        </div>
      </div>

      <!-- 背面 -->
      <div class="face back">
        <div class="idc-punch"></div>
        <div class="idc-slogan">天下ikun<br />是一家</div>
        <div class="idc-motto">打卡 · 升级 · 点亮 ikun</div>
        <div class="idc-code center">
          <div class="barcode"></div>
          <span class="mono">{{ idNumber }}</span>
        </div>
        <p class="idc-fine">本证为 ikun 社区数字身份凭证 · 等级与边框随打卡成长 · 遗失请找大长老(IKUN-000001)补办</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.idc {
  perspective: 1000px;
  width: 100%;
}

.idc-inner {
  position: relative;
  width: 100%;
  aspect-ratio: 1.6;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0.1, 0.2, 1);
}

.idc.is-flipped .idc-inner {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--line-strong);
  border-radius: 18px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.face.back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #fffdf5, var(--paper-warm));
  align-items: center;
}

// —— 正面 ——
.idc-brand {
  display: flex;
  align-items: center;
  gap: 8px;

  b {
    display: block;
    font-size: 13px;
  }

  i {
    display: block;
    font-style: normal;
    font-size: 10px;
    color: var(--text-2);
  }
}

.idc-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.idc-photo {
  flex-shrink: 0;
}

.idc-info {
  min-width: 0;
}

.idc-no {
  font-size: 20px;
  font-weight: 800;
}

.idc-title {
  display: flex;
  gap: 6px;
  margin: 5px 0;
}

.idc-join {
  font-size: 10px;
  color: var(--text-2);
}

.idc-foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.idc-code {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 40%;

  span {
    font-size: 10px;
    color: var(--text-2);
  }

  &.center {
    align-items: center;
    width: 60%;
  }
}

.barcode {
  height: 18px;
  background: repeating-linear-gradient(
    90deg,
    var(--ink) 0 2px,
    transparent 2px 4px,
    var(--ink) 4px 7px,
    transparent 7px 9px,
    var(--ink) 9px 10px,
    transparent 10px 14px
  );
}

.idc-stamp {
  position: absolute;
  right: 8px;
  bottom: 6px;
  width: 72px;
  height: 72px;
  transform: rotate(-14deg);
  mix-blend-mode: multiply;
  opacity: 0.9;
  animation: ik-pop 0.4s ease both;
}

// —— 背面 ——
.idc-punch {
  width: 14px;
  height: 14px;
  margin-top: -26px;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: var(--bg);
}

.idc-slogan {
  font-size: 24px;
  font-weight: 900;
  text-align: center;
  line-height: 1.25;
  letter-spacing: 2px;
  margin-top: 6px;
}

.idc-motto {
  font-size: 10px;
  color: var(--text-2);
  letter-spacing: 3px;
  margin: 6px 0 10px;
}

.idc-fine {
  font-size: 8px;
  color: var(--gray);
  text-align: center;
  line-height: 1.6;
  margin-top: 6px;
}
</style>
