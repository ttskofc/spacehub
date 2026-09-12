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
    <path d="M5 4H19C20.1038 4 21 4.89617 21 6V20C21 21.1038 20.1038 22 19 22H5C3.89617 22 3 21.1038 3 20V6C3 4.89617 3.89617 4 5 4V4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 2V6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 2V6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 10H21" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7 14C7 14.5519 7.44808 15 8 15C8.55192 15 9 14.5519 9 14C9 13.4481 8.55192 13 8 13C7.44808 13 7 13.4481 7 14V14"/>
<path d="M7 14C7 14.5519 7.44808 15 8 15C8.55192 15 9 14.5519 9 14C9 13.4481 8.55192 13 8 13C7.44808 13 7 13.4481 7 14V14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11 14C11 14.5519 11.4481 15 12 15C12.5519 15 13 14.5519 13 14C13 13.4481 12.5519 13 12 13C11.4481 13 11 13.4481 11 14V14"/>
<path d="M11 14C11 14.5519 11.4481 15 12 15C12.5519 15 13 14.5519 13 14C13 13.4481 12.5519 13 12 13C11.4481 13 11 13.4481 11 14V14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 14C15 14.5519 15.4481 15 16 15C16.5519 15 17 14.5519 17 14C17 13.4481 16.5519 13 16 13C15.4481 13 15 13.4481 15 14V14"/>
<path d="M15 14C15 14.5519 15.4481 15 16 15C16.5519 15 17 14.5519 17 14C17 13.4481 16.5519 13 16 13C15.4481 13 15 13.4481 15 14V14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7 18C7 18.5519 7.44808 19 8 19C8.55192 19 9 18.5519 9 18C9 17.4481 8.55192 17 8 17C7.44808 17 7 17.4481 7 18V18"/>
<path d="M7 18C7 18.5519 7.44808 19 8 19C8.55192 19 9 18.5519 9 18C9 17.4481 8.55192 17 8 17C7.44808 17 7 17.4481 7 18V18" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11 18C11 18.5519 11.4481 19 12 19C12.5519 19 13 18.5519 13 18C13 17.4481 12.5519 17 12 17C11.4481 17 11 17.4481 11 18V18"/>
<path d="M11 18C11 18.5519 11.4481 19 12 19C12.5519 19 13 18.5519 13 18C13 17.4481 12.5519 17 12 17C11.4481 17 11 17.4481 11 18V18" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
