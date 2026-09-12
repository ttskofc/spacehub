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
    <path d="M14 2H6C4.89617 2 4 2.89617 4 4V20C4 21.1038 4.89617 22 6 22H18C19.1038 22 20 21.1038 20 20V8L14 2" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 2V8H20" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 18V12" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 15H15" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
