<template>
  <div id="app">
    <h1>SpaceHub</h1>
    <p>Сервис бронирования ресурсов</p>

     <div class="btnss">
    <AppButton variant="primary" size="md">
      <IconArrowRight size="24"">
      </IconArrowRight>
    </AppButton>

    <AppButton variant="icon>">
      <IconCube></IconCube>
    </AppButton>


    <AppButton variant="soft" size="sm">Выбрать слот</AppButton>

    <AppButton variant="ghost" size="bg">Подробнее →</AppButton>


    <AppButton isIcon variant="secondary">✕</AppButton>

    <AppButton :loading="true">Отправка</AppButton>
    </div>
  </div>
</template>

<script setup>
import AppButton from './components/ui/AppButton.vue';
import IconArrowRight from './components/ui/Icons/Calendar & Booking Actions/IconArrowRight.vue';
import IconCube from './components/ui/Icons/Calendar & Booking Actions/IconCube.vue'
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
</style>
