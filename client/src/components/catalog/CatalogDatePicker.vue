<template>
  <div ref="rootRef" class="date-picker" role="dialog" aria-label="Выбор даты и времени" @keydown.esc.stop="requestClose">
    <div class="date-picker__head">
      <button type="button" class="date-picker__nav" aria-label="Предыдущий месяц" @click="moveMonth(-1)">‹</button>
      <strong aria-live="polite">{{ monthLabel }}</strong>
      <button type="button" class="date-picker__nav" aria-label="Следующий месяц" @click="moveMonth(1)">›</button>
    </div>
    <div class="date-picker__week" aria-hidden="true">
      <span v-for="day in weekDays" :key="day">{{ day }}</span>
    </div>
    <div class="date-picker__days" role="grid" aria-label="Календарь">
      <button
        v-for="day in calendarDays"
        :key="day.key"
        type="button"
        class="date-picker__day"
        :class="{
          'date-picker__day--muted': !day.currentMonth,
          'date-picker__day--selected': day.value === draft.date,
          'date-picker__day--today': day.value === today,
        }"
        :aria-pressed="day.value === draft.date"
        :aria-label="day.label"
        @click="selectDate(day.value)"
      >{{ day.number }}</button>
    </div>
    <div class="date-picker__times">
      <label>
        Начало
        <input
          :value="draft.timeStart"
          type="time"
          step="60"
          aria-label="Время начала"
          @input="updateTime('timeStart', $event.target.value)"
        />
      </label>
      <span aria-hidden="true">—</span>
      <label>
        Конец
        <input
          :value="draft.timeEnd"
          type="time"
          step="60"
          aria-label="Время окончания"
          @input="updateTime('timeEnd', $event.target.value)"
        />
      </label>
    </div>
    <p v-if="timeError" class="date-picker__error" role="alert">{{ timeError }}</p>
    <div class="date-picker__actions">
      <button type="button" class="date-picker__clear" @click="clear">Очистить</button>
      <AppButton size="sm" :disabled="Boolean(timeError)" @click="apply">Применить</AppButton>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import AppButton from '../ui/AppButton.vue';

const props = defineProps({ modelValue: { type: Object, required: true } });
const emit = defineEmits(['update:modelValue', 'apply', 'clear', 'close']);

const rootRef = ref(null);
const cursor = ref(
  props.modelValue.date ? new Date(`${props.modelValue.date}T12:00:00`) : new Date(),
);
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const draft = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
const today = formatDate(new Date());
const monthLabel = computed(() => cursor.value.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }));

const timeError = computed(() => {
  if (!draft.value.timeStart || !draft.value.timeEnd) return 'Укажите начало и конец интервала';
  if (draft.value.timeStart >= draft.value.timeEnd) return 'Время окончания должно быть позже начала';
  return '';
});

const calendarDays = computed(() => {
  const first = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const value = formatDate(date);
    return {
      key: value,
      value,
      number: date.getDate(),
      currentMonth: date.getMonth() === cursor.value.getMonth(),
      label: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  });
});

onMounted(() => {
  rootRef.value?.querySelector('button')?.focus?.();
});

function moveMonth(delta) {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + delta, 1);
}

function selectDate(date) {
  const timeStart = draft.value.timeStart || '09:00';
  const timeEnd = draft.value.timeEnd || '10:00';
  draft.value = { ...draft.value, date, timeStart, timeEnd, dateRangeText: formatLabel(date, timeStart, timeEnd) };
}

function updateTime(key, value) {
  const timeStart = key === 'timeStart' ? value : draft.value.timeStart;
  const timeEnd = key === 'timeEnd' ? value : draft.value.timeEnd;
  draft.value = {
    ...draft.value,
    [key]: value,
    dateRangeText: formatLabel(draft.value.date, timeStart, timeEnd),
  };
}

function apply() {
  if (timeError.value) return;
  emit('apply', {
    ...draft.value,
    dateRangeText: formatLabel(draft.value.date, draft.value.timeStart, draft.value.timeEnd),
  });
}

function clear() {
  emit('clear');
}

function requestClose() {
  emit('close');
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatLabel(date, start, end) {
  return date
    ? `${new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} · ${start}–${end}`
    : 'Выберите дату и время';
}
</script>

<style scoped>
.date-picker {
  width: 320px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

.date-picker__head,
.date-picker__week,
.date-picker__days,
.date-picker__times,
.date-picker__actions {
  display: flex;
  align-items: center;
}

.date-picker__head {
  justify-content: space-between;
  margin-bottom: 14px;
  text-transform: capitalize;
  color: var(--color-text-main);
}

.date-picker__nav {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-surface-subtle);
  color: var(--color-primary);
  font-size: 22px;
  cursor: pointer;
}

.date-picker__nav:focus-visible,
.date-picker__day:focus-visible,
.date-picker__clear:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.date-picker__week,
.date-picker__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
}

.date-picker__week {
  margin-bottom: 6px;
  color: var(--color-text-muted);
  font-size: 11px;
}

.date-picker__day {
  height: 32px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-main);
  cursor: pointer;
}

.date-picker__day:hover,
.date-picker__day--selected {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
}

.date-picker__day--muted {
  color: var(--color-text-muted);
  opacity: 0.55;
}

.date-picker__day--today {
  box-shadow: inset 0 0 0 1px var(--color-primary);
}

.date-picker__times {
  gap: 8px;
  margin-top: 16px;
}

.date-picker__times label {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  color: var(--color-text-secondary);
  font-size: 11px;
}

.date-picker__times input {
  width: 100%;
  height: 34px;
  padding: 0 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-main);
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
}

.date-picker__times input:focus {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.date-picker__error {
  margin: 8px 0 0;
  color: var(--color-danger);
  font-size: 11px;
}

.date-picker__actions {
  justify-content: space-between;
  margin-top: 16px;
}

.date-picker__clear {
  border: 0;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}
</style>
