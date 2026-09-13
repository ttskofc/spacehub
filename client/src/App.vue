<template>
  <div id="app">
    <h1>SpaceHub</h1>
    <p>Сервис бронирования ресурсов</p>

     <div class="btnss">
      <AppButton variant="primary" size="sm">
        Primary кнопка
      </AppButton>
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
      <AppBage variant="success" text="Доступно сейчас"></AppBage>
      <AppBage variant="warning" text="Свободен с 18:30"></AppBage>
      <AppBage variant="danger" text="Занято до 13:50"></AppBage>
    </div>
  </div>
</template>

<script setup>
import AppBage from './components/ui/AppBage.vue';
import AppButton from './components/ui/AppButton.vue';
import IconArrowRight from './components/ui/Icons/Calendar & Booking Actions/IconArrowRight.vue';
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

.bagesss{
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}
</style>
