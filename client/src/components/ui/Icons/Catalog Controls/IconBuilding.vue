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
    <path d="M6 2H18C19.1038 2 20 2.89617 20 4V20C20 21.1038 19.1038 22 18 22H6C4.89617 22 4 21.1038 4 20V4C4 2.89617 4.89617 2 6 2V2" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 22V18" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 22V18" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 6H9.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 6H15.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 10H9.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 10H15.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 14H9.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 14H15.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
