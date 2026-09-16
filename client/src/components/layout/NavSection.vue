<template>
  <div class="nav-section">
    <span v-if="title" class="nav-section__title">{{ title }}</span>
    <div class="nav-section__items">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.nav-section {
  display: flex;
  flex-direction: column;
}

.nav-section__title {
  padding: 16px 24px 8px;
  font-family: var(--font-body, sans-serif);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-select-placeholder);
}

.nav-section__items {
  display: flex;
  flex-direction: column;
}
</style>