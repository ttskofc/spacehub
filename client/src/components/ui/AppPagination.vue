<template>
  <div
    class="app-pagination"
    :class="[
      `app-pagination--${size}`,
      `app-pagination--${variant}`,
      { 'app-pagination--disabled': disabled },
    ]"
  >
    <p v-if="showTotal" class="app-pagination__info">
      Показано
      <span class="app-pagination__info-num">{{ from }}</span>
      —
      <span class="app-pagination__info-num">{{ to }}</span>
      из
      <span class="app-pagination__info-num">{{ totalItemsCount }}</span>
      <span v-if="itemsLabel" class="app-pagination__info-label">{{ itemsLabel }}</span>
    </p>

    <div v-if="showPageSize" class="app-pagination__size">
      <span class="app-pagination__size-label">Показывать по:</span>
      <AppSelect
        class="app-pagination__select"
        :model-value="pageSize"
        :options="pageSizeOptions"
        size="sm"
        :disabled="disabled"
        aria-label="Элементов на странице"
        @update:modelValue="onSizeChange"
      />
    </div>

    <nav v-if="totalPages > 1" class="app-pagination__nav" aria-label="Пагинация">
      <button
        type="button"
        class="app-pagination__arrow app-pagination__arrow--prev"
        :disabled="isFirstPage"
        :aria-label="'Перейти на предыдущую страницу'"
        @click="go(currentPage - 1)"
      >
        <span class="app-pagination__icon app-pagination__icon--prev">
          <IconChevronDown :size="iconSize" />
        </span>
      </button>

      <template v-for="item in pageItems" :key="String(item)">
        <button
          v-if="typeof item === 'number'"
          type="button"
          class="app-pagination__page"
          :class="{ 'app-pagination__page--active': item === currentPage }"
          :disabled="disabled"
          :aria-current="item === currentPage ? 'page' : undefined"
          :aria-label="`Страница ${item}`"
          @click="go(item)"
        >
          {{ item }}
        </button>
        <span v-else class="app-pagination__ellipsis" aria-hidden="true">…</span>
      </template>

      <button
        type="button"
        class="app-pagination__arrow app-pagination__arrow--next"
        :disabled="isLastPage"
        :aria-label="'Перейти на следующую страницу'"
        @click="go(currentPage + 1)"
      >
        <span class="app-pagination__icon app-pagination__icon--next">
          <IconChevronDown :size="iconSize" />
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AppSelect from './AppSelect.vue';
import IconChevronDown from './Icons/Catalog Controls/IconChevronDown.vue';

const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
  pageSizeOptions: {
    type: Array,
    default: () => [6, 12, 24],
  },
  maxVisiblePages: {
    type: Number,
    default: 7,
  },
  showPageSize: {
    type: Boolean,
    default: true,
  },
  showTotal: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'cherry', // 'cherry' | 'clean'
    validator: (v) => ['cherry', 'clean'].includes(v),
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md'
    validator: (v) => ['sm', 'md'].includes(v),
  },
  itemsLabel: {
    type: String,
    default: 'элементов',
  },
});

const emit = defineEmits(['update:page', 'update:pageSize', 'page-change', 'size-change']);

const ICON_SIZES = { sm: 14, md: 16 };

const iconSize = computed(() => ICON_SIZES[props.size] ?? 16);

const resolvedPageSize = computed(() => Math.max(1, Math.floor(props.pageSize) || 1));

const totalItemsCount = computed(() => Math.max(0, props.totalItems));

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItemsCount.value / resolvedPageSize.value)),
);

const currentPage = computed(() =>
  Math.min(Math.max(1, props.page), totalPages.value),
);

const from = computed(() =>
  totalItemsCount.value === 0
    ? 0
    : (currentPage.value - 1) * resolvedPageSize.value + 1,
);

const to = computed(() =>
  Math.min(currentPage.value * resolvedPageSize.value, totalItemsCount.value),
);

const isFirstPage = computed(() => currentPage.value <= 1 || props.disabled);
const isLastPage = computed(() => currentPage.value >= totalPages.value || props.disabled);

