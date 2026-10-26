<template>
  <section class="schedule-card">
    <div class="schedule-card__head">
      <div><p class="schedule-card__eyebrow">Расписание</p><h2>Выберите время</h2></div>
      <div class="schedule-card__date-actions">
        <AppButton variant="ghost" size="icon" aria-label="Предыдущий день" @click="changeDate(-1)">‹</AppButton>
        <button type="button" class="schedule-card__date" @click="emit('date-change', selectedDate)">{{ formattedDate }}</button>
        <AppButton variant="ghost" size="icon" aria-label="Следующий день" @click="changeDate(1)">›</AppButton>
      </div>
    </div>
    <div class="schedule-card__toolbar">
      <AppButton variant="secondary" size="sm" @click="setToday">Сегодня</AppButton>
      <div class="schedule-card__modes" role="group" aria-label="Масштаб расписания">
        <button v-for="mode in modes" :key="mode.value" type="button" :class="{ active: viewMode === mode.value }" @click="viewMode = mode.value">{{ mode.label }}</button>
      </div>
    </div>
    <div class="schedule-card__legend">
      <span v-for="item in legend" :key="item.label"><i :class="`dot dot--${item.tone}`"></i>{{ item.label }}</span>
    </div>
    <div v-if="loading" class="schedule-card__state">Загрузка расписания...</div>
    <div v-else-if="error" class="schedule-card__state schedule-card__state--error">{{ error }}</div>
    <div v-else-if="!slots.length" class="schedule-card__state">На эту дату занятых интервалов нет.</div>
    <div v-else class="schedule-card__slots">
      <button
        v-for="slot in slots"
        :key="slot.start"
        type="button"
        class="schedule-slot"
        :class="`schedule-slot--${slot.status}`"
        :disabled="slot.status !== 'free' && slot.status !== 'selected'"
        @click="selectSlot(slot)"
      >
        <span class="schedule-slot__time">{{ slot.start }}–{{ slot.end }}</span>
        <span class="schedule-slot__content">
          <strong>{{ slot.status === 'selected' ? 'Выбрано' : slot.title || statusLabel(slot.status) }}</strong>
          <small v-if="slot.organizer">{{ slot.organizer }}</small>
          <small v-if="slot.description">{{ slot.description }}</small>
        </span>
        <IconWrench v-if="slot.status === 'service'" :size="16" />
        <AppBadge v-if="slot.status === 'selected'" variant="success" :dot="false" text="Ваш выбор" />
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppBadge from '../ui/AppBadge.vue';
import AppButton from '../ui/AppButton.vue';
import IconWrench from '../ui/Icons/Calendar & Booking Actions/IconWrench.vue';

const props = defineProps({
  bookings: { type: Array, default: () => [] },
  workDayStart: { type: String, default: '09:00' },
  workDayEnd: { type: String, default: '19:00' },
  slotDuration: { type: Number, default: 60 },
  selectedSlot: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
});
const emit = defineEmits(['select', 'date-change']);
const selectedDate = ref(new Date());
const viewMode = ref('day');
const modes = [{ value: 'day', label: 'День' }, { value: 'week', label: 'Неделя' }, { value: 'month', label: 'Месяц' }];
const legend = [{ label: 'Свободно', tone: 'free' }, { label: 'Выбрано', tone: 'selected' }, { label: 'В обработке', tone: 'pending' }, { label: 'Занято', tone: 'busy' }, { label: 'Сервис', tone: 'service' }];
const duration = computed(() => {
  const value = Number(props.slotDuration);
  return Number.isInteger(value) && value > 0 ? value : 60;
});
const formattedDate = computed(() => selectedDate.value.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }));
const slots = computed(() => {
  const start = toMinutes(props.workDayStart);
  const end = toMinutes(props.workDayEnd);
  const result = [];
  let cursor = start;

  const bookings = [...props.bookings]
    .map((booking) => ({
      ...booking,
      startMinute: Math.max(start, toMinutes(booking.start)),
      endMinute: Math.min(end, toMinutes(booking.end)),
    }))
    .filter((booking) => Number.isFinite(booking.startMinute)
      && Number.isFinite(booking.endMinute)
      && booking.startMinute < booking.endMinute)
    .sort((a, b) => a.startMinute - b.startMinute);

  for (const booking of bookings) {
    if (booking.startMinute > cursor) {
      addFreeSlots(result, cursor, booking.startMinute);
    }

    if (booking.endMinute > cursor) {
      result.push(makeSlot(
        booking.startMinute,
        booking.endMinute,
        booking,
      ));
      cursor = booking.endMinute;
    }
  }

  if (cursor < end) {
    addFreeSlots(result, cursor, end);
  }

  return result;
});
function toMinutes(value) {
  const text = String(value ?? '').trim().replace('T', ' ');
  const time = text.includes(' ') ? text.split(' ')[1] : text;
  const [h, m] = time.split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
}
function toTime(value) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }
function makeSlot(start, end, booking = null) {
  const slot = {
    date: toDateValue(selectedDate.value),
    start: toTime(start),
    end: toTime(end),
    status: booking
      ? (booking.status === 'maintenance' ? 'service' : booking.status || 'busy')
      : 'free',
    title: booking?.title,
    description: booking?.description,
    organizer: booking?.organizer,
  };
  if (slot.status === 'free' && props.selectedSlot?.start === slot.start) {
    slot.status = 'selected';
  }
  return slot;
}
function addFreeSlots(result, start, end) {
  for (let minute = start; minute < end; minute += duration.value) {
    result.push(makeSlot(minute, Math.min(minute + duration.value, end)));
  }
}
function selectSlot(slot) { emit('select', slot.status === 'selected' ? null : slot); }
function changeDate(delta) { const date = new Date(selectedDate.value); date.setDate(date.getDate() + delta); selectedDate.value = date; emit('date-change', date); }
function setToday() { selectedDate.value = new Date(); emit('date-change', selectedDate.value); }
function toDateValue(date) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }
function statusLabel(status) { return { free: 'Свободный слот', pending: 'В обработке', busy: 'Занято', service: 'Сервис' }[status] || 'Недоступно'; }
</script>

