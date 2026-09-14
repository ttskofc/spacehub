<template>
  <label
    class="app-checkbox"
    :class="[
      `app-checkbox--${size}`,
      `app-checkbox--${variant}`,
      {
        'app-checkbox--checked': isChecked,
        'app-checkbox--indeterminate': indeterminate,
        'app-checkbox--disabled': disabled,
        'app-checkbox--error': !!error,
      }
    ]"
  >
    <input
      ref="inputRef"
      type="checkbox"
      class="app-checkbox__input"
      v-bind="$attrs"
      :checked="isChecked"
      :value="value"
      :disabled="disabled"
      :aria-invalid="error ? true : undefined"
      @change="handleChange"
    />

    <span class="app-checkbox__box" aria-hidden="true">
      <svg
        v-if="isChecked && !indeterminate"
        class="app-checkbox__check"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
      >
        <path d="M2.5 6L5 8.5L9.5 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span v-else-if="indeterminate" class="app-checkbox__dash"></span>
    </span>

    <span class="app-checkbox__content">
      <span class="app-checkbox__label-row">
        <span class="app-checkbox__label" :class="labelClass">
          <slot>{{ label }}</slot>
        </span>
        <span v-if="badge !== null" class="app-checkbox__badge">{{ badge }}</span>
      </span>

      <span v-if="description" class="app-checkbox__description">{{ description }}</span>

      <span v-if="typeof error === 'string'" class="app-checkbox__message app-checkbox__message--error" role="alert">
        {{ error }}
      </span>
    </span>
  </label>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false,
  },
  value: {
    default: undefined,
  },
  label: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  badge: {
    type: [String, Number],
    default: null,
  },
  variant: {
    type: String,
    default: 'cherry', // 'cherry' | 'matcha' | 'card'
    validator: (v) => ['cherry', 'matcha', 'card'].includes(v),
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg'
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  indeterminate: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [Boolean, String],
    default: false,
  },
  labelClass: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const inputRef = ref(null);

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value);
  }
  return Boolean(props.modelValue);
});

function syncIndeterminate() {
  if (inputRef.value) inputRef.value.indeterminate = props.indeterminate;
}

onMounted(syncIndeterminate);
watch(() => props.indeterminate, syncIndeterminate);

function handleChange(e) {
  if (props.disabled) return;
  const target = e.target;

  if (Array.isArray(props.modelValue)) {
    const next = [...props.modelValue];
    if (target.checked) {
      if (!next.includes(props.value)) next.push(props.value);
    } else {
      const idx = next.indexOf(props.value);
      if (idx !== -1) next.splice(idx, 1);
    }
    emit('update:modelValue', next);
  } else {
    emit('update:modelValue', target.checked);
  }
  emit('change', e);
}
</script>

<style scoped>
.app-checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
}

.app-checkbox__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.app-checkbox__input:focus-visible + .app-checkbox__box {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}


.app-checkbox__box {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.app-checkbox:not(.app-checkbox--disabled) .app-checkbox__box:hover {
  border-color: var(--color-primary);
}

.app-checkbox__check {
  width: 10px;
  height: 10px;
  color: inherit;
}

.app-checkbox__dash {
  width: 8px;
  height: 2px;
  border-radius: var(--radius-full);
  background-color: currentColor;
}

.app-checkbox--checked .app-checkbox__box,
.app-checkbox--indeterminate .app-checkbox__box {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-sm);
}

/* Размеры */
.app-checkbox--sm .app-checkbox__box {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-xs);
}

.app-checkbox--sm .app-checkbox__check {
  width: 9px;
  height: 9px;
}

.app-checkbox--md .app-checkbox__box {
  width: 18px;
  height: 18px;
}

.app-checkbox--lg .app-checkbox__box {
  width: 24px;
  height: 24px;
}

.app-checkbox--lg .app-checkbox__check {
  width: 12px;
  height: 12px;
}

.app-checkbox--lg .app-checkbox__dash {
  width: 10px;
}

/* Vариант matcha */
.app-checkbox--matcha:not(.app-checkbox--disabled) .app-checkbox__box:hover {
  border-color: var(--color-accent-matcha);
}

.app-checkbox--matcha.app-checkbox--checked .app-checkbox__box,
.app-checkbox--matcha.app-checkbox--indeterminate .app-checkbox__box {
  background-color: var(--color-accent-matcha);
  border-color: var(--color-accent-matcha);
  color: var(--color-accent-matcha-dark);
}


.app-checkbox--card {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    opacity var(--transition-fast);
}

.app-checkbox--card.app-checkbox--checked {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.app-checkbox__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.app-checkbox__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.app-checkbox__label {
  font-family: var(--font-body, inherit);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-text-main);
}

.app-checkbox--sm .app-checkbox__label {
  font-size: 13px;
}

.app-checkbox--lg .app-checkbox__label {
  font-size: 15px;
}

.app-checkbox__badge {
  flex-shrink: 0;
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-app);
  font-family: var(--font-heading, inherit);
  font-size: 11px;
  color: var(--color-text-secondary);
}

.app-checkbox__description {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}

/* Ошибка */
.app-checkbox__message {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-muted);
}

.app-checkbox__message--error {
  color: var(--color-danger-text);
}

.app-checkbox--error .app-checkbox__box {
  background-color: var(--color-danger-bg);
  border-color: var(--color-danger);
}

.app-checkbox--error .app-checkbox__input:focus-visible + .app-checkbox__box {
  outline: 2px solid var(--color-danger);
  outline-offset: 2px;
}

/* Отключённое состояние */
.app-checkbox--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>