<template>
  <div id="app">
    <h1>SpaceHub</h1>
    <p>Сервис бронирования ресурсов</p>

    <h2>Кнопки</h2>
    <div class="btnss">
      <AppButton variant="primary" size="sm"> Primary кнопка </AppButton>
      <AppButton size="icon" variant="secondary">✕</AppButton>
      <AppButton variant="soft">Нажми</AppButton>
      <AppButton variant="ghost">
        Нажми на меня
        <IconArrowRight></IconArrowRight>
      </AppButton>
      <AppButton :loading="true">Отправка</AppButton>
    </div>

    <h2>Бейджи</h2>
    <div class="bagesss">
      <AppBadge :dot="false" variant="success" text="Доступно сейчас" />
      <AppBadge variant="warning" text="Свободен с 18:30" dot />
      <AppBadge variant="danger" text="Занято до 13:50" />
    </div>

    <h2>Поля ввода</h2>
    <div class="inputsss">
      <SearchInput placeholder="Поиск переговорных, рабочих мест..." />
      <EmailInput placeholder="d.romanov@spacehub.corp" autocomplete="email" />
      <PasswordInput placeholder="Пароль" size="md" />
      <AppInput placeholder="Имя" hint="Имя и фамилия" />
      <AppInput placeholder="Поле с ошибкой" error="Обязательное поле" />
    </div>

    <h2>Textarea</h2>
    <div class="inputsss">
      <AppTextarea placeholder="Оставьте комментарий к брони..." :rows="4" />
      <AppTextarea
        placeholder="Сообщение"
        error="Не более 800 символов"
        maxlength="800"
        :rows="4"
      />
    </div>

    <h2>Чекбоксы</h2>
    <div class="inputsss">
      <AppCheckbox
        v-model="agree"
        label="Согласен с условиями сервиса"
        description="Нужно для бронирования переговорок"
      />
      <AppCheckbox
        v-model="amenities"
        value="coffee"
        label="Кофе в переговорке"
        badge="Новинка"
      />
      <AppCheckbox
        variant="matcha"
        label="Matcha вариант"
        :model-value="true"
        description="Для аккуратных галочек"
      />
      <AppCheckbox label="Поле с ошибкой" error="Обязательное поле" size="sm" />
      <AppCheckbox label="Полувыбранное состояние" indeterminate />
      <AppCheckbox label="Отключённый чекбокс" disabled />
      <AppCheckbox
        variant="card"
        :model-value="true"
        label="Бронировать заранее"
        description="Можно оформить до 30 дней вперёд"
        badge="Рекомендуем"
      />
    </div>

    <h2>Чипсы и фильтры</h2>
    <div class="chipsss">
      <AppChip
        v-for="c in categories"
        :key="c.id"
        :label="c.label"
        :count="c.count"
        :active="selectedCategories.includes(c.id)"
        @click="toggleCategory(c.id)"
      />
      <AppChip label="Кладовые" :count="0" disabled />
    </div>

<h3>Активные фильтры</h3>
    <div class="chipsss">
      <AppChip
        v-for="f in activeFilters"
        :key="f.id"
        :label="f.label"
        :variant="f.variant"
        :icon="f.icon"
        :size="f.size"
        removable
        @remove="removeFilter(f.id)"
      />
    </div>

    <h2>Селекторы</h2>
    <div class="selects">
      <AppSelect
        v-model="sortValue"
        label="Сортировка"
        :options="sortOptions"
        placeholder="Выберите сортировку"
      />
      <AppSelect
        v-model="capacityValue"
        label="Где свободно"
        variant="surface"
        :icon="IconSliders"
        :options="slotOptions"
        clearable
        searchable
      />
      <AppSelect
        v-model="paginationValue"
        size="sm"
        variant="clean"
        :options="paginationOptions"
      />
      <AppSelect
        v-model="roomValue"
        label="Временной слот"
        :options="bookingOptions"
        error="Обязательное поле"
      />
      <AppSelect v-model="disabledValue" :options="sortOptions" disabled />
    </div>

    <h2>Пагинация</h2>
    <div class="paginationss">
      <div class="pagination-card">
        <AppPagination
          v-model:page="catalogPage"
          v-model:pageSize="catalogPageSize"
          :total-items="catalogTotal"
          items-label=" ресурсов"
        />
      </div>
      <div class="pagination-card">
        <AppPagination
          v-model:page="tablePage"
          v-model:pageSize="tablePageSize"
          :total-items="120"
          size="lg"
          variant="clean"
          items-label=" строк"
        />
      </div>
    </div>

    <h2>Дневные таймлайны</h2>
    <div class="miniss">
      <AppTimeline
        workDayStart="10:00"
        workDayEnd="20:00"
        :slotDurationMinutes="60"
        :bookings="mockBookings"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppBadge from "./components/ui/AppBadge.vue";
