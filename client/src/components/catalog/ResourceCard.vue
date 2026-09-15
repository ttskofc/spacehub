<template>
  <article class="resource-card" :class="`resource-card--${viewMode}`">
    <div class="resource-card__media">
      <img
        v-if="resource.imageUrl"
        class="resource-card__image"
        :src="resource.imageUrl"
        :alt="resource.title"
        loading="lazy"
      />
      <div v-else class="resource-card__media-placeholder" aria-hidden="true">
        <IconGrid :size="30" />
      </div>

      <span class="resource-card__category">{{ resource.category }}</span>

      <AppBadge
        v-if="viewMode === 'grid'"
        class="resource-card__availability"
        :variant="availabilityTone"
        :dot="true"
        :text="availabilityText"
      />

      <span v-if="locationShort" class="resource-card__location-badge">
        <IconMapPin class="resource-card__location-badge-icon" aria-hidden="true" :size="12" />
        {{ locationShort }}
      </span>
    </div>

    <div class="resource-card__body" @click="emit('details', resource)">
      <div class="resource-card__head">
        <h3 class="resource-card__title">{{ resource.title }}</h3>
        <button
          v-if="viewMode === 'grid'"
          type="button"
          class="resource-card__bookmark"
          :class="{ 'resource-card__bookmark--active': resource.isBookmarked }"
          :aria-pressed="resource.isBookmarked"
          :aria-label="resource.isBookmarked ? 'Убрать из избранного' : 'В избранное'"
          @click.stop="emit('toggle-bookmark', resource.id)"
        >
          <IconBookmark :size="16" />
        </button>
        <span v-else-if="resource.code" class="resource-card__code">{{ resource.code }}</span>
      </div>

      <p v-if="description" class="resource-card__description">{{ description }}</p>

      <div v-if="features.length" class="resource-card__features">
        <div v-if="primaryFeatures.length" class="resource-card__feature-hero">
          <template v-for="(feature, index) in primaryFeatures" :key="feature.label">
            <span class="resource-card__feature-hero-item">
              <span class="resource-card__feature-icon">
                <component
                  :is="FEATURE_ICONS[feature.icon]"
                  v-if="feature.icon && FEATURE_ICONS[feature.icon]"
                  aria-hidden="true"
                  :size="14"
                />
              </span>
              {{ feature.label }}
            </span>
            <span
              v-if="index < primaryFeatures.length - 1"
              class="resource-card__feature-hero-dot"
              aria-hidden="true"
              >•</span
            >
          </template>
        </div>

        <div v-if="secondaryFeatures.length" class="resource-card__feature-secondary">
          <span v-for="feature in secondaryFeatures" :key="feature.label" class="resource-card__feature">
            <span class="resource-card__feature-icon">
              <component
                :is="FEATURE_ICONS[feature.icon]"
                v-if="feature.icon && FEATURE_ICONS[feature.icon]"
                aria-hidden="true"
                :size="11"
              />
            </span>
            {{ feature.label }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="hasTimeline" class="resource-card__timeline">
      <AppTimeline
        :work-day-start="timelineStart"
        :work-day-end="timelineEnd"
        :bookings="bookings"
      />
    </div>

    <div class="resource-card__footer">
      <template v-if="viewMode === 'grid'">
        <AppButton variant="ghost" @click="emit('details', resource)">Подробнее 
          <IconArrowRight></IconArrowRight>
        </AppButton>
        <AppButton
          variant="primary"
          :disabled="!hasBookableSlot"
          @click="emit('book', resource)"
        >
          Забронировать
        </AppButton>
      </template>

      <template v-else>
        <span
          class="resource-card__booking-hint"
          :class="{ 'resource-card__booking-hint--muted': !resource.instantBooking }"
        >
          <IconCheck v-if="resource.instantBooking" aria-hidden="true" :size="12" />
          {{ resource.instantBooking ? 'Мгновенный букинг' : 'По запросу' }}
        </span>
        <AppButton
          variant="primary"
          size="sm"
          :disabled="!hasBookableSlot"
          @click="emit('book', resource)"
        >
          Забронировать
        </AppButton>
        <AppButton variant="ghost" size="sm" @click="emit('details', resource)">
          Подробнее
        </AppButton>
      </template>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import AppButton from '../ui/AppButton.vue';
import AppBadge from '../ui/AppBadge.vue';
import AppTimeline from '../ui/AppTimeline.vue';
import IconArrowRight from "../ui/Icons/Calendar & Booking Actions/IconArrowRight.vue";
import IconArea from '../ui/Icons/Icon Features & Specs/IconArea.vue';
import IconCheck from '../ui/Icons/Catalog Controls/IconCheck.vue';
import IconMapPin from '../ui/Icons/Catalog Controls/IconMapPin.vue';
import IconDisplay4K from '../ui/Icons/Icon Features & Specs/IconDisplay4K.vue';
import IconGrid from '../ui/Icons/Shell&Navigation/IconGrid.vue';
import IconBookmark from '../ui/Icons/Calendar & Booking Actions/IconBookmark.vue';
import IconSoundWaves from '../ui/Icons/Icon Features & Specs/IconSoundWaves.vue';
import IconThermometer from '../ui/Icons/Icon Features & Specs/IconThermometer.vue';
import IconUsers from '../ui/Icons/Icon Features & Specs/IconUsers.vue';
import IconVideoCamera from '../ui/Icons/Icon Features & Specs/IconVideoCamera.vue';
import IconWhiteboard from '../ui/Icons/Icon Features & Specs/IconWhiteboard.vue';
import IconWifi from '../ui/Icons/Icon Features & Specs/IconWifi.vue';

const props = defineProps({
  resource: {
    type: Object,
    required: true,
  },
  viewMode: {
    type: String,
    default: 'grid', // 'grid' | 'list'
    validator: (v) => ['grid', 'list'].includes(v),
  },
});

const emit = defineEmits(['book', 'details', 'toggle-bookmark']);

const FEATURE_ICONS = {
  capacity: IconUsers,
  area: IconArea,
  screen: IconDisplay4K,
  display: IconDisplay4K,
  vcs: IconVideoCamera,
  camera: IconVideoCamera,
  wifi: IconWifi,
  acoustics: IconSoundWaves,
  climate: IconThermometer,
  whiteboard: IconWhiteboard,
};

function toMinutes(time) {
  const [h, m] = String(time ?? '').split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
}

function toTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const timelineStart = computed(() => props.resource.timelineStart || '');
const timelineEnd = computed(() => props.resource.timelineEnd || '');
const bookings = computed(() => props.resource.bookings || []);
const hasTimeline = computed(() => Boolean(timelineStart.value && timelineEnd.value));

const features = computed(() =>
  (props.resource.features || []).map((f) =>
    typeof f === 'string' ? { icon: '', label: f } : { icon: f.icon || '', label: f.label || '' },
  ),
);

const primaryFeatures = computed(() => features.value.slice(0, 3));

const secondaryFeatures = computed(() => features.value.slice(3));

const locationShort = computed(() => props.resource.location || '');

const description = computed(() => {
  if (props.resource.description) return props.resource.description;
  const parts = [];
  if (props.resource.capacity) parts.push(`Вместимость до ${props.resource.capacity} человек`);
  return parts.join(' • ');
});

const dayBounds = computed(() => {
  const start = toMinutes(timelineStart.value);
  const end = toMinutes(timelineEnd.value);
  return Number.isFinite(start) && Number.isFinite(end) && start < end ? { start, end } : null;
});

const busyIntervals = computed(() => {
  if (!dayBounds.value) return [];
  const intervals = bookings.value
    .map((b) => ({ start: toMinutes(b.start), end: toMinutes(b.end) }))
    .filter((iv) => Number.isFinite(iv.start) && Number.isFinite(iv.end) && iv.start < iv.end)
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const iv of intervals) {
    const last = merged[merged.length - 1];
    if (last && iv.start <= last.end) last.end = Math.max(last.end, iv.end);
    else merged.push({ ...iv });
  }
  return merged;
});

