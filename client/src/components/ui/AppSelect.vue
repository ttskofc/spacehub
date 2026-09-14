<template>
  <div
    ref="rootRef"
    class="app-select"
    :class="[
      `app-select--${size}`,
      `app-select--${variant}`,
      {
        'app-select--open': isOpen,
        'app-select--disabled': disabled,
        'app-select--error': !!error,
        'app-select--has-icon': !!resolvedIcon,
      },
    ]"
    @keydown="onKeydown"
  >
    <label v-if="label" :id="labelId" class="app-select__label">
      {{ label }}
    </label>

    <div class="app-select__control">
      <button
        ref="triggerRef"
        type="button"
        class="app-select__trigger"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-labelledby="label ? labelId : undefined"
        :aria-activedescendant="isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        :disabled="disabled"
        @click="toggle"
      >
        <span v-if="resolvedIcon" class="app-select__icon">
          <component :is="resolvedIcon" aria-hidden="true" :size="iconSize" />
        </span>

        <span
          class="app-select__value"
          :class="{ 'app-select__value--placeholder': !hasValue }"
        >
          {{ displayValue }}
        </span>

        <span v-if="!showClear" class="app-select__chevron" aria-hidden="true">
          <IconChevronDown :size="chevronSize" />
        </span>
      </button>

      <button
        v-if="showClear"
        ref="clearRef"
        type="button"
        class="app-select__clear"
        :aria-label="`Сбросить: ${placeholder}`"
        @click="clear"
      >
        <IconClose :size="14" />
      </button>

      <Teleport to="body">
        <div
          v-if="isOpen"
          ref="menuRef"
          class="app-select__menu"
          :class="`app-select__menu--${placement}`"
          :style="menuStyle"
          role="listbox"
          :aria-labelledby="label ? labelId : undefined"
          @keydown="onKeydown"
        >
          <div v-if="searchable" class="app-select__search">
            <input
              ref="searchRef"
              v-model="searchTerm"
              type="text"
              class="app-select__search-input"
              :placeholder="searchPlaceholder || 'Поиск…'"
              aria-label="Поиск по списку"
            />
          </div>

          <ul class="app-select__list">
            <li
              v-for="(option, index) in displayedOptions"
              :id="optionId(index)"
              :key="option.key"
              class="app-select__option"
              :class="{
                'app-select__option--selected': isSelected(option),
                'app-select__option--active': index === activeIndex,
                'app-select__option--matcha': option.matcha && isSelected(option),
                'app-select__option--disabled': option.disabled,
              }"
              role="option"
              :aria-selected="isSelected(option)"
              :aria-disabled="option.disabled || undefined"
              @click="selectOption(option)"
              @mouseenter="setActive(index)"
            >
              <span class="app-select__option-main">
                <span v-if="option.icon" class="app-select__option-icon">
                  <component :is="option.icon" aria-hidden="true" :size="14" />
                </span>

                <span class="app-select__option-text">
                  <span class="app-select__option-label">{{ option.label }}</span>
                  <span v-if="option.description" class="app-select__option-description">
                    {{ option.description }}
                  </span>
                </span>
              </span>

              <span class="app-select__option-extra">
                <span v-if="option.badge" class="app-select__option-badge">{{ option.badge }}</span>

                <span v-if="isSelected(option)" class="app-select__option-marker">
                  <span v-if="option.matcha" class="app-select__option-dot"></span>
                  <IconCheck v-else :size="14" />
                </span>
              </span>
            </li>

            <li v-if="!displayedOptions.length" class="app-select__empty">Ничего не найдено</li>
          </ul>
        </div>
      </Teleport>
    </div>

    <p v-if="errorText" class="app-select__message app-select__message--error" role="alert">
      {{ errorText }}
    </p>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import IconCheck from './Icons/Catalog Controls/IconCheck.vue';
import IconChevronDown from './Icons/Catalog Controls/IconChevronDown.vue';
import IconClose from './Icons/Catalog Controls/IconClose.vue';