import AppButton from "./components/ui/AppButton.vue";
import IconArrowRight from "./components/ui/Icons/Calendar & Booking Actions/IconArrowRight.vue";
import AppInput from "./components/ui/AppInput.vue";
import SearchInput from "./components/ui/SearchInput.vue";
import EmailInput from "./components/ui/EmailInput.vue";
import PasswordInput from "./components/ui/PasswordInput.vue";
import AppTextarea from "./components/ui/AppTextarea.vue";
import AppTimeline from "./components/ui/AppTimeline.vue";
import AppCheckbox from "./components/ui/AppCheckbox.vue";
import AppChip from "./components/ui/AppChip.vue";
import AppSelect from "./components/ui/AppSelect.vue";
import AppPagination from "./components/ui/AppPagination.vue";
import IconSliders from "./components/ui/Icons/Catalog Controls/IconSliders.vue";

const search = ref("");
const email = ref("");
const password = ref("");
const name = ref("");
const errVal = ref("");
const comment = ref("");
const errComment = ref("");
const agree = ref(true);
const amenities = ref(["coffee"]);

const selectedCategories = ref([]);
const categories = ref([
  { id: "all", label: "Все пространства", count: 48 },
  { id: "rooms", label: "Переговорные", count: 18 },
  { id: "workplaces", label: "Рабочие места", count: 24 },
  { id: "halls", label: "Конференц-залы", count: 6 },
]);

function toggleCategory(id) {
  const list = selectedCategories.value;
  selectedCategories.value = list.includes(id)
    ? list.filter((x) => x !== id)
    : [...list, id];
}

const activeFilters = ref([
  { id: "floor-2", label: "Этаж 2" },
  { id: "4k-tv", label: "Оборудование: 4K TV" },
  { id: "from-10", label: "От 10 чел." },
  { id: "available-now", label: "Свободно прямо сейчас", variant: "matcha" },
  { id: "my-params", label: "По моим параметрам", icon: IconSliders, size: "sm" },
]);

function removeFilter(id) {
  activeFilters.value = activeFilters.value.filter((f) => f.id !== id);
}

const sortOptions = [
  { label: "По популярности", value: "popular" },
  { label: "По вместимости", value: "capacity" },
  { label: "Сначала свободные", value: "free", description: "Доступные сейчас и позже", badge: "12" },
  { label: "По цене — дешевле", value: "cheap" },
];
const sortValue = ref("capacity");

const slotOptions = [
  { label: "Переговорная «Заря»", value: "zarya", description: "2 этаж, до 6 чел." },
  { label: "Рабочее место у окна", value: "window", description: "3 этаж, до 1 чел." },
  { label: "Лаунж-зона", value: "lounge", disabled: true, description: "Закрыто на клининг" },
];
const capacityValue = ref("zarya");

const paginationOptions = [6, 12, 24];
const paginationValue = ref(12);

const bookingOptions = [
  { label: "10:00 — 11:00", value: "10-11", matcha: true, badge: "Доступно" },
  { label: "11:30 — 12:30", value: "11-12", matcha: true, badge: "Доступно" },
  { label: "13:00 — 14:00", value: "13-14", matcha: true, badge: "Доступно" },
  { label: "14:30 — 15:30", value: "14-15", disabled: true, badge: "Занято" },
  { label: "16:00 — 17:00", value: "16-17", matcha: true, badge: "Доступно" },
];
const roomValue = ref("13-14");

const disabledValue = ref(null);

const catalogPage = ref(1);
const catalogPageSize = ref(6);
const catalogTotal = ref(53);

const tablePage = ref(6);
const tablePageSize = ref(10);

const mockBookings = ref([
  {
    start: "14:00",
    end: "16:00",
    title: "Идет звукозапись",
  },
  {
    start: "16:00",
    end: "19:00",
    title: "Уборка и проветривание",
    status: "maintenance",
  },
]);
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
}

body {
  background-color: #f8fafc;
  color: #0f172a;
  padding: 24px;
}

.btnss {
  display: flex;
  gap: 50px;
  align-items: center;
  margin-top: 16px;
}

.bagesss,
.inputsss {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  max-width: 360px;
}

.chipsss {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 16px;
  max-width: 720px;
}

.miniss {
  width: 400px;
}

.selects {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
  max-width: 380px;
  margin-top: 16px;
}

.paginationss {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1000px;
  margin-top: 16px;
}

.pagination-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
</style>
