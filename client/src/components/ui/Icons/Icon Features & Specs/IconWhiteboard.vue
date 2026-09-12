<template>
  <svg
    :width="computedSize"
    :height="computedSize"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M12 19L19 12L22 15L15 22L12 19V19" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13V13" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2 2L9.586 9.586" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 11C9 12.1038 9.89617 13 11 13C12.1038 13 13 12.1038 13 11C13 9.89617 12.1038 9 11 9C9.89617 9 9 9.89617 9 11V11" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: [Number, String],
    default: 'md'
  },
  color: {
    type: String,
    default: 'currentColor'
  }
});

const SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
};

const computedSize = computed(() => {
  if (props.size in SIZES) {
    return SIZES[props.size];
  }
  return props.size;
});
</script>
