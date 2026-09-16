<template>
  <RouterLink
    :to="to"
    class="nav-item"
    :class="{ 'nav-item--active': isActive }"
    :aria-current="isActive ? 'page' : undefined"
  >
    <span class="nav-item__icon" aria-hidden="true">
      <slot name="icon">
        <component :is="icon" v-if="icon" :size="20" />
      </slot>
    </span>
    <span class="nav-item__label">
      <slot>{{ label }}</slot>
    </span>
    <span
      v-if="showCount"
      class="nav-item__badge"
      :class="`nav-item__badge--${badgeVariant}`"
    >
      {{ count }}
    </span>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const props = defineProps({
  to: {
    type: String,
    default: '/',
  },
  label: {
    type: String,
    default: '',
  },
  icon: {
    type: Object,
    default: null,
  },
  count: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: null,
  },
  badgeVariant: {
    type: String,
    default: 'primary', // 'primary' | 'warning' | 'matcha'
    validator: (v) => ['primary', 'warning', 'matcha'].includes(v),
  },
});

const route = useRoute();

const isActive = computed(() => {
  if (props.active !== null) return props.active;
  return props.to === '/'
    ? route.path === '/'
    : route.path.startsWith(props.to);
});

const showCount = computed(() => props.count > 0);
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  margin: 2px 12px;
  padding: 0 14px;
  border-radius: var(--radius-8);
  text-decoration: none;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-pagination-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-item__icon {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-select-icon);
}

.nav-item__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-item:hover {
  background: var(--color-surface-subtle);
  color: var(--color-pagination-text-hover);
}

.nav-item:hover .nav-item__icon {
  color: var(--color-pagination-text-hover);
}

.nav-item:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.nav-item--active {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  box-shadow: 0 2px 8px var(--color-pagination-active-shadow);
}

.nav-item--active .nav-item__icon {
  color: inherit;
}

.nav-item--active:hover {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
}

.nav-item__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.nav-item__badge--primary {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
}

.nav-item__badge--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
  border: 1px solid var(--color-warning-border);
}

.nav-item__badge--matcha {
  background: var(--color-accent-matcha);
  color: var(--color-accent-matcha-dark);
}

.nav-item--active .nav-item__badge--primary {
  background: rgba(255, 255, 255, 0.18);
  color: var(--color-text-on-primary);
}

.nav-item--active .nav-item__badge--matcha {
  background: rgba(186, 215, 151, 0.18);
  color: var(--color-accent-matcha-light);
}
</style>