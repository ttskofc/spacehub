<template>
  <button
    class="btn"
    :class="[
      `btn-${variant}`,
      `btn-${size}`,
      { 'is-loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot v-else />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg'
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

defineEmits(['click']);
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
  transition: all var(--transition-fast);
  user-select: none;
  box-sizing: border-box;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
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
  background-color: var(--color-surface-subtle, #f1f5f9);
  border-color: #d6ccc9;
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
  background-color: var(--color-primary-light-hover, #dbeafe);
  transform: translateY(-1px);
}

.btn-soft:active {
  transform: translateY(0);
}

.btn-ghost {
  background: transparent;
  color: var(--color-primary);
  padding-left: 0;
  padding-right: 0;
}

.btn-ghost:hover {
  gap: 12px;
  color: var(--color-danger-text);
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