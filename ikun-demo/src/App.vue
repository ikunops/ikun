<script setup>
import TabBar from '@/components/TabBar.vue'
</script>

<template>
  <div class="app-shell">
    <router-view />
    <TabBar v-if="$route.meta.tab" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}
</style>
