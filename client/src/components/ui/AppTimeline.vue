<template>
  <div class="mini-timeline">
    <div class="mini-timeline__header">
      <span class="mini-timeline__title">{{ title }}</span>

      <span
        v-if="currentStatusText"
        class="mini-timeline__status"
        :class="`mini-timeline__status--${currentStatus}`"
        role="status"
      >
        {{ currentStatusText }}
      </span>
    </div>


    <div
      class="mini-timeline__track"
      role="img"
      :aria-label="trackSummary"
    >
      <div
        v-for="slot in computedSlots"
        :key="slot.timeLabel"
        class="mini-timeline__segment"
        :class="`mini-timeline__segment--${slot.status}`"
        :title="slot.tooltip"
        aria-hidden="true"
      ></div>
    </div>


    <div class="mini-timeline__scale">
      <span>{{ workDayStart }}</span>
      <span class="mini-timeline__scale-mid">{{ midDayTime }}</span>
      <span>{{ workDayEnd }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Расписание сегодня',
  },

  workDayStart: {
    type: String,
    default: '10:00',
  },
  workDayEnd: {
    type: String,
    default: '19:00',
  },

  slotDurationMinutes: {
    type: Number,
    default: 60,
    validator: (v) => v > 0,
  },


  bookings: {
    type: Array,
    default: () => [],
  },
  currentTime: {
    type: String,
    default: () => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    },
  },


    // status: 'busy' | 'pending' | 'maintenance' | 'free' (по умолчанию 'busy')
  freeLabel: {
    type: String,
    default: 'Свободно',
  },
  busyLabel: {
    type: String,
    default: 'Занято',
  },
  pendingLabel: {
    type: String,
    default: 'Ожидает подтверждения',
  },
  maintenanceLabel: {
    type: String,
    default: 'Тех.обслуживание',
  },
});

const VALID_STATUSES = ['busy', 'pending', 'maintenance', 'free'];

const STATUS_PRIORITY = ['maintenance', 'busy', 'pending', 'free'];

function toMinutes(timeStr) {
  const [h, m] = String(timeStr ?? '').split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
}

function formatTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function normalizeStatus(booking) {
  return VALID_STATUSES.includes(booking?.status) ? booking.status : 'busy';
}

function statusLabel(status) {
  if (status === 'free') return props.freeLabel;
  if (status === 'pending') return props.pendingLabel;
  if (status === 'maintenance') return props.maintenanceLabel;
  return props.busyLabel;
}

function isOverlapping(slotStart, slotEnd, booking) {
  const bStart = toMinutes(booking.start);
  const bEnd = toMinutes(booking.end);
  if (!Number.isFinite(bStart) || !Number.isFinite(bEnd)) return false;
  return slotStart < bEnd && slotEnd > bStart;
}

function pickBookingForSlot(slotStart, slotEnd) {
  let best = null;
  let bestIdx = Infinity;
  for (const b of props.bookings) {
    if (!isOverlapping(slotStart, slotEnd, b)) continue;
    const idx = STATUS_PRIORITY.indexOf(normalizeStatus(b));
    if (idx < bestIdx) {
      best = b;
      bestIdx = idx;
    }
  }
  return best;
}

const midDayTime = computed(() => {
  const mid = Math.round((toMinutes(props.workDayStart) + toMinutes(props.workDayEnd)) / 2);
  return formatTime(mid);
});

const computedSlots = computed(() => {
  const startMin = toMinutes(props.workDayStart);
  const endMin = toMinutes(props.workDayEnd);
  if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || startMin >= endMin) return [];

  const slots = [];
  for (let t = startMin; t < endMin; t += props.slotDurationMinutes) {
    const slotStart = t;
    const slotEnd = Math.min(t + props.slotDurationMinutes, endMin);
    const matchedBooking = pickBookingForSlot(slotStart, slotEnd);
    const status = matchedBooking ? normalizeStatus(matchedBooking) : 'free';
    const timeLabel = formatTime(slotStart);

    slots.push({
      timeLabel,
      status,
      tooltip: matchedBooking
        ? `${timeLabel} — ${matchedBooking.title || statusLabel(status)}`
        : `${timeLabel} — ${props.freeLabel}`,
    });
  }
  return slots;
});


const currentActiveBooking = computed(() => {
  const nowMin = toMinutes(props.currentTime);
  if (!Number.isFinite(nowMin)) return null;
  return props.bookings.find((b) => {
    const bStart = toMinutes(b.start);
    const bEnd = toMinutes(b.end);
    return Number.isFinite(bStart) && Number.isFinite(bEnd) && nowMin >= bStart && nowMin < bEnd;
  });
});

const currentStatus = computed(() =>
  currentActiveBooking.value ? normalizeStatus(currentActiveBooking.value) : 'free',
);

const currentStatusText = computed(() => {
  const active = currentActiveBooking.value;
  if (active) return active.title || statusLabel(currentStatus.value);
  return props.freeLabel;
});


const trackSummary = computed(() => {
  const counts = { free: 0, busy: 0, pending: 0, maintenance: 0 };
  for (const s of computedSlots.value) counts[s.status] += 1;

  const parts = [];
  if (counts.maintenance > 0) parts.push(`${counts.maintenance} ${props.maintenanceLabel.toLowerCase()}`);
  if (counts.pending > 0) parts.push(`${counts.pending} ${props.pendingLabel.toLowerCase()}`);
  if (counts.busy > 0) parts.push(`${counts.busy} ${props.busyLabel.toLowerCase()}`);
  if (counts.free > 0) parts.push(`${counts.free} ${props.freeLabel.toLowerCase()}`);
  return `${props.title}: ${parts.join(', ')}`;
});
</script>

<style scoped>
.mini-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  user-select: none;
}

.mini-timeline__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.mini-timeline__title {
  font-family: var(--font-heading, sans-serif);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-main);
}

.mini-timeline__status {
  flex-shrink: 0;
  padding: 2px 10px;
  border: 1px solid var(--color-success-border);
  border-radius: var(--radius-full);
  background-color: var(--color-success-bg);
  color: var(--color-success-text);
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.mini-timeline__status--busy {
  border-color: var(--color-danger-border);
  background-color: var(--color-danger-bg);
  color: var(--color-danger-text);
}

.mini-timeline__status--pending {
  border-color: var(--color-warning-border);
  background-color: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.mini-timeline__status--maintenance {
  border-color: var(--color-neutral-border);
  background-color: var(--color-neutral-bg);
  color: var(--color-neutral-text);
}

.mini-timeline__track {
  display: flex;
  gap: 2px;
  align-items: center;
  width: 100%;
  height: 12px;
  padding: 3px;
  box-sizing: border-box;
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
}

.mini-timeline__segment {
  flex: 1;
  height: 100%;
  border-radius: var(--radius-full);
  transition: opacity var(--transition-fast);
}

.mini-timeline__segment:hover {
  opacity: 0.85;
}

.mini-timeline__segment--busy {
  background-color: var(--color-danger-soft);
}

.mini-timeline__segment--pending {
  background-color: var(--color-warning-soft);
}

.mini-timeline__segment--maintenance {
  background-color: var(--color-neutral-soft);
}

.mini-timeline__segment--free {
  background-color: var(--color-success-soft);
}

.mini-timeline__scale {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  color: var(--color-text-secondary);
}


.mini-timeline__scale-mid {
  color: var(--color-accent-matcha-dark);
}
</style>