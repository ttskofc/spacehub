import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { apiGet } from '../api/http';
import { isNonCountableResource } from '../utils/resourceCategory';

const BOOKMARKS_KEY = 'spacehub:catalog-bookmarks';
const DEFAULT_PAGE_SIZE = 6;

// 1С не отдаёт агрегаты по ресурсам, поэтому метрики в шапке каталога остаются моковыми.
const MOCK_STATS = {
  availableCount: 14,
  totalCount: 18,
  occupancyPercent: 11,
  peakHour: '14:00 – 16:30',
  lastUpdated: '14:10',
};

const DEFAULT_FILTERS = Object.freeze({
  search: '',
  dateRangeText: 'Выберите дату и время',
  date: '',
  timeStart: '',
  timeEnd: '',
  category: 'all',
  categories: [],
  range: null,
  equipment: [],
  tags: [],
  onlyAvailable: false,
  viewMode: 'grid',
  sortBy: 'capacity_desc',
});

export function createDefaultFilters() {
  return {
    ...DEFAULT_FILTERS,
    categories: [],
    equipment: [],
    tags: [],
    activeTags: [],
  };
}

const SORTERS = {
  capacity_desc: (a, b) => capacity(b) - capacity(a) || byTitle(a, b),
  capacity_asc: (a, b) => capacity(a) - capacity(b) || byTitle(a, b),
  name: (a, b) => byTitle(a, b),
  popular: () => 0,
};

