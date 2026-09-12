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
    <path d="M4.5 3H8.5C9.32787 3 10 3.67213 10 4.5V8.5C10 9.32787 9.32787 10 8.5 10H4.5C3.67213 10 3 9.32787 3 8.5V4.5C3 3.67213 3.67213 3 4.5 3V3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.5 3H19.5C20.3279 3 21 3.67213 21 4.5V8.5C21 9.32787 20.3279 10 19.5 10H15.5C14.6721 10 14 9.32787 14 8.5V4.5C14 3.67213 14.6721 3 15.5 3V3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.5 14H19.5C20.3279 14 21 14.6721 21 15.5V19.5C21 20.3279 20.3279 21 19.5 21H15.5C14.6721 21 14 20.3279 14 19.5V15.5C14 14.6721 14.6721 14 15.5 14V14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.5 14H8.5C9.32787 14 10 14.6721 10 15.5V19.5C10 20.3279 9.32787 21 8.5 21H4.5C3.67213 21 3 20.3279 3 19.5V15.5C3 14.6721 3.67213 14 4.5 14V14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
