<template>
  <svg
    :width="computedSize"
    :height="computedSize"
    viewBox="0 0 24 24"
    :fill="color"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path transform="translate(0 1.84615) scale(1.84615)" d="M0 10.5V9.33333H12.8333V10.5H0V10.5M1.75 8.75C1.42917 8.75 1.15451 8.63576 0.926042 8.40729C0.697569 8.17882 0.583333 7.90417 0.583333 7.58333V1.16667C0.583333 0.845833 0.697569 0.571181 0.926042 0.342708C1.15451 0.114236 1.42917 0 1.75 0H11.0833C11.4042 0 11.6788 0.114236 11.9073 0.342708C12.1358 0.571181 12.25 0.845833 12.25 1.16667V7.58333C12.25 7.90417 12.1358 8.17882 11.9073 8.40729C11.6788 8.63576 11.4042 8.75 11.0833 8.75H1.75V8.75M1.75 7.58333H11.0833V7.58333V7.58333V1.16667V1.16667V1.16667H1.75V1.16667V1.16667V7.58333V7.58333V7.58333V7.58333M1.75 7.58333V7.58333V7.58333V1.16667V1.16667V1.16667V1.16667V1.16667V1.16667V7.58333V7.58333V7.58333V7.58333V7.58333"/>
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