export const useCatalogStore = defineStore('catalog', () => {
  const resources = ref([]);
  const slotsByResource = ref({});
  const bookmarks = ref(readBookmarks());
  const filters = ref(createDefaultFilters());
  const page = ref(1);
  const pageSize = ref(DEFAULT_PAGE_SIZE);

  const loading = ref(false);
  const slotsLoading = ref(false);
  const error = ref('');

  let slotsRequestToken = 0;
  let slotsAbortController = null;

  const cards = computed(() =>
    resources.value.map((resource) => ({
      ...resource,
      bookings: slotsByResource.value[resource.id] ?? [],
      isBookmarked: bookmarks.value.includes(resource.id),
    })),
  );

  const capacityBounds = computed(() => {
    const capacities = cards.value
      .filter((resource) => !isNonCountableResource(resource))
      .map((resource) => Number(resource.capacity))
      .filter(Number.isFinite);
    if (!capacities.length) return null;
    return { min: Math.min(...capacities), max: Math.max(...capacities) };
  });

  const categories = computed(() => {
    const counts = new Map();
    for (const card of cards.value) {
      const id = card.category || 'other';
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    const items = [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], 'ru'))
      .map(([id, count]) => ({ id, label: id, count }));

    return [{ id: 'all', label: 'Все пространства', count: cards.value.length }, ...items];
  });

  // Счётчики категорий пересчитываются с учётом всех прочих активных фильтров.
  // Категория под собственным фильтром не исключается, чтобы счётчик не «прыгал».
  const categoriesWithCounts = computed(() => {
    const counts = new Map();
    const base = cards.value.filter((card) => matchesExceptCategory(card, filters.value));
    for (const card of base) {
      const id = card.category || 'other';
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return categories.value.map((category) => ({
      ...category,
      count: category.id === 'all' ? base.length : counts.get(category.id) ?? 0,
    }));
  });

  const visible = computed(() => {
    const matched = filterCards(cards.value, filters.value);
    const sorter = SORTERS[filters.value.sortBy] ?? SORTERS.popular;
    return [...matched].sort(sorter);
  });

  const total = computed(() => visible.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

  const paged = computed(() => {
    const start = (page.value - 1) * pageSize.value;
    return visible.value.slice(start, start + pageSize.value);
  });

  const stats = computed(() => MOCK_STATS);
  const viewMode = computed(() => filters.value.viewMode ?? 'grid');
  const isEmpty = computed(() => !loading.value && !error.value && cards.value.length === 0);
  const isFilteredEmpty = computed(
    () => !loading.value && !error.value && cards.value.length > 0 && total.value === 0,
  );

  const activeFilterCount = computed(() => countActiveFilters(filters.value, capacityBounds.value));
  const activeFilterItems = computed(() => buildActiveFilterItems(filters.value, categories.value));

  async function load() {
    loading.value = true;
    error.value = '';

    try {
      const payload = await apiGet('/resources');
      resources.value = Array.isArray(payload) ? payload : [];
    } catch (err) {
      resources.value = [];
      error.value = err?.message ?? 'Не удалось загрузить каталог ресурсов';
    } finally {
      loading.value = false;
    }
  }

  // Занятость 1С отдаёт по одному ресурсу; сбой не блокирует каталог — карточка
  // остаётся с заглушкой рабочего дня и пустым таймлайном.
  async function loadSlots() {
    await loadSlotsForIds(paged.value.map((card) => card.id).filter(Boolean));
  }

  async function loadAllSlots() {
    await loadSlotsForIds(cards.value.map((card) => card.id).filter(Boolean));
  }

  async function loadSlotsForIds(ids) {
    slotsAbortController?.abort();

    if (!ids.length) {
      slotsLoading.value = false;
      slotsByResource.value = {};
      return;
    }

    slotsAbortController = typeof AbortController === 'function' ? new AbortController() : null;
    const signal = slotsAbortController?.signal;
    const token = ++slotsRequestToken;

    slotsLoading.value = true;
    const date = filters.value.date || undefined;

    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            return [id, await apiGet('/slots', { resource_id: id, date }, { signal })];
          } catch (err) {
            if (err?.name === 'AbortError') throw err;
            return [id, []];
          }
        }),
      );

      if (token !== slotsRequestToken) return;

      const next = { ...slotsByResource.value };
      for (const [id, slots] of results) {
        next[id] = Array.isArray(slots) ? slots : [];
      }
      slotsByResource.value = next;
    } catch (err) {
      if (err?.name !== 'AbortError') throw err;
    } finally {
      if (token === slotsRequestToken) slotsLoading.value = false;
    }
  }

  async function reload() {
    await load();
    await refreshSlots();
  }

  async function refreshSlots() {
    if (filters.value.onlyAvailable || filters.value.date) await loadAllSlots();
    else await loadSlots();
  }

  async function loadSlotsForFilterDate() {
    await refreshSlots();
  }

  function toggleBookmark(id) {
    bookmarks.value = bookmarks.value.includes(id)
      ? bookmarks.value.filter((item) => item !== id)
      : [...bookmarks.value, id];
  }

  function getResource(id) {
    return cards.value.find((resource) => resource.id === id) ?? null;
  }

  function applyFilters(next) {
    filters.value = { ...createDefaultFilters(), ...next };
    page.value = 1;
  }

  function resetFilters() {
    filters.value = createDefaultFilters();
    page.value = 1;
  }

  function removeFilter(id) {
    const value = { ...filters.value };
    if (id === 'search') value.search = '';
    else if (id === 'date') {
      value.date = '';
      value.timeStart = '';
      value.timeEnd = '';
      value.dateRangeText = DEFAULT_FILTERS.dateRangeText;
    } else if (id === 'category') {
      value.category = 'all';
      value.categories = [];
    } else if (id.startsWith('category:')) {
      value.categories = (value.categories ?? []).filter((item) => item !== id.slice('category:'.length));
      value.category = value.categories.length === 1 ? value.categories[0] : 'all';
    } else if (id === 'range') value.range = null;
    else if (id === 'available') value.onlyAvailable = false;
    else if (id.startsWith('equipment:')) {
      const target = id.slice('equipment:'.length);
      value.equipment = (value.equipment ?? []).filter((item) => item !== target);
    } else if (id.startsWith('tag:')) {
      const target = id.slice('tag:'.length);
      value.tags = (value.tags ?? []).filter((item) => item !== target);
    } else return;
    applyFilters(value);
  }

  function setPage(value) {
    page.value = Math.min(Math.max(1, Number(value) || 1), totalPages.value);
  }

  function setPageSize(value) {
    pageSize.value = Number(value) || DEFAULT_PAGE_SIZE;
    page.value = 1;
  }

  function countForFilters(value) {
    return filterCards(cards.value, value).length;
  }

  watch(
    () => paged.value.map((card) => card.id).join(','),
    () => loadSlots(),
  );

  watch(
    () => JSON.stringify({ ...filters.value, viewMode: undefined, sortBy: undefined }),
    () => {
      page.value = 1;
    },
  );

  watch(
    () => Boolean(filters.value.onlyAvailable),
    () => {
      refreshSlots();
    },
  );

  watch(
    () => [filters.value.date, filters.value.timeStart, filters.value.timeEnd].join('|'),
    () => {
      loadSlotsForFilterDate();
    },
  );

  watch(
    () => bookmarks.value.join(','),
    () => {
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks.value));
      } catch {
        // localStorage может быть недоступен — закладки живут до перезагрузки
      }
    },
  );

  return {
    resources,
    filters,
    bookmarks,
    page,
    pageSize,
    loading,
    slotsLoading,
    error,
    cards,
    categories,
    categoriesWithCounts,
    capacityBounds,
    visible,
    paged,
    total,
    totalPages,
    stats,
    viewMode,
    isEmpty,
    isFilteredEmpty,
    activeFilterCount,
    activeFilterItems,
    load,
    loadSlots,
    loadAllSlots,
    loadSlotsForFilterDate,
    countForFilters,
    reload,
    refreshSlots,
    toggleBookmark,
    getResource,
    applyFilters,
    resetFilters,
    removeFilter,
    setPage,
    setPageSize,
  };
});

function capacity(card) {
  return Number(card.capacity) || 0;
}

function byTitle(a, b) {
  return (a.title ?? '').localeCompare(b.title ?? '', 'ru');
}

