<template>
  <AppInput ref="inputRef" v-model="model" type="search" v-bind="$attrs">
    <template #prefix>
      <IconSearch :size="18" />
    </template>
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </AppInput>
</template>

<script setup>
import { ref } from 'vue';
import AppInput from './AppInput.vue';
import IconSearch from './Icons/Shell&Navigation/IconSearch.vue';

const model = defineModel({ default: '' });

const inputRef = ref(null);

function focus() {
  inputRef.value?.focus();
}

defineExpose({ focus });
</script>
