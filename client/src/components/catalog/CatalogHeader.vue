<template>
  <header class="catalog-header">
    <div class="catalog-header__main">
      <AppBreadcrumbs :items="breadcrumbs" class="catalog-header__breadcrumbs" />

      <div class="catalog-header__title-row">
        <h1 class="catalog-header__title">{{ title }}</h1>
        <span class="catalog-header__total">{{ totalLabel }}</span>
      </div>

      <p v-if="description" class="catalog-header__description">{{ description }}</p>
    </div>

    <aside class="catalog-header__stats" aria-label="Метрики загрузки ресурсов">
      <div class="catalog-header__stats-top">
        <span class="catalog-header__free">
          <span class="catalog-header__live-dot" aria-hidden="true" />
          <span class="catalog-header__free-text">
            Свободно: <strong>{{ availableCount }}</strong> из {{ totalCount }}
          </span>
        </span>

        <AppBadge :variant="loadVariant" :dot="false">
          Загрузка: {{ occupancy }}% сейчас
        </AppBadge>
      </div>

      <div
        class="catalog-header__progress"
        :style="{ '--progress-color': progressColor }"
        role="progressbar"
        :aria-label="`Загрузка ресурсов: ${occupancy}%`"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="occupancy"
      >
        <div class="catalog-header__progress-fill" :style="{ width: `${occupancy}%` }" />
      </div>

      <div class="catalog-header__stats-footer">
        <span v-if="stats.peakHour" class="catalog-header__peak">
          <IconClock size="xs" aria-hidden="true" />
          Пик нагрузки: {{ stats.peakHour }}
        </span>
        <span v-if="stats.lastUpdated" class="catalog-header__sync">
          Обновлено в {{ stats.lastUpdated }}
        </span>
      </div>
    </aside>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import AppBadge from '../ui/AppBadge.vue';
import AppBreadcrumbs from '../ui/AppBreadcrumbs.vue';
import IconClock from '../ui/Icons/Catalog Controls/IconClock.vue';

const LOAD_VARIANTS = {
  success: '--color-accent-matcha',
  warning: '--color-warning',
  danger: '--color-danger',
};

const props = defineProps({
  title: {
    type: String,
    default: 'Ресурсы организации',
  },
  description: {
    type: String,
    default: '',
  },
  breadcrumbs: {
    type: Array,
    default: () => [
      { label: 'Главная', to: '/' },
      { label: 'Каталог ресурсов' },
    ],
  },
  stats: {
    type: Object,
    required: true,
  },
  totalUnit: {
    type: Object,
    default: () => ({ one: 'помещение', few: 'помещения', many: 'помещений' }),
  },
  warningThreshold: {
    type: Number,
    default: 60,
  },
  dangerThreshold: {
    type: Number,
    default: 85,
  },
});

const totalCount = computed(() => toCount(props.stats.totalCount));

const availableCount = computed(() => toCount(props.stats.availableCount));

const occupancy = computed(() => clamp(toCount(props.stats.occupancyPercent), 0, 100));

const loadVariant = computed(() => {
  if (occupancy.value >= props.dangerThreshold) return 'danger';
  if (occupancy.value >= props.warningThreshold) return 'warning';
  return 'success';
});

const progressColor = computed(() => `var(${LOAD_VARIANTS[loadVariant.value]})`);

const totalLabel = computed(() => `${totalCount.value} ${pluralize(totalCount.value, props.totalUnit)}`);

function toCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pluralize(count, unit) {
  const hundreds = Math.abs(count) % 100;
  if (hundreds > 10 && hundreds < 20) return unit.many;
  const tens = hundreds % 10;
  if (tens > 1 && tens < 5) return unit.few;
  if (tens === 1) return unit.one;
  return unit.many;
}
</script>

<style scoped>
.catalog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.catalog-header__main {
  flex: 1;
  min-width: 280px;
}

.catalog-header__breadcrumbs {
  margin-bottom: 8px;
}

.catalog-header__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.catalog-header__title {
  font-family: var(--font-heading, sans-serif);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-text-main);
}

.catalog-header__total {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background-color: var(--color-surface-subtle);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.catalog-header__description {
  margin-top: 6px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* Виджет метрик */
.catalog-header__stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
  width: 100%;
  max-width: 380px;
  min-width: 300px;
  padding: 12px 16px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  box-sizing: border-box;
}

.catalog-header__stats-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.catalog-header__free {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-main);
}

.catalog-header__free-text strong {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.catalog-header__live-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background-color: var(--color-success);
  box-shadow: 0 0 0 3px var(--color-success-bg);
  animation: catalog-header-pulse 2s infinite ease-in-out;
}

.catalog-header__progress {
  width: 100%;
  height: 6px;
  overflow: hidden;
  border-radius: var(--radius-full);
  background-color: var(--color-surface-subtle);
}

.catalog-header__progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background-color: var(--progress-color, var(--color-accent-matcha));
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}

.catalog-header__stats-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.catalog-header__peak {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

@keyframes catalog-header-pulse {
  0%,
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .catalog-header__live-dot {
    animation: none;
  }
}
</style>