const pageItems = computed(() => {
  const total = totalPages.value;
  if (total <= props.maxVisiblePages) return rangeFrom(1, total);

  const page = currentPage.value;
  const neighbors = Math.max(1, Math.floor((props.maxVisiblePages - 4) / 2));
  const startMax = neighbors + 3;
  const items = [];

  if (page <= startMax) {
    const end = Math.min(total, neighbors + 4);
    for (let i = 1; i <= end; i += 1) items.push(i);
    items.push(`ellipsis-${end}-${total}`);
    items.push(total);
  } else if (page >= total - (neighbors + 2)) {
    items.push(1);
    items.push(`ellipsis-2-${total - (neighbors + 3)}`);
    for (let i = total - (neighbors + 3); i <= total; i += 1) items.push(i);
  } else {
    items.push(1);
    items.push(`ellipsis-2-${page - neighbors}`);
    for (let i = page - neighbors; i <= page + neighbors; i += 1) items.push(i);
    items.push(`ellipsis-${page + neighbors}-${total}`);
    items.push(total);
  }

  return items;
});

function rangeFrom(start, end) {
  const result = [];
  for (let i = start; i <= end; i += 1) result.push(i);
  return result;
}

function go(page) {
  if (props.disabled) return;
  const target = Math.min(Math.max(1, page), totalPages.value);
  if (target === props.page) return;
  emit('update:page', target);
  emit('page-change', target);
}

function onSizeChange(newSize) {
  const size = Number(newSize);
  if (!size || size === props.pageSize) return;
  emit('update:pageSize', size);
  emit('size-change', size);
  emit('update:page', 1);
  emit('page-change', 1);
}
</script>

<style scoped>
.app-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-select-border);
  box-sizing: border-box;
}

.app-pagination--sm {
  padding: 12px 20px;
}

/* Информер диапазона */
.app-pagination__info {
  margin: 0;
  font-family: var(--font-body, inherit);
  font-size: 13px;
  line-height: 1.4;
  color: var(--color-pagination-info);
  white-space: nowrap;
}

.app-pagination__info-num {
  color: var(--color-pagination-text-hover);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Селектор лимита */
.app-pagination__size {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-pagination__size-label {
  font-size: 13px;
  line-height: 1.4;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.app-pagination__size :deep(.app-select) {
  width: 92px;
}

/* Навигация */
.app-pagination__nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-pagination__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--color-select-border);
  border-radius: var(--radius-8);
  background-color: var(--color-surface);
  color: var(--color-pagination-arrow);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.app-pagination__arrow--prev {
  margin-right: 4px;
}

.app-pagination__arrow--next {
  margin-left: 4px;
}

.app-pagination__arrow:hover:not(:disabled) {
  border-color: var(--color-pagination-hover-ring);
  background-color: var(--color-select-surface);
  color: var(--color-pagination-text-hover);
}

.app-pagination__arrow:disabled {
  opacity: 0.35;
  background-color: transparent;
  cursor: not-allowed;
}

.app-pagination__icon {
  display: inline-flex;
}

.app-pagination__icon--prev {
  transform: rotate(90deg);
}

.app-pagination__icon--next {
  transform: rotate(-90deg);
}

/* Кнопки страниц */
.app-pagination__page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-8);
  background-color: transparent;
  font-family: var(--font-body, inherit);
  font-size: 14px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--color-pagination-text);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.app-pagination__page:hover:not(:disabled) {
  border-color: var(--color-select-border);
  background-color: var(--color-surface-subtle);
  color: var(--color-pagination-text-hover);
}

.app-pagination__page:disabled {
  cursor: not-allowed;
}

.app-pagination__page--active,
.app-pagination__page--active:hover:not(:disabled) {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-weight: 600;
  box-shadow: 0 2px 6px var(--color-pagination-active-shadow);
}

.app-pagination--clean .app-pagination__page--active,
.app-pagination--clean .app-pagination__page--active:hover:not(:disabled) {
  border-color: var(--color-primary-light);
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  box-shadow: none;
}

/* Многоточие */
.app-pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 36px;
  color: var(--color-pagination-muted);
  user-select: none;
}

/* Компактный размер */
.app-pagination--sm .app-pagination__page,
.app-pagination--sm .app-pagination__arrow {
  width: 32px;
  height: 32px;
}

.app-pagination--sm .app-pagination__page {
  font-size: 13px;
}

.app-pagination--sm .app-pagination__ellipsis {
  width: 24px;
  height: 32px;
}

/* Фокус */
.app-pagination__page:focus-visible,
.app-pagination__arrow:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Заблокированная пагинация */
.app-pagination--disabled {
  cursor: not-allowed;
}
</style>