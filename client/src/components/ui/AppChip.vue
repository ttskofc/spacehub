<template>
  <div
    class="app-chip"
    :class="chipModifiers"
    :role="removable ? 'group' : undefined"
    :aria-disabled="disabled || undefined"
  >
    <button
      type="button"
      class="app-chip__main"
      :disabled="disabled"
      :aria-pressed="removable ? undefined : active"
      @click="handleSelect"
    >
      <span v-if="resolvedIcon" class="app-chip__icon">
        <component :is="resolvedIcon" aria-hidden="true" :size="iconSize" />
      </span>

      <span class="app-chip__label">
        <slot>{{ label }}</slot>
      </span>

      <span v-if="hasCount" class="app-chip__count">{{ count }}</span>
    </button>

    <button
      v-if="removable"
      type="button"
      class="app-chip__remove"
      :disabled="disabled"
      :aria-label="removeLabel || `Удалить фильтр «${label}»`"
      @click="handleRemove"
    >
      <IconClose :size="12" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import IconClose from './Icons/Catalog Controls/IconClose.vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  count: {
    type: [Number, String],
    default: null,
  },
  active: {
    type: Boolean,
    default: false,
  },
  removable: {
    type: Boolean,
    default: false,
  },
  icon: {
    default: null,
  },
  removeLabel: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'cherry', // 'cherry' | 'matcha'
    validator: (v) => ['cherry', 'matcha'].includes(v),
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md'
    validator: (v) => ['sm', 'md'].includes(v),
  },
});

const emit = defineEmits(['click', 'update:active', 'remove']);

const ICON_SIZES = { sm: 12, md: 14 };

const iconSize = computed(() => ICON_SIZES[props.size] ?? 14);

const chipModifiers = computed(() => [
  `app-chip--${props.size}`,
  `app-chip--${props.variant}`,
  {
    'app-chip--active': props.active,
    'app-chip--disabled': props.disabled,
  },
]);

const hasCount = computed(() =>
  props.count !== null && props.count !== undefined && props.count !== '',
);

const resolvedIcon = computed(() =>
  props.icon && typeof props.icon !== 'string' ? props.icon : null,
);

function handleSelect(e) {
  if (props.disabled) return;
  emit('click', e);
  if (!props.removable) emit('update:active', !props.active);
}

function handleRemove(e) {
  e.stopPropagation();
  if (props.disabled) return;
  emit('remove');
}
</script>

<style scoped>
.app-chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background-color: var(--color-surface);
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.app-chip__main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 100%;
  padding: 0 14px;
  border: none;
  background: transparent;
  font-family: var(--font-body, inherit);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: var(--color-text-main);
  white-space: nowrap;
  cursor: pointer;
}

.app-chip__icon {
  display: inline-flex;
  flex-shrink: 0;
}

.app-chip__count {
  min-width: 18px;
  padding: 0 6px;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-hover);
  font-family: var(--font-heading, inherit);
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  color: var(--color-text-main);
  font-variant-numeric: tabular-nums;
}

.app-chip__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-right: 4px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

/* Размеры */
.app-chip--md {
  height: 38px;
}

.app-chip--sm {
  height: 30px;
}

.app-chip--sm .app-chip__main {
  padding: 0 12px;
  font-size: 13px;
}

.app-chip--sm .app-chip__count {
  min-width: 16px;
  font-size: 11px;
  line-height: 16px;
}

.app-chip--sm .app-chip__remove {
  width: 18px;
  height: 18px;
  margin-right: 2px;
}

/* Наведение */
.app-chip__remove:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.app-chip:not(.app-chip--active):not(.app-chip--disabled):hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-primary-light-hover);
}

.app-chip--matcha:not(.app-chip--active):not(.app-chip--disabled):hover {
  border-color: var(--color-accent-matcha);
}

/* Активное состояние */
.app-chip--active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-sm);
}

.app-chip--active .app-chip__main {
  color: var(--color-text-on-primary);
}

.app-chip--active .app-chip__count {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.app-chip--active .app-chip__remove {
  color: var(--color-text-on-primary);
}

.app-chip--active .app-chip__remove:hover {
  background-color: var(--color-primary-hover);
  color: var(--color-text-on-primary);
}

.app-chip--matcha.app-chip--active {
  background-color: var(--color-accent-matcha);
  border-color: var(--color-accent-matcha);
  color: var(--color-accent-matcha-dark);
}

.app-chip--matcha.app-chip--active .app-chip__main {
  color: var(--color-accent-matcha-dark);
}

.app-chip--matcha.app-chip--active .app-chip__count {
  background-color: var(--color-accent-matcha-light);
  color: var(--color-accent-matcha-dark);
}

.app-chip--matcha.app-chip--active .app-chip__remove {
  color: var(--color-accent-matcha-dark);
}

.app-chip--matcha.app-chip--active .app-chip__remove:hover {
  background-color: var(--color-accent-matcha-hover);
  color: var(--color-accent-matcha-dark);
}

/* Фокус */
.app-chip__main:focus-visible,
.app-chip__remove:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Отключённое состояние */
.app-chip--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.app-chip--disabled .app-chip__main,
.app-chip--disabled .app-chip__remove {
  cursor: not-allowed;
}
</style>