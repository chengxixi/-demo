import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNavStore = defineStore('nav', () => {
  const collapsed = ref(false);
  const activePage = ref('dashboard');

  const toggle = () => {
    collapsed.value = !collapsed.value;
  };

  const setActive = (page: string) => {
    activePage.value = page;
  };

  return { collapsed, activePage, toggle, setActive };
});
