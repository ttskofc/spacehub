<template>
  <AppDrawer
    v-model="isOpen"
    :title="title"
    :description="description"
    :width="width"
    :badge-count="draftActiveCount"
    :reset-label="labels.resetAll"
    labelledby="filters-drawer-title"
    @reset="resetDraft"
  >
    <h2 id="filters-drawer-title" class="filters-visually-hidden">{{ title }}</h2>

    <section v-if="categories.length" class="filters-section" aria-labelledby="filters-categories-title">
      <div class="filters-section__heading">
        <h3 id="filters-categories-title">{{ sectionTitles.categories }}</h3>
        <button type="button" class="filters-link" @click="selectAllCategories">
          {{ allSelected ? labels.deselectAll : labels.selectAll }}
        </button>
      </div>
      <div class="category-list">
        <AppCheckbox
          v-for="category in categories"
          :key="category.id"
          :model-value="selectedCategories.includes(category.id)"
          :label="category.label"
          :badge="category.count"
          :disabled="category.count === 0 && !selectedCategories.includes(category.id)"
          variant="card"
          size="md"
          @update:model-value="toggleCategory(category.id, $event)"
        />
      </div>
    </section>

    <section v-if="range" class="filters-section" aria-labelledby="filters-range-title">
      <div class="filters-section__heading">
        <h3 id="filters-range-title">{{ sectionTitles.range }}</h3>
        <span class="value-badge">{{ rangeValueLabel }}</span>
      </div>
      <AppRangeSlider
        v-model="rangeValue"
        :min="range.min"
        :max="range.max"
        :step="range.step"
        :marks="range.marks"
        :format-value="range.formatValue"
      />
      <div v-if="range.presets?.length" class="preset-list">
        <button
          v-for="preset in range.presets"
          :key="preset.id"
          type="button"
          class="preset"
          :class="{ 'preset--active': isPresetActive(preset) }"
          @click="rangeValue = [preset.min, preset.max]"
        >
          {{ preset.label }}
        </button>
      </div>
    </section>

    <section v-if="date || timeSlots.length" class="filters-section" aria-labelledby="filters-date-title">
      <div class="filters-section__heading">
        <h3 id="filters-date-title">{{ sectionTitles.date }}</h3>
      </div>
      <button v-if="date" type="button" class="date-control" @click="emit('open-date-picker')">
        <span class="date-control__icon" aria-hidden="true"><IconCalendarMonth :size="18" /></span>
        <span class="date-control__copy">
          <span>{{ date.label }}</span>
          <strong>{{ draft.date || date.placeholder }}</strong>
        </span>
        <span class="date-control__edit">{{ labels.edit }}</span>
      </button>
      <div v-if="timeSlots.length" class="time-grid" role="group" :aria-label="sectionTitles.date">
        <button
          v-for="slot in timeSlots"
          :key="slot.id"
          type="button"
          class="time-card"
          :class="{ 'time-card--active': draft.timeSlot === slot.id }"
          :aria-pressed="draft.timeSlot === slot.id"
          @click="update({ timeSlot: draft.timeSlot === slot.id ? '' : slot.id })"
        >
          <strong>{{ slot.label }}</strong>
          <span>{{ slot.description }}</span>
          <span class="time-card__indicator" aria-hidden="true" />
        </button>
      </div>
    </section>

    <section v-if="tags.length" class="filters-section" aria-labelledby="filters-tags-title">
      <div class="filters-section__heading">
        <h3 id="filters-tags-title">{{ sectionTitles.tags }}</h3>
        <span class="section-count">{{ labels.selected }}: {{ selectedTags.length }}</span>
      </div>
      <div class="chip-list">
        <AppChip
          v-for="tag in tags"
          :key="tag.id"
          :label="tag.label"
          :active="selectedTags.includes(tag.id)"
          size="sm"
          @click="toggleArrayValue('tags', tag.id)"
        />
      </div>
    </section>

    <section v-if="equipment.length" class="filters-section" aria-labelledby="filters-equipment-title">
      <div class="filters-section__heading">
        <h3 id="filters-equipment-title">{{ sectionTitles.equipment }}</h3>
      </div>
      <div class="equipment-grid">
        <AppCheckbox
          v-for="item in equipment"
          :key="item.id"
          :model-value="selectedEquipment.includes(item.id)"
          :label="item.label"
          size="sm"
          @update:model-value="toggleEquipment(item.id, $event)"
        />
      </div>
    </section>

    <section v-if="availability" class="filters-section filters-section--last" aria-labelledby="filters-availability-title">
      <div class="availability-card">
        <span class="availability-card__dot" aria-hidden="true" />
        <span class="availability-card__copy">
          <strong id="filters-availability-title">{{ availability.label }}</strong>
          <small>{{ availability.description }}</small>
        </span>
        <AppSwitch
          :model-value="Boolean(draft.onlyAvailable)"
          :label="availability.label"
          @update:model-value="update({ onlyAvailable: $event })"
        />
      </div>
    </section>

    <template #footer>
      <div class="drawer-footer">
        <AppButton block size="lg" @click="applyFilters">
          {{ labels.apply }} <span v-if="resultCount !== null" class="footer-count">{{ resultCount }}</span>
        </AppButton>
        <AppButton variant="secondary" block @click="resetDraft">{{ labels.reset }}</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script setup>
