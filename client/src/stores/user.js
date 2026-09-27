import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const name = ref('Данил Романов');
  const email = ref('d.romanov@spacehub.corp');
  const role = ref('Product Designer');
  const avatarUrl = ref('');

  return { name, email, role, avatarUrl };
});