<style scoped>
.schedule-card { padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); box-shadow: var(--shadow-sm); }
.schedule-card__head, .schedule-card__toolbar, .schedule-card__legend { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.schedule-card__eyebrow { margin: 0 0 4px; color: var(--color-primary); font-size: 12px; font-weight: 700; text-transform: uppercase; }
h2 { margin: 0; font-family: var(--font-heading); font-size: 22px; color: var(--color-text-main); }
.schedule-card__date-actions { display: flex; align-items: center; gap: 4px; }
.schedule-card__date { border: 0; background: transparent; color: var(--color-text-main); font-weight: 600; cursor: pointer; }
.schedule-card__toolbar { margin-top: 18px; }
.schedule-card__modes { display: flex; padding: 3px; border-radius: var(--radius-sm); background: var(--color-surface-subtle); }
.schedule-card__modes button { padding: 6px 10px; border: 0; border-radius: var(--radius-xs); background: transparent; color: var(--color-text-secondary); cursor: pointer; }
.schedule-card__modes button.active { background: var(--color-primary); color: #fff; }
.schedule-card__legend { justify-content: flex-start; flex-wrap: wrap; margin: 18px 0 12px; color: var(--color-text-muted); font-size: 11px; }
.schedule-card__legend span { display: inline-flex; align-items: center; gap: 5px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-neutral); }.dot--free { background: var(--color-success); }.dot--selected { background: var(--color-primary); }.dot--pending { background: var(--color-warning); }.dot--busy { background: var(--color-danger); }.dot--service { background: var(--color-neutral); }
.schedule-card__slots { display: grid; gap: 8px; }
.schedule-card__state { padding: 24px; border-radius: var(--radius-md); background: var(--color-surface-subtle); color: var(--color-text-muted); text-align: center; }
.schedule-card__state--error { background: var(--color-danger-bg); color: var(--color-danger-text); }
.schedule-slot { display: grid; grid-template-columns: 108px minmax(0, 1fr) auto; align-items: center; gap: 12px; min-height: 58px; padding: 10px 12px; border: 1px solid var(--color-border-subtle); border-left: 4px solid var(--color-success-border); border-radius: var(--radius-md); background: var(--color-success-bg); text-align: left; color: var(--color-text-main); cursor: pointer; }
.schedule-slot:disabled { cursor: default; }.schedule-slot--busy { border-left-color: var(--color-danger); background: var(--color-surface-subtle); }.schedule-slot--pending { border-left-color: var(--color-warning); background: var(--color-warning-bg); }.schedule-slot--service { border-left-color: var(--color-neutral); background: var(--color-neutral-bg); color: var(--color-neutral-text); }.schedule-slot--selected { border-color: var(--color-primary); background: var(--color-primary); color: #fff; }
.schedule-slot__time { min-width: 0; font-weight: 700; font-size: 13px; white-space: nowrap; }.schedule-slot__content { display: flex; flex-direction: column; gap: 3px; min-width: 0; }.schedule-slot__content strong, .schedule-slot__content small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.schedule-slot__content strong { font-size: 13px; }.schedule-slot__content small { color: var(--color-text-muted); }.schedule-slot--selected small { color: rgba(255,255,255,.75); }
@media (max-width: 560px) { .schedule-card__head { align-items: flex-start; flex-direction: column; }.schedule-slot { grid-template-columns: 102px minmax(0, 1fr); }.schedule-slot :deep(.badge) { grid-column: 2; justify-self: start; } }
</style>