const props = defineProps({
  modelValue: {
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Выберите...',
  },
  label: {
    type: String,
    default: '',
  },
  icon: {
    default: null,
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg'
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  variant: {
    type: String,
    default: 'default', // 'default' | 'surface' | 'clean'
    validator: (v) => ['default', 'surface', 'clean'].includes(v),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [Boolean, String],
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  placement: {
    type: String,
    default: 'bottom-start', // 'bottom-start' | 'bottom-end' | 'top-start'
    validator: (v) => ['bottom-start', 'bottom-end', 'top-start'].includes(v),
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  searchPlaceholder: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'clear']);

const uid = useId();
const labelId = `${uid}-label`;
const optionId = (index) => `${uid}-opt-${index}`;

const rootRef = ref(null);
const triggerRef = ref(null);
const clearRef = ref(null);
const searchRef = ref(null);
const menuRef = ref(null);

const menuStyle = ref({});

const isOpen = ref(false);
const activeIndex = ref(-1);
const searchTerm = ref('');

const ICON_SIZES = { sm: 14, md: 16, lg: 18 };

const iconSize = computed(() => ({ sm: 14, md: 16, lg: 20 })[props.size] ?? 16);
const chevronSize = computed(() => ICON_SIZES[props.size] ?? 16);

const resolvedIcon = computed(() =>
  props.icon && typeof props.icon !== 'string' ? props.icon : null,
);

const errorText = computed(() =>
  typeof props.error === 'string' ? props.error : '',
);

const hasValue = computed(() =>
  props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '',
);

const showClear = computed(() => props.clearable && hasValue.value && !props.disabled);

const normOptions = computed(() =>
  props.options.map((item, index) => normalizeOption(item, index)),
);

function normalizeOption(item, index) {
  if (item && typeof item === 'object') {
    return {
      label: item.label != null ? String(item.label) : '',
      value: item.value,
      disabled: Boolean(item.disabled),
      icon: item.icon ?? null,
      description: item.description ?? '',
      badge: item.badge ?? '',
      matcha: Boolean(item.matcha),
      key: `opt-${index}`,
    };
  }
  return {
    label: String(item),
    value: item,
    disabled: false,
    icon: null,
    description: '',
    badge: '',
    matcha: false,
    key: `opt-${index}`,
  };
}

const displayedOptions = computed(() => {
  if (!props.searchable || !searchTerm.value) return normOptions.value;
  const query = searchTerm.value.trim().toLowerCase();
  if (!query) return normOptions.value;
  return normOptions.value.filter((o) => o.label.toLowerCase().includes(query));
});

function isSelected(option) {
  return option.value === props.modelValue;
}

const selectedIndex = computed(() =>
  normOptions.value.findIndex((o) => o.value === props.modelValue),
);

const displayValue = computed(() => {
  const selected = normOptions.value.find((o) => o.value === props.modelValue);
  return selected ? selected.label : props.placeholder;
});

function toggle() {
  if (isOpen.value) closeMenu();
  else openMenu();
}

function openMenu() {
  if (props.disabled || isOpen.value) return;
  isOpen.value = true;
  searchTerm.value = '';
  activeIndex.value = selectedIndex.value;
  nextTick(() => {
    if (props.searchable && searchRef.value) searchRef.value.focus();
  });
}

function closeMenu(refocus = false) {
  if (!isOpen.value) return;
  isOpen.value = false;
  activeIndex.value = -1;
  if (refocus) nextTick(() => triggerRef.value?.focus());
}

function selectOption(option) {
  if (!option || option.disabled) return;
  if (option.value !== props.modelValue) {
    emit('update:modelValue', option.value);
    emit('change', option.value);
  }
  closeMenu();
}

function clear() {
  if (props.disabled) return;
  const hadValue = hasValue.value;
  emit('update:modelValue', null);
  if (hadValue) emit('change', null);
  emit('clear');
}

function setActive(index) {
  activeIndex.value = index;
}

function moveActive(delta) {
  const list = displayedOptions.value;
  if (!list.length) return;
  let index = activeIndex.value;
  if (index === -1) index = delta > 0 ? -1 : list.length;
  for (let step = 0; step < list.length; step += 1) {
    index = (index + delta + list.length) % list.length;
    if (!list[index].disabled) {
      activeIndex.value = index;
      return;
    }
  }
}

function moveToEdge(delta) {
  const list = displayedOptions.value;
  if (!list.length) return;
  if (delta > 0) {
    for (let i = 0; i < list.length; i += 1) {
      if (!list[i].disabled) {
        activeIndex.value = i;
        return;
      }
    }
  } else {
    for (let i = list.length - 1; i >= 0; i -= 1) {
      if (!list[i].disabled) {
        activeIndex.value = i;
        return;
      }
    }
  }
}

function onKeydown(e) {
  if (props.disabled) return;

  const typingInSearch = props.searchable && e.target === searchRef.value;

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!isOpen.value) openMenu();
    moveActive(e.key === 'ArrowDown' ? 1 : -1);
    return;
  }

  if (e.key === 'Home' || e.key === 'End') {
    if (!isOpen.value) return;
    e.preventDefault();
    moveToEdge(e.key === 'Home' ? 1 : -1);
    return;
  }

  if (e.key === 'Escape') {
    if (isOpen.value) {
      e.preventDefault();
      closeMenu(true);
    }
    return;
  }

  if (e.key === 'Enter') {
    if (isOpen.value && activeIndex.value >= 0) {
      e.preventDefault();
      selectOption(displayedOptions.value[activeIndex.value]);
    }
    return;
  }

  if (e.key === ' ' && !typingInSearch) {
    if (isOpen.value) {
      e.preventDefault();
      if (activeIndex.value >= 0) selectOption(displayedOptions.value[activeIndex.value]);
      else closeMenu();
    }
  }
}

function onClickOutside(e) {
  if (rootRef.value?.contains(e.target)) return;
  if (menuRef.value?.contains(e.target)) return;
  closeMenu();
}

watch(displayedOptions, (list) => {
  if (activeIndex.value >= list.length) activeIndex.value = -1;
});

function applyMenuPosition() {
  if (!isOpen.value || !triggerRef.value || !menuRef.value) return;

  const trigger = triggerRef.value.getBoundingClientRect();
  const menu = menuRef.value.getBoundingClientRect();
  const gap = 4;
  const margin = 8;

  const spaceBelow = window.innerHeight - trigger.bottom;
  const spaceAbove = trigger.top;

  const wantsTop = props.placement.startsWith('top');
  const fitsBelow = spaceBelow >= menu.height + gap + margin;
  const fitsAbove = spaceAbove >= menu.height + gap + margin;
  const openBelow = wantsTop ? fitsBelow && !fitsAbove : fitsBelow || !fitsAbove;

  const toRight = props.placement.endsWith('end');
  const desiredLeft = toRight ? trigger.right - menu.width : trigger.left;

  menuStyle.value = {
    width: `${trigger.width}px`,
    top: openBelow ? `${trigger.bottom + gap}px` : `${trigger.top - menu.height - gap}px`,
    left: `${Math.min(Math.max(margin, desiredLeft), window.innerWidth - menu.width - margin)}px`,
  };
}

function onReposition() {
  applyMenuPosition();
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('click', onClickOutside);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    nextTick(applyMenuPosition);
  } else {
    document.removeEventListener('click', onClickOutside);
    window.removeEventListener('resize', onReposition);
    window.removeEventListener('scroll', onReposition, true);
  }
});

