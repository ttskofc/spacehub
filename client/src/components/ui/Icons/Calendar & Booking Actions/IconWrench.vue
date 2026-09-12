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
    <path d="M14.7001 6.30003C14.319 6.68887 14.319 7.31118 14.7001 7.70003L16.3001 9.30003C16.6889 9.68117 17.3113 9.68117 17.7001 9.30003L21.4701 5.53003C22.4997 7.80529 22.0123 10.4804 20.2464 12.2463C18.4805 14.0122 15.8054 14.4996 13.5301 13.47L6.6201 20.38C5.79223 21.2079 4.44797 21.2079 3.6201 20.38C2.79223 19.5522 2.79223 18.2079 3.6201 17.38L10.5301 10.47C9.5005 8.19476 9.98791 5.51966 11.7538 3.75375C13.5197 1.98783 16.1948 1.50043 18.4701 2.53003L14.7101 6.29003L14.7001 6.30003" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
