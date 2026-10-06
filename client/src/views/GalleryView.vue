<template>
  <div class="gallery-page">
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
    <div class="stack">
      <AppBadge :dot="false" variant="success" text="Доступно сейчас" />
      <AppBadge variant="warning" text="Свободен с 18:30" dot />
      <AppBadge variant="danger" text="Занято до 13:50" />
    </div>

    <h2>Поля ввода</h2>
    <div class="stack">
      <SearchInput placeholder="Поиск переговорных, рабочих мест..." />
      <EmailInput placeholder="d.romanov@spacehub.corp" autocomplete="email" />
      <PasswordInput placeholder="Пароль" size="md" />
      <AppInput placeholder="Имя" hint="Имя и фамилия" />
      <AppInput placeholder="Поле с ошибкой" error="Обязательное поле" />
    </div>

    <h2>Textarea</h2>
    <div class="stack">
      <AppTextarea placeholder="Оставьте комментарий к брони..." :rows="4" />
      <AppTextarea
        placeholder="Сообщение"
        error="Не более 800 символов"
        maxlength="800"
        :rows="4"
      />
    </div>

    <h2>Чекбоксы</h2>
    <div class="stack">
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

    <h2>Аватары</h2>
    <div class="avatars">
      <AppAvatar name="Данил Романов" size="sm" />
      <AppAvatar name="Данил Романов" size="md" status="success" />
      <AppAvatar name="Мария Соколова" size="lg" variant="neutral" status="warning" />
      <AppAvatar name="Иван Петров" size="xl" status="danger" />
      <AppAvatar src="https://broken.invalid/avatar.png" name="Анна Крылова" size="md" />
      <AppAvatar size="md" />
    </div>

    <h2>Выпадающее меню</h2>
    <div class="dropdowns">
      <AppDropdown align="left" width="200px" variant="soft">
        <template #trigger>Меню слева</template>
        <button type="button" class="gallery-item">Первый пункт</button>
        <button type="button" class="gallery-item">Второй пункт</button>
      </AppDropdown>

      <AppDropdown align="right" width="200px" :close-on-click="false">
        <template #trigger>
          <AppAvatar name="Данил Романов" size="md" status="success" />
        </template>
        <button type="button" class="gallery-item">Профиль</button>
        <button type="button" class="gallery-item">Настройки</button>
      </AppDropdown>
    </div>

    <h2>Пагинация</h2>
    <div class="paginationss">
      <div class="pagination-card">
        <AppPagination
          v-model:page="tablePage"
          v-model:page-size="tablePageSize"
          :total-items="120"
          size="lg"
          variant="clean"
          items-label=" строк"
        />
      </div>
    </div>

    <h2>Компоненты навигации и карточка пользователя</h2>
    <AppBrandLogo />
    <div class="stack">
      <AppUserCard
        name="Данил Романов"
        role="Product Designer"
        @menu="onUserMenu"
      />
    </div>
    <div class="navss">
      <NavItem to="/" label="Пространства" :icon="IconGrid" :count="4" />
      <NavItem
        to="/bookings"
        label="Бронирования"
        :icon="IconCalendarMonth"
        badge-variant="warning"
        :count="2"
      />
      <NavItem to="/calendar" label="Календарь" :icon="IconCalendarCheck" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppBadge from "../components/ui/AppBadge.vue";
import AppButton from "../components/ui/AppButton.vue";
import AppBrandLogo from "../components/layout/AppBrandLogo.vue";
import AppUserCard from "../components/layout/AppUserCard.vue";
import NavItem from "../components/layout/NavItem.vue";
import IconGrid from "../components/ui/Icons/Shell&Navigation/IconGrid.vue";
import IconCalendarMonth from "../components/ui/Icons/Shell&Navigation/IconCalendarMonth.vue";
import IconCalendarCheck from "../components/ui/Icons/Shell&Navigation/IconCalendarCheck.vue";
import IconArrowRight from "../components/ui/Icons/Calendar & Booking Actions/IconArrowRight.vue";
import AppInput from "../components/ui/AppInput.vue";
import SearchInput from "../components/ui/SearchInput.vue";
import EmailInput from "../components/ui/EmailInput.vue";
import PasswordInput from "../components/ui/PasswordInput.vue";
import AppTextarea from "../components/ui/AppTextarea.vue";
import AppCheckbox from "../components/ui/AppCheckbox.vue";
import AppChip from "../components/ui/AppChip.vue";
import AppSelect from "../components/ui/AppSelect.vue";
import AppPagination from "../components/ui/AppPagination.vue";
import AppAvatar from "../components/ui/AppAvatar.vue";
import AppDropdown from "../components/ui/AppDropdown.vue";
import IconSliders from "../components/ui/Icons/Catalog Controls/IconSliders.vue";

const agree = ref(true);
const amenities = ref(["coffee"]);

const selectedCategories = ref([]);
const categories = ref([
  { id: "all", label: "Все пространства", count: 48 },
  { id: "rooms", label: "Переговорные", count: 18 },
  { id: "workplaces", label: "Рабочие места", count: 24 },
  { id: "halls", label: "Конференц-залы", count: 6 },
]);

function onUserMenu() {
  // демо: здесь можно открыть меню пользователя
}

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
  {
    id: "my-params",
    label: "По моим параметрам",
    icon: IconSliders,
    size: "sm",
  },
]);

function removeFilter(id) {
  activeFilters.value = activeFilters.value.filter((f) => f.id !== id);
}

const sortOptions = [
  { label: "По популярности", value: "popular" },
  { label: "По вместимости", value: "capacity" },
  {
    label: "Сначала свободные",
    value: "free",
    description: "Доступные сейчас и позже",
    badge: "12",
  },
  { label: "По цене — дешевле", value: "cheap" },
];
const sortValue = ref("capacity");

const slotOptions = [
  {
    label: "Переговорная «Заря»",
    value: "zarya",
    description: "2 этаж, до 6 чел.",
  },
  {
    label: "Рабочее место у окна",
    value: "window",
    description: "3 этаж, до 1 чел.",
  },
  {
    label: "Лаунж-зона",
    value: "lounge",
    disabled: true,
    description: "Закрыто на клининг",
  },
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

const tablePage = ref(6);
const tablePageSize = ref(10);
</script>

<style scoped>
.gallery-page {
  padding: 24px;
  max-width: 1080px;
}

.gallery-page h2 {
  margin-top: 32px;
  margin-bottom: 12px;
}

.gallery-page h3 {
  margin: 20px 0 0;
}

.btnss {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.stack {
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

.navss {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 260px;
  padding: 8px;
  margin-top: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.selects {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
  max-width: 380px;
  margin-top: 16px;
}

.avatars {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.dropdowns {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 16px;
}

.gallery-item {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font: inherit;
  font-size: 14px;
  text-align: left;
  color: var(--color-text-main);
  cursor: pointer;
}

.gallery-item:hover {
  background: var(--color-surface-subtle);
  color: var(--color-primary);
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
