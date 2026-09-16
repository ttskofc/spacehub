<template>
  <aside class="sidebar">
    <div class="sidebar__top">
      <AppBrandLogo />

      <nav class="sidebar__nav">
        <NavSection>
          <NavItem to="/" label="Каталог ресурсов" :icon="IconGrid" :count="4" badge-variant="matcha" />
          <NavItem to="/bookings" label="Мои бронирования" :icon="IconCalendarMonth" :count="2" badge-variant="matcha" />
          <NavItem to="/calendar" label="Календарь" :icon="IconCalendarCheck" />
        </NavSection>
      </nav>
    </div>

    <div class="sidebar__bottom">
      <AppUserCard
        :name="userStore.name"
        :role="userStore.role"
        :avatar-url="userStore.avatarUrl"
        @menu="emit('user-menu')"
      />
    </div>
  </aside>
</template>

<script setup>
import AppBrandLogo from './AppBrandLogo.vue';
import NavSection from './NavSection.vue';
import NavItem from './NavItem.vue';
import AppUserCard from './AppUserCard.vue';
import IconGrid from '../ui/Icons/Shell&Navigation/IconGrid.vue';
import IconCalendarMonth from '../ui/Icons/Shell&Navigation/IconCalendarMonth.vue';
import IconCalendarCheck from '../ui/Icons/Shell&Navigation/IconCalendarCheck.vue';
import { useUserStore } from '../../stores/user';

const emit = defineEmits(['user-menu']);
const userStore = useUserStore();
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: var(--sidebar-width, 264px);
  height: 100vh;
  position: sticky;
  top: 0;
  background: var(--color-bg-app);
  border-right: 1px solid var(--color-select-border);
}

.sidebar__top {
  display: flex;
  flex-direction: column;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
}

.sidebar__bottom {
  flex-shrink: 0;
}
</style>