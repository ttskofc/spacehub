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
    <path d="M2 12C2 17.5192 6.48085 22 12 22C17.5192 22 22 17.5192 22 12C22 6.48085 17.5192 2 12 2C6.48085 2 2 6.48085 2 12V12" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.09009 8.99999C9.57552 7.62004 10.9855 6.7914 12.4273 7.0387C13.8691 7.28601 14.9223 8.53714 14.9201 9.99999C14.9201 12 11.9201 13 11.9201 13" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 17H12.01" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
