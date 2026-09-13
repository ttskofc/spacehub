<template>
  <span 
    class="badge" 
    :class="`badge--${variant}`"
  >
    <span v-if="dot" class="badge__dot"></span>
    <span class="badge__label">
      <slot>{{ text }}</slot>
    </span>
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'success', // 'success' | 'warning' | 'danger'
    validator: (v) => ['success', 'warning', 'danger'].includes(v),
  },
  dot: {
    type: Boolean,
    default: true,
  },
  text: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  user-select: none;
}

.badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: #ffffff7b;
}


/* sucess */
.badge--success {
  background-color: var(--color-success);
  color: #ffffff;
}


/* warning */
.badge--warning {
  background-color: var(--color-warning);
  color: #ffffff;
}

/* danger */
.badge--danger {
  background-color: var(--color-danger);
  color: #ffffff;
}
</style>