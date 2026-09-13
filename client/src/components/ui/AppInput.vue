<template>
  <div
    class="app-input"
    :class="[
      `app-input--${size}`,
      {
        'app-input--error': error,
        'app-input--disabled': disabled,
      }
    ]"
  >
    <div class="app-input__control" :class="{ 'has-prefix': $slots.prefix, 'has-suffix': $slots.suffix }">
      <span v-if="$slots.prefix" class="app-input__prefix">
        <slot name="prefix" />
      </span>

      <input
        class="app-input__field"
        v-bind="$attrs"
        v-model="model"
        :type="type"
        :disabled="disabled"
        :aria-invalid="error ? true : undefined"
      />

      <span v-if="$slots.suffix" class="app-input__suffix">
        <slot name="suffix" />
      </span>
    </div>

    <p v-if="error" class="app-input__message app-input__message--error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="app-input__message">{{ hint }}</p>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false });

defineProps({
  type: {
    type: String,
    default: 'text',
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg'
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
});

const model = defineModel({ default: '' });
</script>

<style scoped>
.app-input__control {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.app-input__field {
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 0 14px;
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body, inherit);
  font-size: 14px;
  color: var(--color-text-main);
  outline: none;
  box-sizing: border-box;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.app-input__field::placeholder {
  color: var(--color-text-muted);
}

.app-input__field:focus {
  background-color: var(--color-surface);
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.app-input__field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.app-input__control.has-prefix .app-input__field {
  padding-left: 42px;
}

.app-input__control.has-suffix .app-input__field {
  padding-right: 42px;
}

.app-input__prefix,
.app-input__suffix {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.app-input__prefix {
  left: 14px;
  pointer-events: none;
}

.app-input__suffix {
  right: 12px;
}

/* Размеры */
.app-input--sm .app-input__field {
  height: 36px;
  font-size: 13px;
}

.app-input--md .app-input__field {
  height: 46px;
  font-size: 14px;
}

.app-input--lg .app-input__field {
  height: 52px;
  font-size: 15px;
}

/* Ошибка */
.app-input--error .app-input__field {
  background-color: var(--color-danger-bg);
  border-color: var(--color-danger-border);
}

.app-input--error .app-input__field:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px var(--color-danger-border);
}

.app-input__message {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-muted);
}

.app-input__message--error {
  color: var(--color-danger-text);
}
</style>