<template>
  <div class="catalog-filters">
    <div class="catalog-filters__toolbar">
      <button
        type="button"
        class="catalog-filters__date"
        :aria-label="dateLabel"
        aria-haspopup="dialog"
        @click="emit('open-date-picker')"
      >
        <span class="catalog-filters__date-icon">
          <IconCalendarMonth
            :size="18"
            color="var(--color-primary)"
            aria-hidden="true"
          />
        </span>
        <span class="catalog-filters__date-text">
          <span class="catalog-filters__date-caption">Интервал брони:</span>
          <span class="catalog-filters__date-value">{{ dateText }}</span>
        </span>
        <IconChevronDown :size="16" color="var(--color-text-muted)" aria-hidden="true" />
      </button>

      <div class="catalog-filters__search">
        <SearchInput
          :model-value="filters.search"
          size="md"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          @update:model-value="update({ search: $event })"
        />
      </div>

      <AppButton variant="secondary" size="md" @click="emit('open-filters-drawer')">
        <IconSliders :size="16" aria-hidden="true" />
        <span>Фильтры</span>
        <span v-if="filters.filterCount" class="catalog-filters__count">
          {{ filters.filterCount }}
        </span>
      </AppButton>

      <ViewModeToggle
        size="sm"
        v-model="viewMode"
      />
    </div>

    <div class="catalog-filters__categories" role="group" aria-label="Категории пространств">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        class="catalog-filters__category"
        :class="{ 'catalog-filters__category--active': activeCategory === category.id }"
        :aria-pressed="activeCategory === category.id"
        @click="update({ category: category.id })"
      >
        <span>{{ category.label }}</span>
        <span
          v-if="category.count !== null && category.count !== undefined"
          class="catalog-filters__category-count"
        >
          {{ category.count }}
        </span>
      </button>
    </div>

    <div class="catalog-filters__applied">
      <div v-if="hasActiveFilters" class="catalog-filters__applied-list">
        <span class="catalog-filters__applied-caption">Применено:</span>

        <AppChip
          v-for="tag in activeTags"
          :key="tag.id"
          :label="tag.label"
          :variant="tag.variant"
          size="sm"
          removable
          active
          @remove="removeTag(tag.id)"
        />

        <button type="button" class="catalog-filters__reset" @click="handleReset">
          Сбросить все
        </button>
      </div>

      <div class="catalog-filters__sort">
        <AppSelect
          :model-value="filters.sortBy"
          :options="sortOptions"
          label="Сортировка:"
          size="sm"
          @update:model-value="update({ sortBy: $event })"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AppButton from '../ui/AppButton.vue';
import AppChip from '../ui/AppChip.vue';
import AppSelect from '../ui/AppSelect.vue';
import SearchInput from '../ui/SearchInput.vue';
import ViewModeToggle from '../ui/ViewModeToggle.vue';
import IconCalendarMonth from '../ui/Icons/Shell&Navigation/IconCalendarMonth.vue';
import IconChevronDown from '../ui/Icons/Catalog Controls/IconChevronDown.vue';
import IconSliders from '../ui/Icons/Catalog Controls/IconSliders.vue';

const props = defineProps({
  categories: {
    type: Array,
    default: () => [
      { id: 'all', label: 'Все', count: 18 },
      { id: 'meeting', label: 'Переговорные комнаты', count: 8 },
      { id: 'desks', label: 'Рабочие места', count: 5 },
      { id: 'conf', label: 'Конференц-залы', count: 2 },
      { id: 'studios', label: 'Студии', count: 1 },
      { id: 'equipment', label: 'Оборудование', count: 2 },
    ],
  },
  sortOptions: {
    type: Array,
    default: () => [
      { value: 'capacity_desc', label: 'По вместимости (убыв.)' },
      { value: 'capacity_asc', label: 'По вместимости (возр.)' },
      { value: 'popular', label: 'По популярности' },
      { value: 'name', label: 'По названию' },
    ],
  },
  sortOptions: {
    type: Array,
    default: () => [
      { value: 'capacity_desc', label: 'По вместимости (убыв.)' },
      { value: 'capacity_asc', label: 'По вместимости (возр.)' },
      { value: 'popular', label: 'По популярности' },
      { value: 'name', label: 'По названию' },
    ],
  },
  searchPlaceholder: {
    type: String,
    default: 'Поиск по названию, этажу, опциям...',
  },
  datePlaceholder: {
    type: String,
    default: 'Выберите интервал',
  },
});

