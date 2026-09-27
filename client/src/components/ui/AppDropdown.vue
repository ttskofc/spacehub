<template>
  <div ref="rootRef" class="app-dropdown" @keydown="onKeydown">
    <button
      ref="triggerRef"
      type="button"
      class="app-dropdown__trigger"
      :class="`app-dropdown__trigger--${variant}`"
      :disabled="disabled"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <slot name="trigger" :open="isOpen" />
    </button>

    <Transition name="app-dropdown-fade">
      <div
        v-if="isOpen"
        ref="menuRef"
        class="app-dropdown__menu"
        :class="`app-dropdown__menu--${align}`"
        :style="{ width }"
        role="menu"
        @click="onMenuClick"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  align: {
    type: String,
    default: 'right', // 'left' | 'right'
    validator: (v) => ['left', 'right'].includes(v),
  },
  width: {
    type: String,
    default: '220px',
  },
  variant: {
    type: String,
    default: 'ghost', // 'ghost' | 'soft'
    validator: (v) => ['ghost', 'soft'].includes(v),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  closeOnClick: {
    type: Boolean,
    default: true,
  },
  closeOnOutside: {
    type: Boolean,
    default: true,
  },
});

const isOpen = ref(false);

const rootRef = ref(null);
const triggerRef = ref(null);
const menuRef = ref(null);

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function open() {
  if (props.disabled || isOpen.value) return;
  isOpen.value = true;
}

function close(refocus = false) {
  if (!isOpen.value) return;
  isOpen.value = false;
  if (refocus) nextTick(() => triggerRef.value?.focus());
}

function toggle() {
  if (isOpen.value) close();
  else open();
}

function onMenuClick() {
  if (props.closeOnClick) close();
}

function onKeydown(e) {
  if (!isOpen.value) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    close(true);
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    focusFirstItem();
  }
}

function focusFirstItem() {
  const items = menuRef.value?.querySelectorAll(FOCUSABLE);
  if (items?.length) items[0].focus();
}

function onClickOutside(e) {
  if (rootRef.value?.contains(e.target)) return;
  close();
}

watch(isOpen, (open) => {
  if (open && props.closeOnOutside) {
    document.addEventListener('click', onClickOutside);
  } else {
    document.removeEventListener('click', onClickOutside);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
});

defineExpose({ open, close, toggle, isOpen });
</script>

<style scoped>
.app-dropdown {
  position: relative;
  display: inline-flex;
}

.app-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background-color: transparent;
  color: inherit;
  font-family: var(--font-body, inherit);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.app-dropdown__trigger--soft {
  padding: 8px 12px;
  border-color: var(--color-border);
  background-color: var(--color-surface);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-main);
}

.app-dropdown__trigger--soft:hover {
  background-color: var(--color-surface-hover);
}

.app-dropdown__trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-dropdown__trigger:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.app-dropdown__menu {
  position: absolute;
  top: calc(100% + 8px);
  z-index: 100;
  max-width: calc(100vw - 32px);
  max-height: min(60vh, 420px);
  padding: 6px;
  overflow-y: auto;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-dropdown);
  box-sizing: border-box;
}

.app-dropdown__menu--right {
  right: 0;
}

.app-dropdown__menu--left {
  left: 0;
}

.app-dropdown-fade-enter-active,
.app-dropdown-fade-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.app-dropdown-fade-enter-from,
.app-dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
