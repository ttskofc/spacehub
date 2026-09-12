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
    <path d="M5 12.55C9.07859 9.15278 15.0014 9.15278 19.08 12.55" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.41992 9.00004C7.4664 3.67024 16.5334 3.67024 22.5799 9.00004" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.53003 16.11C10.6109 14.6316 13.3992 14.6316 15.48 16.11" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 20H12.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
