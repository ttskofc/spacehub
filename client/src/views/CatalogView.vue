<template>
  <div class="catalog-page">
    <CatalogHeader
      title="Ресурсы организации"
      description="Интерактивный каталог переговорных, рабочих мест и конференц-залов"
      :stats="catalog.stats"
    />

    <div ref="filtersPanelRef" class="catalog-page__filters">
      <CatalogFilters
        v-model="catalog.filters"
        :categories="filterCategories"
        :active-filters="catalog.activeFilterItems"
        :active-filter-count="catalog.activeFilterCount"
        @open-filters-drawer="openFiltersDrawer"
        @open-date-picker="openDatePicker"
        @remove-filter="onRemoveFilter"
        @reset="resetAllFilters"
      />
      <CatalogDatePicker
        v-if="datePickerOpen"
        v-model="catalog.filters"
        class="catalog-page__date-picker"
        @apply="applyDateFilter"
        @clear="clearDateFilter"
        @close="datePickerOpen = false"
      />
      <ResourceFiltersDrawer
        v-model="catalog.filters"
        v-model:open="filtersOpen"
        v-model:draft="draftFilters"
        :categories="filterCategories"
        :range="capacityRange"
        :date="dateFilterConfig"
        :equipment="equipmentOptions"
        :tags="locationOptions"
        :availability="availabilityOption"
        :result-count="draftResultCount"
        @reset="onDrawerReset"
        @open-date-picker="openDatePicker"
      />
    </div>

    <p v-if="catalog.slotsLoading && !catalog.loading" class="catalog-page__hint" role="status">
      Обновляем занятость ресурсов...
    </p>

    <div v-if="catalog.error" class="catalog-state catalog-state--error" role="alert">
      <h2 class="catalog-state__title">Каталог недоступен</h2>
      <p class="catalog-state__text">{{ catalog.error }}</p>
      <p class="catalog-state__text catalog-state__text--muted">
        Проверьте, что запущены веб-сервер 1С и API-гейтвей на порту 8000.
      </p>
      <AppButton variant="primary" @click="reload">Повторить</AppButton>
    </div>

    <div v-else-if="catalog.loading" class="resource-grid" aria-busy="true">
      <div v-for="index in pageSize" :key="index" class="resource-skeleton">
        <div class="resource-skeleton__media" />
        <div class="resource-skeleton__body">
          <div class="resource-skeleton__line resource-skeleton__line--title" />
          <div class="resource-skeleton__line" />
          <div class="resource-skeleton__line resource-skeleton__line--short" />
        </div>
        <div class="resource-skeleton__footer" />
      </div>
    </div>

    <div v-else-if="catalog.isFilteredEmpty" class="catalog-state">
      <h2 class="catalog-state__title">Ничего не нашлось</h2>
      <p class="catalog-state__text">Под выбранные условия не подходит ни один ресурс.</p>
      <AppButton variant="secondary" @click="resetAllFilters">Сбросить фильтры</AppButton>
    </div>

    <div
      v-else-if="!catalog.isEmpty"
      class="resource-grid"
      :class="{ 'resource-grid--list': catalog.viewMode === 'list' }"
    >
      <ResourceCard
        v-for="resource in catalog.paged"
        :key="resource.id"
        :resource="resource"
        :view-mode="catalog.viewMode"
        @book="onBook"
        @details="onDetails"
        @toggle-bookmark="catalog.toggleBookmark"
      />
    </div>

    <div v-if="catalog.paged.length" class="catalog-page__pagination">
      <AppPagination
        :page="catalog.page"
        :page-size="catalog.pageSize"
        :total-items="catalog.total"
        items-label=" ресурсов"
        @update:page="catalog.setPage"
        @update:page-size="catalog.setPageSize"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import AppButton from '../components/ui/AppButton.vue';
import AppPagination from '../components/ui/AppPagination.vue';
import CatalogFilters from '../components/catalog/CatalogFilters.vue';
import CatalogHeader from '../components/catalog/CatalogHeader.vue';
import ResourceCard from '../components/catalog/ResourceCard.vue';
import ResourceFiltersDrawer from '../components/resource/ResourceFiltersDrawer.vue';
import CatalogDatePicker from '../components/catalog/CatalogDatePicker.vue';
import { createDefaultFilters, useCatalogStore } from '../stores/catalog';

const catalog = useCatalogStore();
const router = useRouter();
const { pageSize } = storeToRefs(catalog);
const filtersOpen = ref(false);
const datePickerOpen = ref(false);
const filtersPanelRef = ref(null);

const filterCategories = computed(() =>
  catalog.categoriesWithCounts.filter((category) => category.id !== 'all'),
);
const capacityRange = computed(() => {
  const bounds = catalog.capacityBounds;
  if (!bounds) return null;
  const { min, max } = bounds;
  return {
    min,
    max,
    step: 1,
    marks: [
      { value: min, label: String(min) },
      { value: max, label: String(max) },
    ],
    formatValue: (value) => `${value[0]}–${value[1]} чел.`,
  };
});
const equipmentOptions = computed(() => {
  const values = new Map();
  for (const resource of catalog.cards) {
    for (const feature of resource.features ?? []) {
      const label = typeof feature === 'string' ? feature : feature.label;
      if (label) values.set(label, label);
    }
  }
  return [...values.values()]
    .sort((a, b) => a.localeCompare(b, 'ru'))
    .map((label) => ({ id: label, label }));
});
const locationOptions = computed(() => {
  const values = new Map();
  for (const resource of catalog.cards) {
    if (resource.location) values.set(resource.location, resource.location);
  }
  return [...values.values()]
    .sort((a, b) => a.localeCompare(b, 'ru'))
    .map((label) => ({ id: label, label }));
});
const availabilityOption = computed(() => ({
  label: 'Только доступные',
  description: 'Показать ресурсы со свободным временем сегодня',
}));
const dateFilterConfig = computed(() => ({
  label: 'Интервал бронирования',
  placeholder: catalog.filters.dateRangeText || 'Выберите дату и время',
}));

