<template>
  <div class="resource-info">
    <p class="resource-info__eyebrow">{{ resource.category }}<span v-if="resource.code"> · {{ resource.code }}</span></p>
    <h1>{{ resource.title }}</h1>
    <p class="resource-info__description">{{ resource.description || 'Описание ресурса пока не добавлено.' }}</p>

    <div class="resource-info__specs">
      <div v-for="spec in specs" :key="spec.label" class="resource-info__spec">
        <component :is="spec.icon" :size="18" color="var(--color-primary)" />
        <div><strong>{{ spec.value }}</strong><span>{{ spec.label }}</span></div>
      </div>
    </div>

    <section v-if="features.length" class="resource-info__section">
      <div class="resource-info__section-head"><h2>Оснащение и сервисы</h2><span>{{ features.length }}</span></div>
      <div class="resource-info__chips">
        <AppChip v-for="feature in features" :key="feature.label" :label="feature.label" :icon="featureIcon(feature.icon)" variant="matcha" size="sm" />
      </div>
    </section>

    <section v-if="rules.length" class="resource-info__section">
      <h2>Правила бронирования</h2>
      <ul class="resource-info__rules">
        <li v-for="rule in rules" :key="rule">{{ rule }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import AppChip from '../ui/AppChip.vue';
import IconArea from '../ui/Icons/Icon Features & Specs/IconArea.vue';
import IconUsers from '../ui/Icons/Icon Features & Specs/IconUsers.vue';
import IconMapPin from '../ui/Icons/Catalog Controls/IconMapPin.vue';
import IconDisplay4K from '../ui/Icons/Icon Features & Specs/IconDisplay4K.vue';
import IconWifi from '../ui/Icons/Icon Features & Specs/IconWifi.vue';
import IconSoundWaves from '../ui/Icons/Icon Features & Specs/IconSoundWaves.vue';

const props = defineProps({ resource: { type: Object, required: true } });
const specs = [
  { label: 'Вместимость', value: props.resource.capacity ? `до ${props.resource.capacity} чел.` : 'Не указана', icon: IconUsers },
  { label: 'Локация', value: props.resource.location || 'Не указана', icon: IconMapPin },
  { label: 'Площадь', value: props.resource.area ? `${props.resource.area} м²` : 'Не указана', icon: IconArea },
  { label: 'Формат', value: props.resource.category || 'Ресурс', icon: IconDisplay4K },
];
const features = props.resource.features ?? [];
const rules = props.resource.rules ?? [];
const icons = { wifi: IconWifi, acoustics: IconSoundWaves, audio: IconSoundWaves, screen: IconDisplay4K, display: IconDisplay4K };
function featureIcon(icon) { return icons[icon] ?? null; }
</script>

<style scoped>
.resource-info__eyebrow { margin: 0 0 8px; color: var(--color-primary); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.resource-info__description { margin: 14px 0 0; color: var(--color-text-secondary); line-height: 1.6; }
.resource-info__specs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 24px; }
.resource-info__spec { display: flex; gap: 10px; align-items: flex-start; padding: 14px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); background: var(--color-surface); }
.resource-info__spec div { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.resource-info__spec strong { color: var(--color-text-main); font-size: 14px; }
.resource-info__spec span { color: var(--color-text-muted); font-size: 12px; }
.resource-info__section { margin-top: 28px; }
.resource-info__section h2 { margin: 0 0 12px; font-size: 16px; color: var(--color-text-main); }
.resource-info__section-head { display: flex; align-items: center; justify-content: space-between; }
.resource-info__section-head span { color: var(--color-text-muted); font-size: 12px; }
.resource-info__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.resource-info__rules { display: grid; gap: 8px; margin: 0; padding-left: 18px; color: var(--color-text-secondary); font-size: 13px; line-height: 1.5; }
@media (max-width: 560px) { .resource-info__specs { grid-template-columns: 1fr; } }
</style>
