<template>
  <svg
    :width="computedSize"
    :height="computedSize"
    viewBox="0 0 24 24"
    :fill="color"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 13.9928 6.6967 L 17.1747 3.51472 L 20.3567 6.6967 L 19.2961 7.75736 L 17.9247 6.38604 L 17.9247 17.614 L 19.2961 16.2426 L 20.3567 17.3033 L 17.1747 20.4853 L 13.9928 17.3033 L 15.0534 16.2426 L 16.4247 17.614 V 6.38604 L 15.0534 7.75736 L 13.9928 6.6967 Z"
    />
    <path
    d="M3.75 4.5L4.5 3.75H12L12.75 4.5V19.5L12 20.25H4.5L3.75 19.5V4.5ZM5.25 5.25V18.75H11.25V17.25H8.25V15.75H11.25V14.25H8.25V12.75H11.25V11.25H7.5V9.75H11.25V8.25H8.25V6.75H11.25V5.25H5.25Z"
    />
  </svg>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  size: {
    type: [Number, String],
    default: "md",
  },
  color: {
    type: String,
    default: "currentColor",
  },
});

const SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const computedSize = computed(() => {
  if (props.size in SIZES) {
    return SIZES[props.size];
  }
  return props.size;
});
</script>