const draftFilters = ref(createDefaultFilters());

const draftResultCount = computed(() => {
  const draft = draftFilters.value;
  const hasDraftCriteria =
    Boolean(draft.search) ||
    Boolean(draft.date) ||
    (draft.categories?.length ?? 0) > 0 ||
    (draft.category && draft.category !== 'all') ||
    (draft.tags?.length ?? 0) > 0 ||
    (draft.equipment?.length ?? 0) > 0 ||
    Boolean(draft.onlyAvailable) ||
    Boolean(draft.timeSlot) ||
    Array.isArray(draft.range);
  if (!hasDraftCriteria) return null;
  return catalog.countForFilters(draft);
});

function openFiltersDrawer() {
  draftFilters.value = { ...createDefaultFilters(), ...catalog.filters };
  filtersOpen.value = true;
}

function onDrawerApply(next) {
  catalog.applyFilters(next);
  draftFilters.value = { ...next };
  catalog.refreshSlots();
}

function onRemoveFilter(id) {
  catalog.removeFilter(id);
}

function onDrawerReset() {
  draftFilters.value = createDefaultFilters();
  catalog.refreshSlots();
}

function resetAllFilters() {
  catalog.resetFilters();
  draftFilters.value = createDefaultFilters();
  catalog.refreshSlots();
}

function applyDateFilter(value) {
  catalog.applyFilters({ ...catalog.filters, ...value });
  datePickerOpen.value = false;
  catalog.loadSlotsForFilterDate();
}

function openDatePicker() {
  filtersOpen.value = false;
  datePickerOpen.value = true;
}

function clearDateFilter() {
  catalog.applyFilters({ ...catalog.filters, date: '', timeStart: '', timeEnd: '', dateRangeText: 'Выберите дату и время' });
  datePickerOpen.value = false;
}

function onDocumentPointerDown(event) {
  if (!datePickerOpen.value) return;
  const panel = filtersPanelRef.value;
  if (panel && panel.contains(event.target)) return;
  datePickerOpen.value = false;
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape' && datePickerOpen.value) {
    datePickerOpen.value = false;
  }
}

onMounted(() => {
  catalog.load();
  document.addEventListener('pointerdown', onDocumentPointerDown, true);
  document.addEventListener('keydown', onDocumentKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true);
  document.removeEventListener('keydown', onDocumentKeydown);
});

async function reload() {
  await catalog.reload();
}

function onBook(resource) {
  router.push({ name: 'resource-detail', params: { id: resource.id } });
}

function onDetails(resource) {
  router.push({ name: 'resource-detail', params: { id: resource.id } });
}
</script>

<style scoped>
.catalog-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1240px;
  padding: 24px;
  box-sizing: border-box;
}

.catalog-page__filters {
  position: relative;
  z-index: 10;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.catalog-page__date-picker {
  position: absolute;
  z-index: 20;
  top: 76px;
  left: 20px;
  margin: 0;
}

.catalog-page__hint {
  font-size: 12px;
  color: var(--color-text-muted);
}

.catalog-page__pagination {
  padding: 8px 16px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.resource-grid--list {
  grid-template-columns: 1fr;
}

.catalog-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  text-align: center;
}

.catalog-state--error {
  border-color: var(--color-danger-border);
  background: var(--color-danger-bg);
}

.catalog-state__title {
  margin: 0;
  font-family: var(--font-heading, sans-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
}

.catalog-state__text {
  margin: 0;
  max-width: 520px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.catalog-state__text--muted {
  color: var(--color-text-muted);
}

.resource-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 320px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
}

.resource-skeleton__media {
  height: 150px;
  border-radius: var(--radius-sm);
}

.resource-skeleton__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-skeleton__footer {
  height: 36px;
  margin-top: auto;
  border-radius: var(--radius-sm);
}

.resource-skeleton__media,
.resource-skeleton__line,
.resource-skeleton__footer {
  background: linear-gradient(90deg, var(--color-surface-subtle), var(--color-surface-hover), var(--color-surface-subtle));
  background-size: 200% 100%;
  animation: catalog-skeleton 1.2s ease-in-out infinite;
}

.resource-skeleton__line {
  height: 12px;
}

.resource-skeleton__line--title {
  width: 60%;
  height: 16px;
}

.resource-skeleton__line--short {
  width: 40%;
}

@keyframes catalog-skeleton {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 720px) {
  .catalog-page__date-picker {
    left: 50%;
    width: min(320px, calc(100vw - 48px));
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .resource-skeleton__media,
  .resource-skeleton__line,
  .resource-skeleton__footer {
    animation: none;
  }
}
</style>