const hasFreeTime = computed(() => {
  const day = dayBounds.value;
  if (!day) return false;
  if (!busyIntervals.value.length) return true;
  let cursor = day.start;
  for (const iv of busyIntervals.value) {
    if (iv.start > cursor) return true;
    cursor = Math.max(cursor, iv.end);
  }
  return cursor < day.end;
});

const statusText = computed(() => {
  const day = dayBounds.value;
  if (!day) return 'Нет расписания';
  const busy = busyIntervals.value;
  if (!busy.length) return 'Свободно весь день';
  if (busy.length === 1 && busy[0].start <= day.start && busy[0].end >= day.end) {
    return 'Занято весь день';
  }
  if (busy[0].start <= day.start) return `Занято до ${toTime(busy[0].end)}`;
  return `Свободен до ${toTime(busy[0].start)}`;
});

const statusTone = computed(() =>
  statusText.value.startsWith('Занято') ? 'busy' : 'free',
);

const availabilityTone = computed(() => (statusTone.value === 'busy' ? 'danger' : 'success'));

const availabilityText = computed(() =>
  statusTone.value === 'busy' ? statusText.value : 'Доступно сейчас',
);

const hasBookableSlot = computed(() => hasFreeTime.value);
</script>

<style scoped>
.resource-card {
  display: grid;
  background: var(--color-surface);
  border: 1px solid var(--color-select-border);
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    border-color var(--transition-fast);
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.08);
  border-color: rgba(103, 6, 38, 0.25);
}

