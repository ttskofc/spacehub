<template>
  <div
    class="app-textarea"
    :class="[
      `app-textarea--${size}`,
      {
        'app-textarea--error': error,
        'app-textarea--disabled': disabled,
      }
    ]"
  >
    <textarea
      class="app-textarea__field"
      v-bind="$attrs"
      v-model="model"
      :disabled="disabled"
      :aria-invalid="error ? true : undefined"
    ></textarea>

    <p v-if="error" class="app-textarea__message app-textarea__message--error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="app-textarea__message">{{ hint }}</p>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false });

defineProps({
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
.app-textarea__field {
  display: block;
  width: 100%;
  min-height: 96px;
  padding: 14px 16px;
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body, inherit);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-main);
  outline: none;
  resize: none;
  box-sizing: border-box;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.app-textarea__field::placeholder {
  color: var(--color-text-muted);
}

.app-textarea__field:focus {
  background-color: var(--color-surface);
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.app-textarea__field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Размеры */
.app-textarea--sm .app-textarea__field {
  padding: 10px 12px;
  min-height: 64px;
  font-size: 13px;
}

.app-textarea--md .app-textarea__field {
  padding: 14px 16px;
  min-height: 96px;
  font-size: 14px;
}

.app-textarea--lg .app-textarea__field {
  padding: 16px 20px;
  min-height: 128px;
  font-size: 16px;
}

/* Ошибка */
.app-textarea--error .app-textarea__field {
  background-color: var(--color-danger-bg);
  border-color: var(--color-danger-border);
}

.app-textarea--error .app-textarea__field:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px var(--color-danger-border);
}

.app-textarea__message {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-muted);
}

.app-textarea__message--error {
  color: var(--color-danger-text);
}
</style>