<template>
  <div v-if="resource" class="resource-detail">
    <header class="resource-detail__subheader">
      <div class="resource-detail__crumbs">
        <AppBreadcrumbs :items="breadcrumbs" />
        <AppBadge :variant="availabilityVariant" :text="availabilityText" />
      </div>
      <div class="resource-detail__actions">
        <AppButton variant="ghost" size="icon" :aria-label="resource.isBookmarked ? 'Убрать из закладок' : 'Добавить в закладки'" @click="catalog.toggleBookmark(resource.id)">
          <IconBookmark :size="18" />
        </AppButton>
        <AppButton variant="secondary" size="sm" @click="shareResource"><IconShare2 :size="16" /> Поделиться</AppButton>
        <AppButton variant="ghost" size="icon" aria-label="Справка" @click="showHelp = !showHelp"><IconHelpCircle :size="18" /></AppButton>
      </div>
    </header>

    <p v-if="shareMessage" class="resource-detail__notice" role="status">{{ shareMessage }}</p>
    <p v-if="showHelp" class="resource-detail__help">Выберите свободный часовой слот, заполните тему встречи и подтвердите заявку.</p>

    <main class="resource-detail__grid">
      <section class="resource-detail__left">
        <ResourceMediaGallery :resource="resource" @tour="openTour" />
        <ResourceInfoPanel :resource="resource" />
        <section class="resource-detail__analytics">
          <div class="resource-detail__analytics-chart" :style="{ '--usage': `${usage}%` }"><span>{{ usage }}%</span></div>
          <div><h2>Загрузка ресурса</h2><p>{{ analyticsText }}</p><button type="button" @click="showHelp = true">Подробнее об аналитике</button></div>
        </section>
      </section>
      <section class="resource-detail__right">
        <ResourceScheduleCard :bookings="bookings" :slot-duration="resource.slotDurationMinutes || resource.stepMinutes || resource.step_minutes || 60" :selected-slot="selectedSlot" :loading="slotsLoading" :error="slotsError" @select="selectedSlot = $event" @date-change="loadBookings" />
        <ResourceBookingForm :slot="selectedSlot" :user="user" :loading="bookingLoading" @submit="submitBooking" @preview="previewBooking" />
      </section>
    </main>
  </div>

  <div v-else-if="catalog.loading" class="resource-detail__state">Загрузка ресурса...</div>
  <div v-else class="resource-detail__state"><h1>Ресурс не найден</h1><RouterLink to="/">Вернуться в каталог</RouterLink></div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useCatalogStore } from '../stores/catalog';
import { useUserStore } from '../stores/user';
import { apiGet, apiPost } from '../api/http';
import AppBadge from '../components/ui/AppBadge.vue';
import AppBreadcrumbs from '../components/ui/AppBreadcrumbs.vue';
import AppButton from '../components/ui/AppButton.vue';
import IconBookmark from '../components/ui/Icons/Calendar & Booking Actions/IconBookmark.vue';
import IconHelpCircle from '../components/ui/Icons/Calendar & Booking Actions/IconHelpCircle.vue';
import IconShare2 from '../components/ui/Icons/Calendar & Booking Actions/IconShare2.vue';
import ResourceBookingForm from '../components/resource/ResourceBookingForm.vue';
import ResourceInfoPanel from '../components/resource/ResourceInfoPanel.vue';
import ResourceMediaGallery from '../components/resource/ResourceMediaGallery.vue';
import ResourceScheduleCard from '../components/resource/ResourceScheduleCard.vue';

const route = useRoute();
const catalog = useCatalogStore();
const userStore = useUserStore();
const user = computed(() => ({ name: userStore.name, email: userStore.email, role: userStore.role, avatarUrl: userStore.avatarUrl }));
const resource = computed(() => catalog.getResource(String(route.params.id)));
const selectedSlot = ref(null);
const showHelp = ref(false);
const shareMessage = ref('');
const bookingLoading = ref(false);
const slotsLoading = ref(false);
const bookings = ref([]);
const slotsError = ref('');
const usage = computed(() => Number.isFinite(resource.value?.usagePercent) ? resource.value.usagePercent : 0);
const analyticsText = computed(() => resource.value?.peakHour ? `Пиковое время: ${resource.value.peakHour}.` : 'Аналитика загрузки пока не передана источником данных.');
const availabilityText = computed(() => selectedSlot.value ? 'Слот доступен' : 'Доступно для бронирования');
const availabilityVariant = computed(() => selectedSlot.value ? 'success' : 'success');
const breadcrumbs = computed(() => [{ label: 'Главная', to: '/' }, { label: 'Каталог ресурсов', to: '/' }, { label: resource.value?.title || 'Ресурс' }]);

onMounted(async () => {
  if (!catalog.resources.length) await catalog.load();
  await loadBookings(new Date());
});

