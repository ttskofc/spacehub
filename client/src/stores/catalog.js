import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { apiGet } from '../api/http';

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

const DEFAULT_FILTERS = {
  search: '',
  dateRangeText: 'Сегодня, 8 сент. • 14:00 – 16:00',
  date: '',
  category: 'all',
  viewMode: 'grid',
  sortBy: 'capacity_desc',
  filterCount: 0,
  activeTags: [],
};

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
  const filters = ref({ ...DEFAULT_FILTERS });
  const page = ref(1);
  const pageSize = ref(6);

  const loading = ref(false);
  const slotsLoading = ref(false);
  const error = ref('');

  const cards = computed(() =>
    resources.value.map((resource) => ({
      ...resource,
      bookings: slotsByResource.value[resource.id] ?? [],
      isBookmarked: bookmarks.value.includes(resource.id),
    })),
  );

  const categories = computed(() => {
    const counts = new Map();
    for (const card of cards.value) {
      const id = card.category || 'other';
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    const items = [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], 'ru'))
      .map(([id, count]) => ({ id, label: id, count }));

    return [
      { id: 'all', label: 'Все пространства', count: cards.value.length },
      ...items,
    ];
  });

  const visible = computed(() => {
    const query = filters.value.search.trim().toLowerCase();

    const matched = cards.value.filter((card) => {
      if (filters.value.category !== 'all' && (card.category || 'other') !== filters.value.category) {
        return false;
      }
      return !query || searchHaystack(card).includes(query);
    });

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
  const isFilteredEmpty = computed(() => !loading.value && !error.value && cards.value.length > 0 && total.value === 0);

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
    const ids = paged.value.map((card) => card.id).filter(Boolean);
    if (!ids.length) return;

    slotsLoading.value = true;
    const date = filters.value.date || undefined;

    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            return [id, await apiGet('/slots', { resource_id: id, date })];
          } catch {
            return [id, []];
          }
        }),
      );

      const next = { ...slotsByResource.value };
      for (const [id, slots] of results) {
        next[id] = Array.isArray(slots) ? slots : [];
      }
      slotsByResource.value = next;
    } finally {
      slotsLoading.value = false;
    }
  }

  async function reload() {
    await load();
    await loadSlots();
  }

  function toggleBookmark(id) {
    bookmarks.value = bookmarks.value.includes(id)
      ? bookmarks.value.filter((item) => item !== id)
      : [...bookmarks.value, id];
  }

  function resetFilters() {
    filters.value = { ...DEFAULT_FILTERS };
    page.value = 1;
  }

  function setPage(value) {
    page.value = Math.min(Math.max(1, Number(value) || 1), totalPages.value);
  }

  function setPageSize(value) {
    pageSize.value = Number(value) || DEFAULT_PAGE_SIZE;
    page.value = 1;
  }

  watch(
    () => paged.value.map((card) => card.id).join(','),
    () => loadSlots(),
  );

  watch(
    () => JSON.stringify(filters.value),
    () => {
      page.value = 1;
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
    visible,
    paged,
    total,
    totalPages,
    stats,
    viewMode,
    isEmpty,
    isFilteredEmpty,
    load,
    loadSlots,
    reload,
    toggleBookmark,
    resetFilters,
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
    ...(card.features ?? []).map((feature) => feature.label),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function readBookmarks() {
  try {
    const raw = JSON.parse(localStorage.getItem(BOOKMARKS_KEY));
    return Array.isArray(raw) ? raw.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}
