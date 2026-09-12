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
    <path d="M14 14.76V3.5C14 2.12021 12.8798 1 11.5 1C10.1202 1 8.99998 2.12021 8.99998 3.5V14.76C7.35187 15.8612 6.61837 17.9111 7.19374 19.8079C7.76911 21.7047 9.51784 23.0017 11.5 23.0017C13.4821 23.0017 15.2309 21.7047 15.8062 19.8079C16.3816 17.9111 15.6481 15.8612 14 14.76V14.76" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