async function loadBookings(date) {
  if (!resource.value?.id) return;
  slotsLoading.value = true;
  slotsError.value = '';
  selectedSlot.value = null;
  try {
    const value = await apiGet('/slots', { resource_id: resource.value.id, date: toDateValue(date) });
    bookings.value = Array.isArray(value) ? value : [];
  } catch (error) {
    bookings.value = [];
    slotsError.value = error?.message || 'Не удалось загрузить расписание';
  } finally {
    slotsLoading.value = false;
  }
}

function toDateValue(date) {
  const value = date instanceof Date ? date : new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

async function shareResource() {
  const url = window.location.href;
  try { await navigator.clipboard.writeText(url); shareMessage.value = 'Ссылка скопирована'; } catch { shareMessage.value = url; }
  window.setTimeout(() => { shareMessage.value = ''; }, 2500);
}
function openTour(url) { window.open(url, '_blank', 'noopener,noreferrer'); }
async function submitBooking(form) {
  if (!selectedSlot.value || bookingLoading.value) return;
  bookingLoading.value = true;
  const bookingDate = selectedSlot.value.date;
  try {
    const result = await apiPost('/bookings', {
      resource_id: resource.value.id,
      start_time: `${selectedSlot.value.date}T${selectedSlot.value.start}:00`,
      end_time: `${selectedSlot.value.date}T${selectedSlot.value.end}:00`,
      title: form.title,
      attendees: form.attendees,
      services: form.services,
      comment: form.comment,
    });
    shareMessage.value = result?.booking_id ? `Бронирование создано: ${result.booking_id}` : 'Бронирование создано';
    selectedSlot.value = null;
    await loadBookings(bookingDate);
  } catch (error) {
    shareMessage.value = error?.detail || error?.message || 'Не удалось создать бронирование';
  } finally {
    bookingLoading.value = false;
  }
}
function previewBooking(form) { shareMessage.value = `Предпросмотр: ${form.title || 'без названия'} · ${selectedSlot.value.start}–${selectedSlot.value.end}`; }
</script>

<style scoped>
.resource-detail { width: 100%; max-width: 1440px; padding: 24px; box-sizing: border-box; }.resource-detail__subheader { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-bottom: 18px; border-bottom: 1px solid var(--color-border); }.resource-detail__crumbs, .resource-detail__actions { display: flex; align-items: center; gap: 12px; }.resource-detail__actions { flex-shrink: 0; }.resource-detail__notice, .resource-detail__help { margin: 14px 0 0; padding: 10px 14px; border-radius: var(--radius-md); background: var(--color-success-bg); color: var(--color-success-text); font-size: 13px; }.resource-detail__help { background: var(--color-primary-light); color: var(--color-text-secondary); }.resource-detail__grid { display: grid; grid-template-columns: minmax(0, .82fr) minmax(420px, 1.18fr); gap: 28px; margin-top: 24px; }.resource-detail__left, .resource-detail__right { display: grid; align-content: start; gap: 24px; }.resource-detail__analytics { display: flex; align-items: center; gap: 18px; padding: 18px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); background: var(--color-surface); }.resource-detail__analytics h2 { margin: 0 0 6px; font-size: 16px; color: var(--color-text-main); }.resource-detail__analytics p { margin: 0 0 8px; color: var(--color-text-secondary); font-size: 13px; line-height: 1.5; }.resource-detail__analytics button { padding: 0; border: 0; background: none; color: var(--color-primary); font-size: 13px; font-weight: 600; cursor: pointer; }.resource-detail__analytics-chart { position: relative; display: grid; place-items: center; width: 82px; height: 82px; flex-shrink: 0; border-radius: 50%; background: conic-gradient(var(--color-primary) calc(var(--usage) * 1%), var(--color-primary-light) 0); }.resource-detail__analytics-chart::before { content: ''; position: absolute; width: 62px; height: 62px; border-radius: 50%; background: var(--color-surface); }.resource-detail__analytics-chart span { position: relative; z-index: 1; color: var(--color-primary); font-weight: 700; font-size: 14px; }.resource-detail__state { display: grid; place-items: center; min-height: 50vh; gap: 12px; color: var(--color-text-secondary); }.resource-detail__state h1 { color: var(--color-text-main); }.resource-detail__state a { color: var(--color-primary); }
@media (max-width: 900px) { .resource-detail__grid { grid-template-columns: 1fr; }.resource-detail__subheader { align-items: flex-start; flex-direction: column; }.resource-detail__actions { width: 100%; justify-content: flex-end; } }
@media (max-width: 560px) { .resource-detail { padding: 16px; }.resource-detail__crumbs { align-items: flex-start; flex-direction: column; }.resource-detail__actions { justify-content: flex-start; flex-wrap: wrap; }.resource-detail__grid { gap: 20px; }.resource-media__main { min-height: 260px; } }
</style>
