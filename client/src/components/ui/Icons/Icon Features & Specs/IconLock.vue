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
    <path d="M5 11H19C20.1038 11 21 11.8962 21 13V20C21 21.1038 20.1038 22 19 22H5C3.89617 22 3 21.1038 3 20V13C3 11.8962 3.89617 11 5 11V11" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7 11V7C7 4.24042 9.24042 2 12 2C14.7596 2 17 4.24042 17 7V11" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
