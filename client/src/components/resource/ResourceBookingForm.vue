<template>
  <section class="booking-form">
    <div class="booking-form__head">
      <div>
        <p class="booking-form__eyebrow">Бронирование</p>
        <h2>Данные встречи</h2>
      </div>
      <AppBadge
        v-if="slot"
        variant="success"
        :dot="false"
        :text="`${slot.start}–${slot.end}`"
      />
    </div>
    <div v-if="!slot" class="booking-form__empty">
      Выберите свободный слот в расписании.
    </div>
    <form v-else @submit.prevent="emit('submit', form)">
      <label class="booking-form__field"
        ><span class="booking-form__label">Тема встречи</span
        ><AppInput
          v-model="form.title"
          placeholder="Например, планирование спринта"
          required
      /></label>
      <div class="booking-form__row">
        <AppSelect
          v-model="form.attendees"
          label="Участники"
          :options="attendeeOptions"
        />
        <div class="booking-form__organizer">
          <span>Организатор</span>
          <div>
            <AppAvatar
              :src="user.avatarUrl"
              :name="user.name"
              size="sm"
              status="success"
            /><strong>{{ user.name }}</strong>
          </div>
        </div>
      </div>
      <div class="booking-form__services">
        <span class="booking-form__label">Дополнительные услуги</span
        ><AppCheckbox
          v-for="service in services"
          :key="service.value"
          v-model="form.services"
          :value="service.value"
          :label="service.label"
          :description="service.description"
          variant="card"
        />
      </div>
      <label class="booking-form__field"
        ><span class="booking-form__label">Комментарий сервису или охране</span
        ><AppTextarea
          v-model="form.comment"
          placeholder="Дополнительные пожелания"
          :rows="3"
      /></label>
      <div class="booking-form__actions">
        <AppButton
          type="button"
          variant="secondary"
          :disabled="!slot || loading"
          @click="emit('preview', form)"
          >Предпросмотр</AppButton
        ><AppButton type="submit" block :disabled="!valid" :loading="loading"
          >Подтвердить бронирование</AppButton
        >
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, reactive } from "vue";
import AppAvatar from "../ui/AppAvatar.vue";
import AppBadge from "../ui/AppBadge.vue";
import AppButton from "../ui/AppButton.vue";
import AppCheckbox from "../ui/AppCheckbox.vue";
import AppInput from "../ui/AppInput.vue";
import AppSelect from "../ui/AppSelect.vue";
import AppTextarea from "../ui/AppTextarea.vue";

const props = defineProps({
  resource: { type: Object, default: null },
  slot: { type: Object, default: null },
  user: { type: Object, required: true },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["submit", "preview"]);
const form = reactive({ title: "", attendees: 1, services: [], comment: "" });
const attendeeOptions = [1, 2, 3, 4, 5, 6, 8].map((value) => ({
  value,
  label: `${value} ${value === 1 ? "участник" : "участника"}`,
}));
const servicesByCategory = {
  переговорные: [
    "Набор маркеров, бумаги для флипчарта и стикеров",
    "Кофе-брейк (вода, капсульный кофе, чай, печенье)",
    "Дополнительный спикерфон для конференц-связи",
  ],
  рабочие: [
    "Эргономичный набор (подставка под ноутбук, подставка для ног, ортопедическая подушка на кресло)",
    "Периферия с шумоподавлением (полноразмерные беспроводные наушники с ANC)",
  ],
  конференц: [
    "Сопровождение IT-специалиста / звукорежиссера",
    "Организация кейтеринга / обеда для участников",
    "Настройка онлайн-трансляции и запись события",
  ],
  студии: [
    "Услуги видеооператора или звукорежиссера",
    "Настройка и управление телесуфлером",
    "Срочный экспорт и выгрузка исходников в облако",
  ],
  оборудование: [
    "Доставка и установка на конкретное рабочее место",
    "Комплект запасных аккумуляторов / Power Bank",
    "Предварительная установка необходимого ПО / настройка",
  ],
};
const services = computed(() => {
  const category = String(props.resource?.category ?? "").toLowerCase();
  const key = Object.keys(servicesByCategory).find((item) => category.includes(item));
  return (servicesByCategory[key] ?? []).map((label, index) => ({
    value: `${key}-${index}`,
    label,
  }));
});
const valid = computed(() =>
  Boolean(props.slot && form.title.trim() && form.attendees && !props.loading),
);
</script>

<style scoped>
.booking-form {
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}
.booking-form__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.booking-form__eyebrow {
  margin: 0 0 4px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}
h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 22px;
  color: var(--color-text-main);
}
.booking-form__empty {
  padding: 20px;
  border-radius: var(--radius-md);
  background: var(--color-surface-subtle);
  color: var(--color-text-muted);
  text-align: center;
}
.booking-form form {
  display: grid;
  gap: 16px;
}
.booking-form__field {
  display: block;
}
.booking-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.booking-form__organizer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}
.booking-form__organizer div {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 46px;
  color: var(--color-text-main);
}
.booking-form__label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-main);
}
.booking-form__services {
  display: grid;
  gap: 8px;
}
.booking-form__services .booking-form__label {
  margin-bottom: 0;
}
.booking-form__actions {
  display: flex;
  gap: 10px;
}
.booking-form__actions > * {
  flex: 1;
}
@media (max-width: 560px) {
  .booking-form__row {
    grid-template-columns: 1fr;
  }
  .booking-form__actions {
    flex-direction: column;
  }
}
</style>
