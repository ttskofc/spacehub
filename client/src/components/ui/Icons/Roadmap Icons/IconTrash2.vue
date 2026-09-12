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
    <path d="M3 6H5H21" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19 6V20C19 21.1038 18.1038 22 17 22H7C5.89617 22 5 21.1038 5 20V6M8 6V4C8 2.89617 8.89617 2 10 2H14C15.1038 2 16 2.89617 16 4V6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 11V17" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 11V17" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
