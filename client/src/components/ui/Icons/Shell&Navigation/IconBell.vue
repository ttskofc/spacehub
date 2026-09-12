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
    <path d="M6 8C6 4.68851 8.68851 2 12 2C15.3115 2 18 4.68851 18 8C18 15 21 17 21 17H3C3 17 6 15 6 8Z" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.73 21C13.3722 21.6168 12.7131 21.9965 12 21.9965C11.287 21.9965 10.6278 21.6168 10.27 21" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
