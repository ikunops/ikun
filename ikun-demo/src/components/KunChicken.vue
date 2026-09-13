<script setup>
// 坤系头像统一基因:黄鸡头 + 灰中分 + 大眼 + 红脸蛋 + 橙鸭嘴 + 粗黑描边
// Demo 阶段程序化绘制;正式素材生成后替换为 src/assets/avatars/ 图片
defineProps({
  bg: { type: String, default: '#fff3d6' },
})
</script>

<template>
  <svg class="kun-chicken" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="120" height="120" rx="26" :fill="bg" />
    <!-- 小翅膀 -->
    <ellipse cx="22" cy="93" rx="10" ry="7" fill="#ffd34d" stroke="#262338" stroke-width="2.5" />
    <ellipse cx="98" cy="93" rx="10" ry="7" fill="#ffd34d" stroke="#262338" stroke-width="2.5" />
    <!-- 头 -->
    <circle cx="60" cy="64" r="37" fill="#ffd34d" stroke="#262338" stroke-width="3" />
    <!-- 灰色中分发型 + 高光 -->
    <path
      d="M60 25 C46 25 34 33 30 47 C40 38 52 34 58 36 L60 28 Z"
      fill="#cfd4de"
      stroke="#262338"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
    <path
      d="M60 25 C74 25 86 33 90 47 C80 38 68 34 62 36 L60 28 Z"
      fill="#cfd4de"
      stroke="#262338"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
    <path d="M52 30 C46 32 41 36 38 41" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" />
    <path d="M68 30 C74 32 79 36 82 41" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" />
    <!-- 超大眼睛 -->
    <circle cx="46" cy="63" r="10.5" fill="#fff" stroke="#262338" stroke-width="2.5" />
    <circle cx="74" cy="63" r="10.5" fill="#fff" stroke="#262338" stroke-width="2.5" />
    <circle cx="48.5" cy="65" r="4.5" fill="#262338" />
    <circle cx="71.5" cy="65" r="4.5" fill="#262338" />
    <circle cx="50" cy="63" r="1.6" fill="#fff" />
    <circle cx="73" cy="63" r="1.6" fill="#fff" />
    <!-- 红脸蛋 -->
    <circle cx="36" cy="77" r="6" fill="#ff8a8a" opacity="0.75" />
    <circle cx="84" cy="77" r="6" fill="#ff8a8a" opacity="0.75" />
    <!-- 橙色鸭嘴 -->
    <path
      d="M50 76 Q60 71 70 76 Q66 87 60 89 Q54 87 50 76 Z"
      fill="#ff9f43"
      stroke="#262338"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.kun-chicken {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
