import { createRouter, createWebHistory } from 'vue-router';
import CatalogView from '../views/CatalogView.vue';
import BookingsView from '../views/BookingsView.vue';
import CalendarView from '../views/CalendarView.vue';

const routes = [
  {
    path: '/',
    name: 'catalog',
    component: CatalogView,
  },
  {
    path: '/bookings',
    name: 'bookings',
    component: BookingsView,
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: CalendarView,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;