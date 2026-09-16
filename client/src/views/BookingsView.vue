<template>
  <div class="view-page">
    <header class="view-page__header">
      <h1>Мои бронирования</h1>
      <p>Здесь появится список ваших бронирований ресурсов.</p>
    </header>

    <div class="view-page__empty">
      <span class="view-page__empty-title">Пока нет бронирований</span>
      <span class="view-page__empty-hint">
        Забронируйте переговорную или рабочее место в каталоге — и оно появится здесь.
      </span>
      <RouterLink to="/" class="view-page__link">Перейти в каталог</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.view-page {
  padding: 24px;
  max-width: 1080px;
}

.view-page__header {
  margin-bottom: 24px;
}

.view-page__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 32px;

  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  max-width: 480px;
}

.view-page__empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-main);
}

.view-page__empty-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.view-page__link {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.view-page__link:hover {
  color: var(--color-primary-hover);
}
</style>