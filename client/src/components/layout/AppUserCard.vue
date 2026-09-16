<template>
  <div class="user-card">
    <span class="user-card__identity">
      <span class="user-card__avatar" :class="{ 'user-card__avatar--fallback': !avatarUrl }">
        <img
          v-if="avatarUrl"
          class="user-card__avatar-img"
          :src="avatarUrl"
          :alt="name"
          loading="lazy"
        />
        <template v-else>{{ initials }}</template>
      </span>

      <span class="user-card__texts">
        <span class="user-card__name">{{ name }}</span>
        <span class="user-card__role">{{ role }}</span>
      </span>
    </span>

    <button
      type="button"
      class="user-card__menu"
      :aria-label="`Меню пользователя ${name}`"
      @click="emit('menu')"
    >
      <IconMoreVertical :size="18" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import IconMoreVertical from '../ui/Icons/Shell&Navigation/IconMoreVertical.vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: '',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['menu']);

const initials = computed(() => {
  const letters = props.name.trim().split(/\s+/).map((w) => w[0] || '');
  return (letters[0] || '?') + (letters[1] || '');
});
</script>

<style scoped>
.user-card {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  border-top: 1px solid var(--color-border-subtle);
}

.user-card__identity {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.user-card__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  font-family: var(--font-heading, sans-serif);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
}

.user-card__avatar--fallback {
  background: var(--color-primary-light);
}

.user-card__avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-full);
}

.user-card__texts {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.user-card__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-main);
}

.user-card__role {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--color-select-icon);
}

.user-card__menu {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.user-card__menu:hover {
  background: var(--color-surface-subtle);
  color: var(--color-text-main);
}

.user-card__menu:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
</style>