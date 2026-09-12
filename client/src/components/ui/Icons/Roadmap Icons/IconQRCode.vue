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
    <path d="M3 3H10V3V10V10H3V10V3V3V3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 3H21V3V10V10H14V10V3V3V3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 14H10V14V21V21H3V21V14V14V14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 14H14.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 14H17.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 14H20.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 17H17" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 20H20" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
