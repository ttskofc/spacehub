<template>
  <div
    class="view-mode-toggle"
    :class="`view-mode-toggle--${size}`"
    role="group"
    aria-label="Вид отображения"
  >
    <button
      v-for="option in OPTIONS"
      :key="option.value"
      type="button"
      class="view-mode-toggle__btn"
      :class="{ 'view-mode-toggle__btn--active': model === option.value }"
      :aria-pressed="model === option.value"
      :title="option.label"
      @click="model = option.value"
    >
      <component :is="option.icon" :size="iconSize" aria-hidden="true" />
      <span class="view-mode-toggle__label">{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import IconViewGrid from './Icons/Catalog Controls/IconViewGrid.vue';
import IconViewList from './Icons/Catalog Controls/IconViewList.vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md', // 'sm' | 'md'
    validator: (v) => ['sm', 'md'].includes(v),
  },
});

const model = defineModel({
  type: String,
  default: 'grid',
  validator: (v) => ['grid', 'list'].includes(v),
});

const OPTIONS = [
  { value: 'grid', label: 'Сетка', icon: IconViewGrid },
  { value: 'list', label: 'Список', icon: IconViewList },
];

const ICON_SIZES = { sm: 14, md: 16 };

const iconSize = computed(() => ICON_SIZES[props.size] ?? 16);
</script>

<style scoped>
.view-mode-toggle {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-subtle);
}

.view-mode-toggle__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: none;
  border-radius: var(--radius-sm);
  background-color: transparent;
  font-family: var(--font-body, inherit);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.view-mode-toggle__btn:hover {
  background-color: var(--color-surface);
  color: var(--color-text-main);
}

.view-mode-toggle__btn--active {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-sm);
}

.view-mode-toggle__btn--active:hover {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
}

.view-mode-toggle__btn:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.view-mode-toggle__label {
  white-space: nowrap;
}

.view-mode-toggle--sm .view-mode-toggle__btn {
  height: 26px;
  padding: 0 8px;
}

.view-mode-toggle--sm .view-mode-toggle__label {
  display: none;
}
</style>
