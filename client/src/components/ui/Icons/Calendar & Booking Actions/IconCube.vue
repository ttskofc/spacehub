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
    <path d="M21 16V8.00002C20.9993 7.28623 20.6182 6.62692 20 6.27002L13 2.27002C12.3812 1.91276 11.6188 1.91276 11 2.27002L4 6.27002C3.38183 6.62692 3.00073 7.28623 3 8.00002V16C3.00073 16.7138 3.38183 17.3731 4 17.73L11 21.73C11.6188 22.0873 12.3812 22.0873 13 21.73L20 17.73C20.6182 17.3731 20.9993 16.7138 21 16V16" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 22.08V12" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
