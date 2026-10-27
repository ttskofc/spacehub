<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="modelValue" class="app-drawer">
        <button class="app-drawer__backdrop" type="button" tabindex="-1" aria-label="Закрыть панель" @click="close"></button>
        <Transition name="drawer-panel" appear>
          <aside
            ref="panelRef"
            class="app-drawer__panel"
            role="dialog"
            aria-modal="true"
            :aria-label="resolvedLabel"
            :aria-labelledby="resolvedLabelledby"
            :style="{ '--drawer-width': normalizedWidth }"
          >
            <header class="app-drawer__header">
              <div class="app-drawer__heading">
                <span class="app-drawer__icon" aria-hidden="true"><IconSliders :size="20" /></span>
                <div class="app-drawer__title-wrap">
                  <div class="app-drawer__title-row">
                    <h2 :id="titleId" class="app-drawer__title">{{ title }}</h2>
                    <AppBadge v-if="badgeCount > 0" variant="danger" :dot="false" :text="String(badgeCount)" />
                  </div>
                  <p v-if="description" class="app-drawer__description">{{ description }}</p>
                </div>
              </div>
              <div class="app-drawer__actions">
                <button type="button" class="app-drawer__reset" @click="emit('reset')">{{ resetLabel }}</button>
                <AppButton variant="ghost" size="icon" class="app-drawer__close" :aria-label="closeLabel" @click="close">
                  <IconClose :size="18" />
                </AppButton>
              </div>
            </header>
            <div class="app-drawer__body"><slot /></div>
            <footer v-if="$slots.footer" class="app-drawer__footer"><slot name="footer" /></footer>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import AppBadge from './AppBadge.vue';
import AppButton from './AppButton.vue';
import IconSliders from './Icons/Catalog Controls/IconSliders.vue';
import IconClose from './Icons/Catalog Controls/IconClose.vue';

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  width: { type: [Number, String], default: '420px' },
  badgeCount: { type: Number, default: 0 },
  resetLabel: { type: String, default: 'Сбросить все' },
  closeLabel: { type: String, default: 'Закрыть' },
  labelledby: { type: String, default: '' },
});

const modelValue = defineModel({ type: Boolean, default: false });
const emit = defineEmits(['close', 'reset']);

const normalizedWidth = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width,
);

const titleId = `app-drawer-title-${Math.random().toString(36).slice(2, 9)}`;
const resolvedLabelledby = computed(() => props.labelledby || (props.description ? undefined : titleId));
const resolvedLabel = computed(() => (resolvedLabelledby.value ? undefined : props.title));

const panelRef = ref(null);
let lastFocused = null;
let previousOverflow = '';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableElements() {
  if (!panelRef.value) return [];
  return Array.from(panelRef.value.querySelectorAll(FOCUSABLE)).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  );
}

function focusFirst() {
  const elements = focusableElements();
  const target = elements.find((element) => !element.classList.contains('app-drawer__close')) ?? elements[0];
  (target ?? panelRef.value)?.focus?.();
}

function close() {
  modelValue.value = false;
  emit('close');
}

function onKeydown(event) {
  if (!props.modelValue) return;

  if (event.key === 'Escape') {
    event.stopPropagation();
    close();
    return;
  }

  if (event.key !== 'Tab') return;

  const elements = focusableElements();
  if (!elements.length) {
    event.preventDefault();
    panelRef.value?.focus();
    return;
  }

  const first = elements[0];
  const last = elements[elements.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && (active === first || active === panelRef.value)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

watch(
  () => modelValue.value,
  async (open) => {
    if (typeof document === 'undefined') return;

    if (open) {
      lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('app-drawer-open');
      document.addEventListener('keydown', onKeydown, true);
      await nextTick();
      focusFirst();
    } else {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('app-drawer-open');
      document.removeEventListener('keydown', onKeydown, true);
      lastFocused?.focus?.();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = previousOverflow;
  document.body.classList.remove('app-drawer-open');
  document.removeEventListener('keydown', onKeydown, true);
});
</script>

<style>
body.app-drawer-open {
  overflow: hidden;
}
</style>

<style scoped>
.app-drawer {
  position: fixed;
  z-index: 1200;
  inset: 0;
  display: flex;
  justify-content: flex-end;
}

.app-drawer__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(31, 20, 23, 0.38);
  cursor: pointer;
}

.app-drawer__panel {
  position: relative;
  display: flex;
  width: min(var(--drawer-width), 100vw);
  height: 100%;
  flex-direction: column;
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  outline: none;
}

.app-drawer__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.app-drawer__heading,
.app-drawer__title-row,
.app-drawer__actions {
  display: flex;
  align-items: center;
}

.app-drawer__heading {
  min-width: 0;
  gap: 12px;
}

.app-drawer__icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.app-drawer__title-wrap {
  min-width: 0;
}

.app-drawer__title-row {
  gap: 8px;
}

.app-drawer__title {
  margin: 0;
  color: var(--color-text-main);
  font-family: var(--font-heading, inherit);
  font-size: 19px;
  font-weight: 700;
}

.app-drawer__description {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.app-drawer__actions {
  gap: 8px;
}

.app-drawer__reset {
  padding: 6px 4px;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.app-drawer__reset:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}

.app-drawer__close {
  width: 34px !important;
  height: 34px !important;
  color: var(--color-text-secondary);
}

.app-drawer__body {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
  overscroll-behavior: contain;
}

.app-drawer__footer {
  position: sticky;
  bottom: 0;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-surface);
  box-shadow: 0 -6px 18px rgba(45, 21, 29, 0.04);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity var(--transition-normal);
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition: transform var(--transition-normal);
}

.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(100%);
}

@media (max-width: 540px) {
  .app-drawer__header {
    padding: 18px 16px 14px;
  }

  .app-drawer__body {
    padding: 0 16px;
  }

  .app-drawer__footer {
    padding: 14px 16px;
  }
}
</style>
