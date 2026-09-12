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
    <path d="M4 21V14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 10V3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 21V12" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 8V3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 21V16" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 12V3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1 14H7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 8H15" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 16H23" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
