<template>
  <AppInput v-model="model" type="search" v-bind="$attrs">
    <template #prefix>
      <IconSearch :size="18" />
    </template>
  </AppInput>
</template>

<script setup>
import AppInput from './AppInput.vue';
import IconSearch from './Icons/Shell&Navigation/IconSearch.vue';

const model = defineModel({ default: '' });
</script>