function searchHaystack(card) {
  return [
    card.title,
    card.category,
    card.location,
    card.code,
    card.description,
    ...(card.features ?? []).map((feature) => feature.label ?? feature),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function searchMatches(card, value) {
  const query = String(value?.search ?? '').trim().toLowerCase();
  return !query || searchHaystack(card).includes(query);
}

function selectedCategories(value) {
  const categories = Array.isArray(value?.categories) ? value.categories : [];
  if (categories.length) return categories;
  return value?.category && value.category !== 'all' ? [value.category] : [];
}

function categoryMatches(card, value) {
  const selected = selectedCategories(value);
  if (!selected.length) return true;
  return selected.includes(card.category || 'other');
}

function capacityMatches(card, value) {
  const range = Array.isArray(value?.range) ? value.range : null;
  if (!range || isNonCountableResource(card)) return true;
  const capacity = Number(card.capacity);
  return Number.isFinite(capacity) && capacity >= range[0] && capacity <= range[1];
}

function equipmentMatches(card, value) {
  const selectedEquipment = Array.isArray(value?.equipment) ? value.equipment : [];
  if (!selectedEquipment.length) return true;
  const features = (card.features ?? []).map((feature) => String(feature.label ?? feature).toLowerCase());
  return selectedEquipment.every((item) => features.includes(String(item).toLowerCase()));
}

function tagsMatch(card, value) {
  const locations = Array.isArray(value?.tags) ? value.tags : [];
  return !locations.length || locations.includes(card.location);
}

function availabilityMatches(card, value) {
  if (value?.onlyAvailable && !hasFreeTime(card)) return false;
  if (value?.date && value.timeStart && value.timeEnd && !hasFreeInterval(card, value.timeStart, value.timeEnd)) {
    return false;
  }
  return true;
}

function matchesExceptCategory(card, value) {
  return (
    searchMatches(card, value) &&
    capacityMatches(card, value) &&
    equipmentMatches(card, value) &&
    tagsMatch(card, value) &&
    availabilityMatches(card, value)
  );
}

function filterCards(items, value) {
  return items.filter((card) => matchesExceptCategory(card, value) && categoryMatches(card, value));
}

function isPartialRange(range, bounds) {
  if (!Array.isArray(range) || range.length !== 2 || !bounds) return false;
  return range[0] !== bounds.min || range[1] !== bounds.max;
}

function countActiveFilters(value, bounds) {
  const flags = [
    Boolean(value?.search),
    selectedCategories(value).length > 0,
    (value?.tags?.length ?? 0) > 0,
    (value?.equipment?.length ?? 0) > 0,
    Boolean(value?.date),
    Boolean(value?.onlyAvailable),
    isPartialRange(value?.range, bounds),
  ];
  return flags.filter(Boolean).length;
}

function buildActiveFilterItems(value, categories) {
  const items = [];
  if (value?.search) items.push({ id: 'search', label: `Поиск: ${value.search}` });

  if (value?.date) items.push({ id: 'date', label: value.dateRangeText || 'Выбран интервал' });

  const selected = selectedCategories(value);
  for (const id of selected) {
    const label = categories.find((item) => item.id === id)?.label || id;
    items.push({ id: selected.length > 1 ? `category:${id}` : 'category', label });
  }

  if (Array.isArray(value?.range) && value.range.length === 2) {
    items.push({ id: 'range', label: `Вместимость: ${value.range[0]}–${value.range[1]} чел.` });
  }
  for (const item of value?.equipment ?? []) items.push({ id: `equipment:${item}`, label: item });
  for (const item of value?.tags ?? []) items.push({ id: `tag:${item}`, label: item });
  if (value?.onlyAvailable) items.push({ id: 'available', label: 'Только доступные' });
  return items;
}

function hasFreeInterval(card, startValue, endValue) {
  const start = toMinutes(startValue);
  const end = toMinutes(endValue);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return false;
  return !(card.bookings ?? []).some((booking) => {
    if (booking.status === 'free') return false;
    const bookingStart = toMinutes(booking.start);
    const bookingEnd = toMinutes(booking.end);
    return Number.isFinite(bookingStart) && Number.isFinite(bookingEnd) && bookingStart < end && bookingEnd > start;
  });
}

function hasFreeTime(card) {
  const start = toMinutes(card.timelineStart);
  const end = toMinutes(card.timelineEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return false;

  const busy = (card.bookings ?? [])
    .filter((booking) => booking.status !== 'free')
    .map((booking) => ({ start: toMinutes(booking.start), end: toMinutes(booking.end) }))
    .filter((interval) => Number.isFinite(interval.start) && Number.isFinite(interval.end) && interval.start < interval.end)
    .sort((a, b) => a.start - b.start);

  let cursor = start;
  for (const interval of busy) {
    if (interval.start > cursor) return true;
    cursor = Math.max(cursor, interval.end);
  }
  return cursor < end;
}

function toMinutes(value) {
  const [hours, minutes] = String(value ?? '').split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : NaN;
}

function readBookmarks() {
  try {
    const raw = JSON.parse(localStorage.getItem(BOOKMARKS_KEY));
    return Array.isArray(raw) ? raw.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}