watch(searchTerm, () => {
  if (isOpen.value) nextTick(applyMenuPosition);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
  window.removeEventListener('resize', onReposition);
  window.removeEventListener('scroll', onReposition, true);
});
</script>

<style scoped>
.app-select {
  display: inline-flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.app-select__label {
  margin-bottom: 6px;
  font-family: var(--font-body, inherit);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-text-main);
}

.app-select__control {
  position: relative;
  width: 100%;
}

.app-select__trigger {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 40px;
  padding: 8px 36px 8px 14px;
  border: 1px solid var(--color-select-border);
  border-radius: var(--radius-8);
  background-color: var(--color-surface);
  font-family: var(--font-body, inherit);
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-select-text);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.app-select__trigger:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-select-focus-ring);
}

.app-select__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-select__value--placeholder {
  color: var(--color-select-placeholder);
}

.app-select__icon {
  position: absolute;
  top: 50%;
  left: 14px;
  display: inline-flex;
  transform: translateY(-50%);
  color: var(--color-select-icon);
  pointer-events: none;
}

.app-select__chevron {
  position: absolute;
  top: 50%;
  right: 12px;
  display: inline-flex;
  transform: translateY(-50%);
  color: var(--color-select-icon);
  pointer-events: none;
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    color var(--transition-fast);
}

.app-select--open .app-select__chevron {
  transform: translateY(-50%) rotate(180deg);
  color: var(--color-primary);
}

.app-select__clear {
  position: absolute;
  top: 50%;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  transform: translateY(-50%);
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: var(--color-select-icon);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.app-select__clear:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-main);
}

