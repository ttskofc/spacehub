import { ref } from "vue";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  const name = ref("Данил Тоцкий");
  const email = ref("ttsk@spacehub.corp");
  const role = ref("Product Designer");
  const avatarUrl = ref("");

  return { name, email, role, avatarUrl };
});
