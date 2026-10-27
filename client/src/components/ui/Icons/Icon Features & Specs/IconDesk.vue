<template>
  <svg
    :width="computedSize"
    :height="computedSize"
    viewBox="0 0 24 24"
    :fill="color"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2,6 C2,5.44772 2.44772,5 3,5 L21,5 C21.5523,5 22,5.44772 22,6 C22,6.55228 21.5523,7 21,7 L21,19 C21,19.5523 20.5523,20 20,20 C19.4477,20 19,19.5523 19,19 L19,17 L15.5,17 C14.6716,17 14,16.3284 14,15.5 L14,11 L5,11 L5,19 C5,19.5523 4.55228,20 4,20 C3.44772,20 3,19.5523 3,19 L3,7 C2.44772,7 2,6.55228 2,6 Z M19,15 L19,11 L16,11 L16,15 L19,15 Z M19,9 L19,7 L16,7 L16,9 L19,9 Z M14,9 L5,9 L5,7 L14,7 L14,9 Z"
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
