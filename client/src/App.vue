<template>
  <div class="app-shell">
    <AppSidebar />

    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';
</script>

<style>
.app-shell {
  display: flex;
  align-items: flex-start;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  min-width: 0;
}
</style>