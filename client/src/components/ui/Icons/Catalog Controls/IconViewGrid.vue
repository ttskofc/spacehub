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
    <path d="M3 3H10V10H3V3Z" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 3H21V10H14V3Z" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 14H21V21H14V14Z" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 14H10V21H3V14Z" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
