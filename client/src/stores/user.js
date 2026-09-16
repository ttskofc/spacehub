import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const name = ref('Данил Романов');
  const role = ref('Product Designer');
  const avatarUrl = ref('');

  return { name, role, avatarUrl };
});