import { computed, watch } from 'vue';
import AppButton from '../ui/AppButton.vue';
import AppCheckbox from '../ui/AppCheckbox.vue';
import AppChip from '../ui/AppChip.vue';
import AppDrawer from '../ui/AppDrawer.vue';
import AppRangeSlider from '../ui/AppRangeSlider.vue';
import AppSwitch from '../ui/AppSwitch.vue';
import IconCalendarMonth from '../ui/Icons/Shell&Navigation/IconCalendarMonth.vue';
import { createDefaultFilters } from '../../stores/catalog.js';
import { isNonCountableResource } from '../../utils/resourceCategory.js';

const props = defineProps({
  title: { type: String, default: 'Фильтры' },
  description: { type: String, default: '' },
  width: { type: [Number, String], default: '420px' },
  categories: { type: Array, default: () => [] },
  range: { type: Object, default: null },
  date: { type: Object, default: null },
  timeSlots: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  equipment: { type: Array, default: () => [] },
  availability: { type: Object, default: null },
  resultCount: { type: Number, default: null },
  sectionTitles: {
    type: Object,
    default: () => ({
      categories: 'Тип ресурса',
      range: 'Вместимость',
      date: 'Дата и время',
      tags: 'Зоны',
      equipment: 'Оснащение',
    }),
  },
  labels: {
    type: Object,
    default: () => ({
      selectAll: 'Выбрать все',
      deselectAll: 'Снять все',
      selected: 'Выбрано',
      edit: 'Изменить',
      apply: 'Применить',
      reset: 'Сбросить',
      resetAll: 'Сбросить все',
    }),
  },
});

const emit = defineEmits(['apply', 'reset', 'open-date-picker']);

const filters = defineModel({ type: Object, required: true });
const open = defineModel('open', { type: Boolean, default: false });
const draft = defineModel('draft', { type: Object, default: () => createDefaultFilters() });

const isOpen = computed({
  get: () => open.value,
  set: (value) => {
    if (!value) cancelDraft();
    open.value = value;
  },
});

function createDraft() {
  return { ...createDefaultFilters(), ...filters.value };
}

const workingDraft = computed({
  get: () => draft.value ?? createDraft(),
  set: (value) => {
    draft.value = value;
  },
});

watch(
  () => open.value,
  (value) => {
    if (value) workingDraft.value = createDraft();
  },
);

watch(
  () => filters.value,
  () => {
    if (!open.value) workingDraft.value = createDraft();
  },
  { deep: true },
);

const selectedCategories = computed(() => {
  const categories = Array.isArray(workingDraft.value.categories) ? workingDraft.value.categories : [];
  if (categories.length) return categories;
  const category = workingDraft.value.category;
  return category && category !== 'all' ? [category] : [];
});
const selectedTags = computed(() => workingDraft.value.tags ?? []);
const selectedEquipment = computed(() => workingDraft.value.equipment ?? []);

const rangeValue = computed({
  get: () => {
    const range = workingDraft.value.range;
    if (Array.isArray(range) && range.length === 2) return range;
    return [props.range?.min ?? 0, props.range?.max ?? 100];
  },
  set: (value) => update({ range: value }),
});
const rangeValueLabel = computed(() =>
  props.range?.formatValue
    ? props.range.formatValue(rangeValue.value)
    : `${rangeValue.value[0]} – ${rangeValue.value[1]}`,
);

const isFullRange = computed(
  () =>
    !props.range ||
    (rangeValue.value[0] === props.range.min && rangeValue.value[1] === props.range.max),
);

const draftActiveCount = computed(() =>
  [
    Boolean(workingDraft.value.search),
    selectedCategories.value.length > 0,
    selectedTags.value.length > 0,
    selectedEquipment.value.length > 0,
    Boolean(workingDraft.value.timeSlot),
    Boolean(workingDraft.value.date),
    Boolean(workingDraft.value.onlyAvailable),
    Boolean(props.range) && !isFullRange.value,
  ].filter(Boolean).length,
);

