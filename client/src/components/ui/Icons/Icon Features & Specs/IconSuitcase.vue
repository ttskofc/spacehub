<template>
  <svg
    :width="computedSize"
    :height="computedSize"
    viewBox="0 0 24 24"
    :fill="color"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path transform="translate(0 0.8) scale(1.6)" d="M1.33333 14C0.966667 14 0.652778 13.8694 0.391667 13.6083C0.130556 13.3472 0 13.0333 0 12.6667V5.33333H1.33333V12.6667V12.6667V12.6667H12.6667V14H1.33333V14M4 11.3333C3.63333 11.3333 3.31944 11.2028 3.05833 10.9417C2.79722 10.6806 2.66667 10.3667 2.66667 10V2.66667H6V1.33333C6 0.966667 6.13056 0.652778 6.39167 0.391667C6.65278 0.130556 6.96667 0 7.33333 0H10C10.3667 0 10.6806 0.130556 10.9417 0.391667C11.2028 0.652778 11.3333 0.966667 11.3333 1.33333V2.66667H14.6667V10C14.6667 10.3667 14.5361 10.6806 14.275 10.9417C14.0139 11.2028 13.7 11.3333 13.3333 11.3333H4V11.3333M4 10H13.3333V10V10V4H4V10V10V10V10M7.33333 2.66667H10V1.33333V1.33333V1.33333H7.33333V1.33333V1.33333V2.66667V2.66667M4 10V10V10V4V4V10V10V10V10V10"/>
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
