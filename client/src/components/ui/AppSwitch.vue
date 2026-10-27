<template>
  <label class="app-switch" :class="{ 'app-switch--disabled': disabled }">
    <span v-if="label || description" class="app-switch__copy">
      <span v-if="label" class="app-switch__label">{{ label }}</span>
      <span v-if="description" class="app-switch__description">{{ description }}</span>
    </span>
    <input
      class="app-switch__input"
      type="checkbox"
      role="switch"
      :checked="modelValue"
      :disabled="disabled"
      :aria-label="label || undefined"
      :aria-checked="modelValue"
      @change="emit('update:modelValue', $event.target.checked)"
    />
    <span class="app-switch__track" aria-hidden="true"><span class="app-switch__thumb"></span></span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.app-switch { display: inline-flex; align-items: center; gap: 16px; cursor: pointer; }
.app-switch__copy { display: flex; flex: 1; flex-direction: column; gap: 3px; }
.app-switch__label { color: var(--color-text-main); font-size: 14px; font-weight: 600; }
.app-switch__description { color: var(--color-text-secondary); font-size: 12px; }
.app-switch__input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.app-switch__track { position: relative; width: 44px; height: 26px; flex-shrink: 0; border-radius: var(--radius-full); background: var(--color-surface-hover); transition: background-color var(--transition-fast); }
.app-switch__thumb { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: var(--shadow-sm); transition: transform var(--transition-fast); }
.app-switch__input:checked + .app-switch__track { background: var(--color-accent-matcha); }
.app-switch__input:checked + .app-switch__track .app-switch__thumb { transform: translateX(18px); }
.app-switch__input:focus-visible + .app-switch__track { outline: 2px solid var(--color-border-focus); outline-offset: 2px; }
.app-switch--disabled { cursor: not-allowed; opacity: .5; }
</style>
