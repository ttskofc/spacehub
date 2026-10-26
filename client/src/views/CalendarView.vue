<template>
  <div class="view-page">
    <header class="view-page__header">
      <h1>Календарь</h1>
      <p>Расписание ресурсов на сегодня.</p>
    </header>

    <div class="view-page__timeline">
      <AppTimeline
        :work-day-start="resource?.timelineStart || '09:00'"
        :work-day-end="resource?.timelineEnd || '19:00'"
        :slot-duration-minutes="resource?.slotDurationMinutes || resource?.stepMinutes || resource?.step_minutes || 60"
        :bookings="bookings"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import AppTimeline from '../components/ui/AppTimeline.vue';
import { useCatalogStore } from '../stores/catalog';
import { apiGet } from '../api/http';

const catalog = useCatalogStore();
const bookings = ref([]);
const resource = computed(() => catalog.cards[0] ?? null);

onMounted(async () => {
  if (!catalog.resources.length) await catalog.load();
  if (!resource.value?.id) return;
  const value = await apiGet('/slots', { resource_id: resource.value.id });
  bookings.value = Array.isArray(value) ? value : [];
});
</script>

<style scoped>
.view-page {
  padding: 24px;
  max-width: 1080px;
}

.view-page__header {
  margin-bottom: 24px;
}

.view-page__timeline {
  max-width: 480px;
}
</style>