/* Размеры */
.app-select--sm .app-select__trigger {
  min-height: 32px;
  padding: 4px 28px 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.app-select--sm .app-select__icon {
  left: 10px;
}

.app-select--sm .app-select__chevron,
.app-select--sm .app-select__clear {
  right: 10px;
}

.app-select--sm .app-select__clear {
  width: 18px;
  height: 18px;
}

.app-select--lg .app-select__trigger {
  min-height: 48px;
  padding: 12px 42px 12px 18px;
  border-radius: var(--radius-md);
  font-size: 15px;
}

.app-select--lg .app-select__icon {
  left: 16px;
}

.app-select--lg .app-select__chevron,
.app-select--lg .app-select__clear {
  right: 16px;
}

.app-select--has-icon .app-select__trigger {
  padding-left: 38px;
}

.app-select--sm.app-select--has-icon .app-select__trigger {
  padding-left: 32px;
}

.app-select--lg.app-select--has-icon .app-select__trigger {
  padding-left: 44px;
}

/* Варианты */
.app-select--surface .app-select__trigger {
  background-color: var(--color-surface-subtle);
  border-color: transparent;
}

.app-select--clean .app-select__trigger {
  background-color: transparent;
  border-color: transparent;
}

.app-select--clean.app-select--has-icon .app-select__trigger {
  padding-left: 26px;
}

/* Наведение */
.app-select:not(.app-select--disabled):not(.app-select--open) .app-select__trigger:hover {
  background-color: var(--color-select-surface);
  border-color: var(--color-select-hover-ring);
}

.app-select--surface:not(.app-select--disabled):not(.app-select--open) .app-select__trigger:hover {
  background-color: var(--color-surface-hover);
  border-color: transparent;
}

.app-select--clean:not(.app-select--disabled):not(.app-select--open) .app-select__trigger:hover {
  background-color: var(--color-surface-subtle);
  border-color: transparent;
}

/* Открыт / активен */
.app-select--open .app-select__trigger {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-select-focus-ring);
}

/* Ошибка */
.app-select--error .app-select__trigger {
  border-color: var(--color-select-error);
  box-shadow: 0 0 0 3px var(--color-select-error-ring);
}

.app-select--error .app-select__trigger:focus-visible {
  box-shadow: 0 0 0 3px var(--color-select-error-ring);
}

.app-select__message {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-muted);
}

.app-select__message--error {
  color: var(--color-select-error);
}

/* Отключено */
.app-select--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-select--disabled .app-select__trigger {
  background-color: var(--color-surface-hover);
  cursor: not-allowed;
}

/* Выпадающее меню */
.app-select__menu {
  position: fixed;
  z-index: 1000;
  width: max-content;
  min-width: auto;
  max-width: calc(100vw - 32px);
  max-height: 272px;
  padding: 6px;
  overflow-y: auto;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-select);
  box-sizing: border-box;
}

.app-select__search {
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.app-select__search-input {
  width: 100%;
  min-height: 32px;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-subtle);
  font-family: var(--font-body, inherit);
  font-size: 13px;
  color: var(--color-select-text);
  outline: none;
  box-sizing: border-box;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.app-select__search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.app-select__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.app-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 36px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-family: var(--font-body, inherit);
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-select-text);
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.app-select__option:hover,
.app-select__option--active {
  background-color: var(--color-surface-subtle);
}

.app-select__option--selected {
  background-color: var(--color-select-option-selected);
  color: var(--color-primary);
  font-weight: 600;
}

.app-select__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-select__option--disabled:hover,
.app-select__option--disabled.app-select__option--active {
  background-color: transparent;
}

.app-select__option-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.app-select__option-icon {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-select-icon);
}

.app-select__option-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-select__option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-select__option-description {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.app-select__option-extra {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.app-select__option-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-select-slot-bg);
  color: var(--color-select-slot);
  font-family: var(--font-heading, inherit);
  font-size: 11px;
  font-weight: 600;
}

.app-select__option-marker {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-primary);
}

.app-select__option-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-accent-matcha);
}

.app-select__option--matcha {
  background-color: var(--color-accent-matcha-light);
  color: var(--color-accent-matcha-dark);
}

.app-select__option--matcha .app-select__option-marker {
  color: var(--color-accent-matcha);
}

.app-select__empty {
  padding: 12px 10px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>