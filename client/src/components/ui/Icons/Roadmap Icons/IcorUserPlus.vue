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
    <path d="M16 21V19C16 16.7923 14.2077 15 12 15H5C2.79234 15 1 16.7923 1 19V21" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.5 7C4.5 9.20766 6.29234 11 8.5 11C10.7077 11 12.5 9.20766 12.5 7C12.5 4.79234 10.7077 3 8.5 3C6.29234 3 4.5 4.79234 4.5 7V7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 8V14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M23 11H17" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
