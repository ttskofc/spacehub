<template>
  <svg
    :width="computedSize"
    :height="computedSize"
    viewBox="0 0 24 24"
    :fill="color"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path transform="translate(4.36364 0) scale(2.18182)" d="M3.20833 9.33333H3.79167V8.25417L5.83333 6.2125V3.5V3.5V3.5H1.16667V3.5V3.5V6.2125L3.20833 8.25417V9.33333V9.33333M2.04167 10.5V8.75L0 6.70833V3.5C0 3.17917 0.114236 2.90451 0.342708 2.67604C0.571181 2.44757 0.845833 2.33333 1.16667 2.33333H1.75L1.16667 2.91667V0H2.33333V2.33333H4.66667V0H5.83333V2.91667L5.25 2.33333H5.83333C6.15417 2.33333 6.42882 2.44757 6.65729 2.67604C6.88576 2.90451 7 3.17917 7 3.5V6.70833L4.95833 8.75V10.5H2.04167V10.5M3.5 6.41667V6.41667V6.41667V6.41667V6.41667V6.41667V6.41667V6.41667V6.41667V6.41667V6.41667V6.41667V6.41667V6.41667"/>
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
