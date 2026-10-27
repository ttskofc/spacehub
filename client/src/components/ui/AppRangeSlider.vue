<template>
  <div class="range-slider">
    <div
      class="range-slider__controls"
      :style="{ '--range-start': startPercent + '%', '--range-end': endPercent + '%' }"
    >
      <div class="range-slider__track" aria-hidden="true"></div>
      <div class="range-slider__fill" aria-hidden="true"></div>
      <input
        class="range-slider__input"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="value[0]"
        aria-label="Минимальное значение"
        :aria-valuetext="valueText(value[0])"
        :aria-valuenow="value[0]"
        @input="updateValue(0, $event.target.value)"
      />
      <input
        class="range-slider__input"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="value[1]"
        aria-label="Максимальное значение"
        :aria-valuetext="valueText(value[1])"
        :aria-valuenow="value[1]"
        @input="updateValue(1, $event.target.value)"
      />
    </div>
    <div class="range-slider__summary" aria-live="polite">{{ formatValue([value[0], value[1]]) }}</div>
    <div v-if="marks.length" class="range-slider__marks" aria-hidden="true">
      <span
        v-for="mark in marks"
        :key="mark.value"
        class="range-slider__mark"
        :style="{ left: percent(mark.value) + '%' }"
      >
        <span class="range-slider__tick"></span><span>{{ mark.label }}</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [0, 100] },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  marks: { type: Array, default: () => [] },
  formatValue: { type: Function, default: null },
});
const emit = defineEmits(['update:modelValue']);

const value = computed(() => {
  const raw = Array.isArray(props.modelValue) ? props.modelValue : [props.min, props.max];
  const clamp = (number) => Math.max(props.min, Math.min(props.max, Number(number) || 0));
  return [clamp(raw[0]), clamp(raw[1])].sort((a, b) => a - b);
});

const percent = (number) => (props.max === props.min ? 0 : ((number - props.min) / (props.max - props.min)) * 100);
const startPercent = computed(() => percent(value.value[0]));
const endPercent = computed(() => percent(value.value[1]));

function formatValue(range) {
  if (typeof props.formatValue === 'function') return props.formatValue(range);
  return `${range[0]} – ${range[1]}`;
}

function valueText(number) {
  if (typeof props.formatValue === 'function') {
    const result = props.formatValue([number, number]);
    if (typeof result === 'string') {
      const parts = result.split('–');
      const candidate = parts.length === 2 ? parts[0] : result;
      if (candidate.trim()) return candidate.trim();
    }
  }
  return String(number);
}

function updateValue(index, rawValue) {
  const next = [...value.value];
  const candidate = Number(rawValue);
  const clamp = (number) => Math.max(props.min, Math.min(props.max, number));
  if (index === 0) next[0] = clamp(Math.min(candidate, next[1]));
  else next[1] = clamp(Math.max(candidate, next[0]));
  emit('update:modelValue', next);
}
</script>

<style scoped>
.range-slider {
  padding: 12px 8px 8px;
}

.range-slider__controls {
  position: relative;
  height: 24px;
}

.range-slider__track,
.range-slider__fill {
  position: absolute;
  top: 10px;
  height: 4px;
  border-radius: var(--radius-full);
}

.range-slider__track {
  right: 0;
  left: 0;
  background: var(--color-border);
}

.range-slider__fill {
  left: var(--range-start);
  width: calc(var(--range-end) - var(--range-start));
  background: var(--color-primary);
}

.range-slider__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 24px;
  margin: 0;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.range-slider__input::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  appearance: none;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow-sm);
  cursor: grab;
  pointer-events: auto;
}

.range-slider__input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow-sm);
  cursor: grab;
  pointer-events: auto;
}

.range-slider__input:focus-visible {
  outline: none;
}

.range-slider__input:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 4px var(--color-focus-ring);
}

.range-slider__summary {
  margin-top: 6px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.range-slider__marks {
  position: relative;
  height: 24px;
  margin-top: 6px;
  color: var(--color-text-muted);
  font-size: 11px;
}

.range-slider__mark {
  position: absolute;
  display: flex;
  min-width: 30px;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transform: translateX(-50%);
  white-space: nowrap;
}

.range-slider__tick {
  width: 1px;
  height: 5px;
  background: var(--color-border);
}

.range-slider__mark:first-child {
  transform: none;
  align-items: flex-start;
}

.range-slider__mark:last-child {
  transform: translateX(-100%);
  align-items: flex-end;
}
</style>
