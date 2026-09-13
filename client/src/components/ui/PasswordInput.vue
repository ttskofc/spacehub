<template>
  <AppInput v-model="model" :type="show ? 'text' : 'password'" v-bind="$attrs">
    <template #prefix>
      <IconLock :size="18" />
    </template>
    <template #suffix>
      <button
        type="button"
        class="password-toggle"
        :aria-label="show ? 'Скрыть пароль' : 'Показать пароль'"
        @click="show = !show"
      >
        <IconEyeOff v-if="show" :size="18" />
        <IconEye v-else :size="18" />
      </button>
    </template>
  </AppInput>
</template>

<script setup>
import { ref } from 'vue';
import AppInput from './AppInput.vue';
import IconLock from './Icons/IconLock.vue';
import IconEyeOff from './Icons/IconEyeOff.vue';
import IconEye from './Icons/IconEye.vue';

const model = defineModel({ default: '' });
const show = ref(false);
</script>

<style scoped>
.password-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--color-text-main);
}

.password-toggle:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
</style>