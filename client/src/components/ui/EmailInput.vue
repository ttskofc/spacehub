<template>
  <AppInput v-model="model" type="email" v-bind="$attrs">
    <template #prefix>
      <IconAtSign :size="18" />
    </template>
  </AppInput>
</template>

<script setup>
import AppInput from './AppInput.vue';
import IconAtSign from './Icons/IconAtSign.vue';

const model = defineModel({ default: '' });
</script>