<template>
  <div class="view-page">
    <header class="view-page__header">
      <h1>Календарь</h1>
      <p>Расписание ресурсов на сегодня.</p>
    </header>

    <div class="view-page__timeline">
      <AppTimeline
        workDayStart="10:00"
        workDayEnd="20:00"
        :slot-duration-minutes="60"
        :bookings="bookings"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppTimeline from '../components/ui/AppTimeline.vue';

const bookings = ref([
  {
    start: '14:00',
    end: '16:00',
    title: 'Идет звукозапись',
  },
  {
    start: '16:00',
    end: '19:00',
    title: 'Уборка и проветривание',
    status: 'maintenance',
  },
]);
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