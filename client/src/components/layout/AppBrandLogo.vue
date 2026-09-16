<template>
  <header class="brand">
    <RouterLink to="/" class="brand__link">
      <span class="brand__icon-box">
        <IconLogo :size="18" />
      </span>
      <span class="brand__texts">
        <span class="brand__name">СпейсХаб</span>
        <span class="brand__sub">SPACEHUB</span>
      </span>
    </RouterLink>

    <span class="brand__badge">ENTERPRISE</span>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import IconLogo from '../ui/Icons/IconLogo.vue';
</script>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 72px;
  padding: 0 24px;
  box-sizing: border-box;
  background: var(--color-surface);
}

.brand__link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand__icon-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
}

.brand__texts {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand__name {
  font-family: var(--font-heading, sans-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
}

.brand__sub {
  font-family: var(--font-heading, sans-serif);
  font-size: 11px;
  color: var(--color-primary);
}

.brand__badge {
  margin-left: auto;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  background: var(--color-success-soft);
  color: var(--color-success);
  font-family: var(--font-body, sans-serif);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.05em;
  white-space: nowrap;
  user-select: none;
}
</style>