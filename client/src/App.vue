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
      <SearchInput v-model="search" placeholder="Поиск переговорных, рабочих мест..." />
      <EmailInput v-model="email" placeholder="d.romanov@spacehub.corp" autocomplete="email" />
      <PasswordInput v-model="password" placeholder="Пароль" size="md"/>
      <AppInput v-model="name" placeholder="Имя" hint="Имя и фамилия" />
      <AppInput v-model="errVal" placeholder="Поле с ошибкой" error="Обязательное поле" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppBadge from './components/ui/AppBadge.vue';
import AppButton from './components/ui/AppButton.vue';
import IconArrowRight from './components/ui/Icons/Calendar & Booking Actions/IconArrowRight.vue';
import AppInput from './components/ui/AppInput.vue';
import SearchInput from './components/ui/SearchInput.vue';
import EmailInput from './components/ui/EmailInput.vue';
import PasswordInput from './components/ui/PasswordInput.vue';

const search = ref('');
const email = ref('');
const password = ref('');
const name = ref('');
const errVal = ref('');
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
</style>