/* Раскладка */
.resource-card--grid {
  grid-template-areas:
    'media'
    'body'
    'timeline'
    'footer';
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto 1fr auto auto;
}

.resource-card--list {
  grid-template-areas: 'media body timeline footer';
  grid-template-columns: 190px minmax(0, 1fr) 240px 176px;
  padding: 12px;
}

.resource-card__media {
  grid-area: media;
  position: relative;
}

.resource-card__body {
  grid-area: body;
  display: flex;
  flex-direction: column;
  min-width: 0;
  cursor: pointer;
}

.resource-card__timeline {
  grid-area: timeline;
  min-width: 0;
}

.resource-card__footer {
  grid-area: footer;
}

/* Медиа */
.resource-card--grid .resource-card__media {
  aspect-ratio: 16 / 10;
}

.resource-card--list .resource-card__media {
  aspect-ratio: auto;
  height: 120px;
  align-self: start;
  overflow: hidden;
  border-radius: var(--radius-sm);
}

.resource-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resource-card__media-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-text-muted);
  background: linear-gradient(135deg, var(--color-surface-subtle), var(--color-surface-hover));
}

.resource-card__category {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  color: var(--color-text-main);
}

.resource-card__bookmark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.resource-card__bookmark:hover {
  background: var(--color-surface-subtle);
  color: var(--color-text-main);
}

.resource-card__bookmark--active {
  color: var(--color-primary);
}

.resource-card__bookmark:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.resource-card__availability {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.resource-card__location-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: calc(100% - 24px);
  padding: 4px 8px;
  background: rgba(20, 15, 15, 0.75);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-sm);
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
}

.resource-card__location-badge-icon {
  flex-shrink: 0;
  color: var(--color-success-soft);
}

/* Body */
.resource-card--grid .resource-card__body {
  gap: 6px;
  padding: 16px 16px 0;
}

.resource-card--list .resource-card__body {
  justify-content: center;
  gap: 6px;
  padding: 4px 16px;
}

.resource-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.resource-card__title {
  margin: 0;
  font-family: var(--font-heading, inherit);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--color-text-main);
}

.resource-card__code {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-subtle);
  font-family: var(--font-heading, sans-serif);
  font-size: 11px;
  line-height: 1.6;
  color: var(--color-select-icon);
}

.resource-card__description {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--color-select-icon);
}

.resource-card__features {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.resource-card__feature-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px 10px;
  width: 100%;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-subtle);
}

.resource-card__feature-hero-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-pagination-text);
  white-space: nowrap;
}

.resource-card__feature-hero-dot {
  color: var(--color-text-muted);
  font-size: 10px;
}

.resource-card__feature-secondary {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
  gap: 6px;
}

.resource-card__feature {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-subtle);
  font-size: 11px;
  color: var(--color-pagination-text);
}

.resource-card__feature-icon {
  display: inline-flex;
  color: var(--color-primary);
}

/* Timeline */
.resource-card--grid .resource-card__timeline {
  margin-top: 12px;
  padding: 0 16px;
}

.resource-card--list .resource-card__timeline {
  padding: 8px 14px;
  border-left: 1px solid var(--color-border-subtle);
}

/* Footer */
.resource-card--grid .resource-card__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
  padding: 32px 16px 32px;
}

.resource-card--grid .resource-card__footer :deep(.btn) {
  flex: 1 1 0;
  min-width: 0;
}

.resource-card--list .resource-card__footer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  padding: 0 0 0 14px;
  border-left: 1px solid var(--color-border-subtle);
}

.resource-card__booking-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-success-text);
}

.resource-card__booking-hint--muted {
  color: var(--color-text-muted);
}
</style>