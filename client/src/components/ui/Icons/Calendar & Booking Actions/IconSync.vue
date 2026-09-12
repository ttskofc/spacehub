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
    <path d="M23 4V10H17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1 20V14H7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.51 9C4.54088 6.08681 6.99427 3.90622 10.0083 3.22426C13.0223 2.5423 16.1754 3.45435 18.36 5.64L23 10M1 14L5.64 18.36C7.82456 20.5457 10.9777 21.4577 13.9917 20.7757C17.0057 20.0938 19.4591 17.9132 20.49 15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
