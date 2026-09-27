<template>
  <span
    class="app-avatar"
    :class="[`app-avatar--${size}`, `app-avatar--${variant}`]"
    :role="name ? 'img' : undefined"
    :aria-label="name || undefined"
  >
    <img
      v-if="showImage"
      class="app-avatar__image"
      :src="src"
      alt=""
      loading="lazy"
      decoding="async"
      @error="hasError = true"
    />
    <span v-else class="app-avatar__initials">{{ initials }}</span>

    <span
      v-if="status"
      class="app-avatar__status"
      :class="`app-avatar__status--${status}`"
      :title="statusTitle"
    />
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg' | 'xl'
    validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v),
  },
  variant: {
    type: String,
    default: 'soft', // 'soft' | 'neutral'
    validator: (v) => ['soft', 'neutral'].includes(v),
  },
  status: {
    type: String,
    default: '', // 'success' | 'warning' | 'danger' | 'neutral'
    validator: (v) => ['', 'success', 'warning', 'danger', 'neutral'].includes(v),
  },
  statusLabel: {
    type: String,
    default: '',
  },
});

const hasError = ref(false);

const showImage = computed(() => Boolean(props.src) && !hasError.value);

const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((word) => word.charAt(0).toUpperCase());
  return letters.join('') || '?';
});

const STATUS_LABELS = {
  success: 'На связи',
  warning: 'Скоро вернётся',
  danger: 'Занят',
  neutral: 'Не в сети',
};

const statusTitle = computed(
  () => props.statusLabel || STATUS_LABELS[props.status] || '',
);

watch(
  () => props.src,
  () => {
    hasError.value = false;
  },
);
</script>

<style scoped>
.app-avatar {
  --app-avatar-size: 40px;
  --app-avatar-font: 14px;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--app-avatar-size);
  height: var(--app-avatar-size);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-family: var(--font-heading, sans-serif);
  font-size: var(--app-avatar-font);
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.02em;
  user-select: none;
  box-sizing: border-box;
}

.app-avatar--soft {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.app-avatar--neutral {
  background-color: var(--color-surface-subtle);
  color: var(--color-text-main);
}

.app-avatar__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-full);
}

.app-avatar__initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.app-avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  width: max(8px, calc(var(--app-avatar-size) * 0.3));
  height: max(8px, calc(var(--app-avatar-size) * 0.3));
  border-radius: var(--radius-full);
  box-shadow: 0 0 0 2px var(--color-surface);
}

/* Статусы */
.app-avatar__status--success {
  background-color: var(--color-success);
}

.app-avatar__status--warning {
  background-color: var(--color-warning);
}

.app-avatar__status--danger {
  background-color: var(--color-danger);
}

.app-avatar__status--neutral {
  background-color: var(--color-neutral);
}

/* Размеры */
.app-avatar--sm {
  --app-avatar-size: 32px;
  --app-avatar-font: 12px;
}

.app-avatar--lg {
  --app-avatar-size: 48px;
  --app-avatar-font: 16px;
}

.app-avatar--xl {
  --app-avatar-size: 64px;
  --app-avatar-font: 20px;
}
</style>
