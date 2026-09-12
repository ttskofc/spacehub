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
    <path d="M15 5C15 6.65575 16.3443 8 18 8C19.6557 8 21 6.65575 21 5C21 3.34425 19.6557 2 18 2C16.3443 2 15 3.34425 15 5V5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 12C3 13.6557 4.34425 15 6 15C7.65575 15 9 13.6557 9 12C9 10.3443 7.65575 9 6 9C4.34425 9 3 10.3443 3 12H3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 19C15 20.6557 16.3443 22 18 22C19.6557 22 21 20.6557 21 19C21 17.3443 19.6557 16 18 16C16.3443 16 15 17.3443 15 19V19" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.59009 13.51L15.4201 17.49" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.4101 6.51001L8.59009 10.49" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
