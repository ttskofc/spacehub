<template>
  <section class="resource-media">
    <div class="resource-media__main">
      <img v-if="activeImage" :src="activeImage" :alt="resource.title" />
      <div v-else class="resource-media__empty">Изображение ресурса пока не добавлено</div>
      <AppBadge class="resource-media__angle" variant="success" :dot="false" text="Основной ракурс" />
      <span v-if="resource.telemetry" class="resource-media__telemetry">{{ resource.telemetry }}</span>
    </div>

    <div v-if="images.length > 1" class="resource-media__thumbs" aria-label="Фотографии ресурса">
      <button
        v-for="(image, index) in images"
        :key="image"
        type="button"
        class="resource-media__thumb"
        :class="{ 'resource-media__thumb--active': index === activeIndex }"
        :aria-label="`Открыть изображение ${index + 1}`"
        @click="activeIndex = index"
      >
        <img :src="image" :alt="`${resource.title}, изображение ${index + 1}`" />
      </button>
    </div>

    <AppButton v-if="resource.tourUrl" variant="soft" size="sm" @click="emit('tour', resource.tourUrl)">
      Виртуальный тур
    </AppButton>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppBadge from '../ui/AppBadge.vue';
import AppButton from '../ui/AppButton.vue';

const props = defineProps({ resource: { type: Object, required: true } });
const emit = defineEmits(['tour']);
const activeIndex = ref(0);
const images = computed(() => [props.resource.imageUrl, ...(props.resource.gallery ?? []).map((image) => typeof image === 'string' ? image : image.url)].filter(Boolean));
const activeImage = computed(() => images.value[activeIndex.value] ?? '');
</script>

<style scoped>
.resource-media { display: flex; flex-direction: column; gap: 12px; }
.resource-media__main { position: relative; min-height: 360px; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface-subtle); }
.resource-media__main img { width: 100%; height: 360px; display: block; object-fit: cover; }
.resource-media__empty { display: grid; place-items: center; min-height: 360px; padding: 24px; color: var(--color-text-muted); text-align: center; }
.resource-media__angle, .resource-media__telemetry { position: absolute; top: 16px; }
.resource-media__angle { left: 16px; }
.resource-media__telemetry { right: 16px; padding: 6px 10px; border-radius: var(--radius-full); background: rgba(45, 21, 29, .78); color: #fff; font-size: 12px; }
.resource-media__thumbs { display: flex; gap: 8px; overflow-x: auto; }
.resource-media__thumb { width: 72px; height: 56px; padding: 0; overflow: hidden; border: 2px solid transparent; border-radius: var(--radius-sm); background: var(--color-surface-subtle); cursor: pointer; }
.resource-media__thumb--active { border-color: var(--color-primary); }
.resource-media__thumb img { width: 100%; height: 100%; object-fit: cover; }
</style>
