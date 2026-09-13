<template>
  <button
    class="btn"
    :class="[
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-block': block, 'is-loading': loading }
    ]"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot v-else />
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button', // 'button' | 'submit' | 'reset'
  },
  variant: {
    type: String,
    default: 'primary', // 'primary' | 'secondary' | 'soft' | 'ghost'
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg' | 'icon'
  },
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-heading, inherit);
  font-weight: 600;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
  user-select: none;
  box-sizing: border-box;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Размеры */
.btn-sm {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

.btn-md {
  height: 40px;
  padding: 0 18px;
  font-size: 14px;
}

.btn-lg {
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.btn-block {
  width: 100%;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary, #ffffff);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  background-color: var(--color-primary-active, var(--color-primary));
  transform: translateY(0);
}

.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-text-main);
  border-color: var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border);
  transform: translateY(-1px);
}

.btn-secondary:active {
  transform: translateY(0);
}

.btn-soft {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.btn-soft:hover {
  background-color: var(--color-primary-light-hover);
  transform: translateY(-1px);
}

.btn-soft:active {
  transform: translateY(0);
}

.btn-ghost {
  background: transparent;
  color: var(--color-primary);
}

.btn-ghost:hover {
  background-color: var(--color-primary-light);
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>