<template>
  <nav class="app-breadcrumbs" aria-label="Хлебные крошки">
    <ol class="app-breadcrumbs__list">
      <li
        v-for="(item, index) in items"
        :key="keyOf(item, index)"
        class="app-breadcrumbs__item"
      >
        <RouterLink
          v-if="isLink(item, index)"
          :to="item.to"
          class="app-breadcrumbs__link"
        >
          {{ item.label }}
        </RouterLink>
        <span v-else class="app-breadcrumbs__current" aria-current="page">
          {{ item.label }}
        </span>

        <span v-if="index < items.length - 1" class="app-breadcrumbs__separator" aria-hidden="true">
          <slot name="separator">
            <IconChevronRight size="xs" />
          </slot>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import IconChevronRight from './Icons/Catalog Controls/IconChevronRight.vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const isLast = (index) => index === props.items.length - 1;

const isLink = (item, index) => Boolean(item.to) && !isLast(index);

const keyOf = (item, index) =>
  typeof item.to === 'string' ? item.to : `item-${index}`;
</script>

<style scoped>
.app-breadcrumbs__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
}

.app-breadcrumbs__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.app-breadcrumbs__link {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-body, inherit);
  font-size: 13px;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-xs);
  transition: color var(--transition-fast);
}

.app-breadcrumbs__link:hover {
  color: var(--color-primary);
}

.app-breadcrumbs__link:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.app-breadcrumbs__current {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-main);
}

.app-breadcrumbs__separator {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-muted);
  user-select: none;
}
</style>