const allSelected = computed(
  () => props.categories.length > 0 && selectedCategories.value.length === props.categories.length,
);

function update(patch) {
  const next = { ...workingDraft.value, ...patch };

  if (Object.prototype.hasOwnProperty.call(patch, 'categories')) {
    const categories = Array.isArray(patch.categories) ? patch.categories : [];
    next.category = categories.length === 1 ? categories[0] : 'all';
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'category')) {
    const onlyCategory = patch.category && patch.category !== 'all' ? [patch.category] : [];
    const allCountable = onlyCategory.every((id) => !isNonCountableResource(id));
    if (!allCountable) next.range = null;
  }

  workingDraft.value = next;
}

function toggleCategory(id, checked) {
  const current = selectedCategories.value;
  const categories = checked
    ? [...new Set([...current, id])]
    : current.filter((item) => item !== id);
  update({
    categories,
    category: categories.length === 1 ? categories[0] : 'all',
  });
}

function toggleEquipment(id, checked) {
  const current = selectedEquipment.value;
  const equipment = checked
    ? [...new Set([...current, id])]
    : current.filter((item) => item !== id);
  update({ equipment });
}

function toggleArrayValue(key, value) {
  const current = workingDraft.value[key] ?? [];
  update({
    [key]: current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value],
  });
}

function selectAllCategories() {
  update({
    categories: allSelected.value ? [] : props.categories.map((item) => item.id),
  });
}

function isPresetActive(preset) {
  return rangeValue.value[0] === preset.min && rangeValue.value[1] === preset.max;
}

function applyFilters() {
  filters.value = { ...workingDraft.value };
  emit('apply', filters.value);
  isOpen.value = false;
}

function cancelDraft() {
  workingDraft.value = createDraft();
}

function resetDraft() {
  const next = createDefaultFilters();
  workingDraft.value = next;
  filters.value = { ...next };
  emit('reset', filters.value);
}
</script>

<style scoped>
.filters-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.filters-section {
  padding: 20px 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.filters-section--last {
  border-bottom: 0;
}

.filters-section__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.filters-section__heading h3 {
  margin: 0;
  color: var(--color-text-main);
  font-family: var(--font-heading, inherit);
  font-size: 14px;
  font-weight: 700;
}

.filters-link {
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.filters-link:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-list :deep(.app-checkbox) {
  align-items: center;
}

.category-list :deep(.app-checkbox__label) {
  font-size: 13px;
}

.value-badge,
.section-count {
  padding: 5px 9px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.preset-list,
.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-list {
  margin-top: 8px;
}

.preset {
  height: 32px;
  padding: 0 11px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.preset:hover,
.preset--active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
}

.preset:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.date-control {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 11px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-subtle);
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.date-control:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.date-control__icon {
  display: grid;
  place-items: center;
  color: var(--color-primary);
}

.date-control__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  color: var(--color-text-secondary);
  font-size: 11px;
}

.date-control__copy strong {
  color: var(--color-text-main);
  font-size: 13px;
}

.date-control__edit {
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.time-card {
  position: relative;
  display: flex;
  min-height: 76px;
  flex-direction: column;
  gap: 5px;
  padding: 11px 9px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;
}

.time-card:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.time-card strong {
  color: var(--color-text-main);
  font-size: 12px;
}

.time-card span:not(.time-card__indicator) {
  color: var(--color-text-secondary);
  font-size: 10px;
}

.time-card--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.time-card__indicator {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 8px;
  height: 8px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
}

.time-card--active .time-card__indicator {
  border-color: var(--color-primary);
  background: var(--color-primary);
  box-shadow: inset 0 0 0 2px var(--color-primary-light);
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.equipment-grid :deep(.app-checkbox__label) {
  font-size: 12px;
}

.availability-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface-subtle);
}

.availability-card__dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-success);
}

.availability-card__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.availability-card__copy strong {
  color: var(--color-text-main);
  font-size: 13px;
}

.availability-card__copy small {
  color: var(--color-text-secondary);
  font-size: 11px;
}

.availability-card :deep(.app-switch) {
  flex-shrink: 0;
}

.drawer-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-count {
  display: inline-grid;
  min-width: 22px;
  height: 22px;
  place-items: center;
  padding: 0 5px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

@media (max-width: 380px) {
  .time-grid {
    grid-template-columns: 1fr;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
  }
}
</style>
