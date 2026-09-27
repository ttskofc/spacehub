<template>
  <header class="app-header">
    <div class="app-header__search">
      <SearchInput
        ref="searchRef"
        :model-value="query"
        size="md"
        :placeholder="searchPlaceholder"
        :aria-label="searchPlaceholder"
        @update:model-value="onSearch"
      >
        <template #suffix>
          <kbd class="app-header__hotkey">{{ hotkeyLabel }}</kbd>
        </template>
      </SearchInput>
    </div>

    <div class="app-header__actions">
      <span class="app-header__bell">
        <AppButton
          variant="ghost"
          size="icon"
          :aria-label="notificationsLabel"
          @click="emit('open-notifications')"
        >
          <IconBell />
        </AppButton>
        <span v-if="unreadCount > 0" class="app-header__bell-badge" aria-hidden="true">
          {{ badgeText }}
        </span>
      </span>

      <AppButton
        variant="primary"
        size="md"
        class="app-header__book"
        @click="emit('quick-book')"
      >
        <IconPlus :size="16" />
        <span class="app-header__book-label">Быстрое бронирование</span>
      </AppButton>

      <AppDropdown align="right" width="240px">
        <template #trigger>
          <AppAvatar :src="user.avatarUrl" :name="user.name" size="md" />
        </template>

        <div class="app-header__profile">
          <span class="app-header__profile-name">{{ user.name }}</span>
          <span class="app-header__profile-role">{{ user.role }}</span>
          <span class="app-header__profile-email">{{ user.email }}</span>
        </div>

        <div class="app-header__divider" />

        <button type="button" class="app-header__item" role="menuitem" @click="emit('logout')">
          <IconLogOut :size="16" />
          <span>Выйти из аккаунта</span>
        </button>
      </AppDropdown>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import AppButton from '../ui/AppButton.vue';
import AppAvatar from '../ui/AppAvatar.vue';
import AppDropdown from '../ui/AppDropdown.vue';
import SearchInput from '../ui/SearchInput.vue';
import IconBell from '../ui/Icons/Shell&Navigation/IconBell.vue';
import IconPlus from '../ui/Icons/Shell&Navigation/IconPlus.vue';
import IconLogOut from '../ui/Icons/Roadmap Icons/IconLogOut.vue';
import { useUserStore } from '../../stores/user';

const props = defineProps({
  searchPlaceholder: {
    type: String,
    default: 'Поиск переговорных, столов или ресурсов',
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['search', 'quick-book', 'open-notifications', 'logout']);

const userStore = useUserStore();

const user = computed(() => ({
  name: userStore.name,
  role: userStore.role,
  email: userStore.email,
  avatarUrl: userStore.avatarUrl,
}));

const query = ref('');
const searchRef = ref(null);

const isApple = /mac|iphone|ipad|ipod/i.test(
  typeof navigator === 'undefined' ? '' : navigator.userAgent,
);

const hotkeyLabel = isApple ? '⌘K' : 'Ctrl K';

const badgeText = computed(() => {
  if (props.unreadCount > 99) return '99+';
  return String(props.unreadCount);
});

const notificationsLabel = computed(() =>
  props.unreadCount > 0 ? `Уведомления (${props.unreadCount})` : 'Уведомления',
);

function onSearch(value) {
  query.value = value;
  emit('search', value);
}

function focusSearch() {
  searchRef.value?.focus();
}

function onKeydown(e) {
  if (e.defaultPrevented) return;
  if (e.key.toLowerCase() !== 'k' || (!e.metaKey && !e.ctrlKey)) return;
  e.preventDefault();
  focusSearch();
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.app-header {
  --app-input-suffix-space: 68px;

  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 72px;
  padding: 0 24px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.app-header__search {
  flex: 1;
  max-width: 520px;
  min-width: 0;
}

.app-header__hotkey {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  background-color: var(--color-surface-subtle);
  font-family: var(--font-body, inherit);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  color: var(--color-text-muted);
  white-space: nowrap;
  user-select: none;
  pointer-events: none;
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.app-header__bell {
  position: relative;
  display: inline-flex;
}

.app-header__bell-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-surface);
  font-family: var(--font-heading, sans-serif);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-text-on-primary);
  pointer-events: none;
}

.app-header__profile {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  min-width: 0;
}

.app-header__profile-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-main);
}

.app-header__profile-role,
.app-header__profile-email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.app-header__profile-email {
  color: var(--color-text-muted);
}

.app-header__divider {
  height: 1px;
  margin: 4px 0;
  background-color: var(--color-border-subtle);
}

.app-header__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 12px;
  border: none;
  border-radius: var(--radius-sm);
  background-color: transparent;
  font-family: var(--font-body, inherit);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  color: var(--color-text-main);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.app-header__item:hover {
  background-color: var(--color-surface-subtle);
  color: var(--color-primary);
}

.app-header__item:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: -2px;
}

@media (max-width: 900px) {
  .app-header__book {
    width: 40px;
    padding: 0;
  }

  .app-header__book-label {
    display: none;
  }
}
</style>
