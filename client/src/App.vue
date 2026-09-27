<template>
  <div class="app-shell">
    <AppSidebar />

    <main class="app-content">
      <AppHeader :unread-count="unreadCount" />
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import AppHeader from './components/layout/AppHeader.vue';
import AppSidebar from './components/layout/AppSidebar.vue';

const unreadCount = ref(3);
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