const emit = defineEmits([
  'filter-change',
  'reset',
  'open-filters-drawer',
  'open-date-picker',
]);

const filters = defineModel({
  type: Object,
  required: true,
});

const activeTags = computed(() => filters.value.activeTags ?? []);

const activeCategory = computed(() => filters.value.category ?? 'all');

const viewMode = computed({
  get: () => filters.value.viewMode ?? 'grid',
  set: (value) => update({ viewMode: value }),
});

const dateText = computed(() => filters.value.dateRangeText || props.datePlaceholder);

const dateLabel = computed(() => `Интервал бронирования: ${dateText.value}`);

const hasActiveFilters = computed(
  () =>
    activeTags.value.length > 0 ||
    activeCategory.value !== 'all' ||
    Boolean(filters.value.search),
);

function update(patch) {
  const next = { ...filters.value, ...patch };
  filters.value = next;
  emit('filter-change', next);
}

function removeTag(id) {
  update({ activeTags: activeTags.value.filter((tag) => tag.id !== id) });
}

function handleReset() {
  const next = { ...filters.value, search: '', category: 'all', activeTags: [] };
  filters.value = next;
  emit('filter-change', next);
  emit('reset');
}
</script>

<style scoped>
.catalog-filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

/* 1. Верхний тулбар */
.catalog-filters__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.catalog-filters__date {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  font-family: var(--font-body, inherit);
  color: var(--color-text-main);
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.catalog-filters__date:hover {
  background-color: var(--color-surface-subtle);
  border-color: var(--color-primary-light-hover);
}

.catalog-filters__date:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.catalog-filters__date-icon {
  display: inline-flex;
  color: var(--color-primary);
}

.catalog-filters__date-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1.2;
}

.catalog-filters__date-caption {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.catalog-filters__date-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-main);
  white-space: nowrap;
}

.catalog-filters__search {
  flex: 1;
  min-width: 220px;
}

.catalog-filters__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary-light);
  font-family: var(--font-heading, inherit);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
}

/* 2. Лента категорий */
.catalog-filters__categories {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.catalog-filters__categories::-webkit-scrollbar {
  display: none;
}

.catalog-filters__category {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background-color: var(--color-surface);
  font-family: var(--font-body, inherit);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.catalog-filters__category:hover {
  background-color: var(--color-surface-subtle);
  color: var(--color-text-main);
}

.catalog-filters__category:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.catalog-filters__category--active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-sm);
}

.catalog-filters__category--active:hover {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
}

.catalog-filters__category-count {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}

/* 3. Применённые фильтры и сортировка */
.catalog-filters__applied {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.catalog-filters__applied-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.catalog-filters__applied-caption {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.catalog-filters__reset {
  padding: 4px 6px;
  border: none;
  border-radius: var(--radius-xs);
  background-color: transparent;
  font-family: var(--font-body, inherit);
  font-size: 13px;
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.catalog-filters__reset:hover {
  color: var(--color-primary);
}

.catalog-filters__reset:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.catalog-filters__sort {
  width: 240px;
  max-width: 100%;
}

.catalog-filters__sort :deep(.app-select) {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.catalog-filters__sort :deep(.app-select__label) {
  margin-bottom: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.catalog-filters__sort :deep(.app-select__control) {
  flex: 1;
  min-width: 0;
}
</style>
