import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import CashPage from '@/pages/CashPage.vue'
import CategoriesPage from '@/pages/CategoriesPage.vue'
import ContactPage from '@/pages/ContactPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import DebtsPage from '@/pages/DebtsPage.vue'
import EmployeesPage from '@/pages/EmployeesPage.vue'
import HistoryPage from '@/pages/HistoryPage.vue'
import HomePage from '@/pages/HomePage.vue'
import InventoryPage from '@/pages/InventoryPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import ProductsPage from '@/pages/ProductsPage.vue'
import RenewPage from '@/pages/RenewPage.vue'
import SalesPage from '@/pages/SalesPage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import StockEntryPage from '@/pages/StockEntryPage.vue'
import UpgradePage from '@/pages/UpgradePage.vue'
import { isAuthenticated } from '@/services/auth'
import {
  isPro,
  isSubscriptionValid,
  loadSubscription,
  subscription,
} from '@/services/subscriptionState'
import { currentUser, loadCurrentUser } from '@/services/userState'
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        component: HomePage,
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardPage,
      },
      {
        path: 'products',
        name: 'products',
        component: ProductsPage,
      },
      {
        path: 'sales',
        name: 'sales',
        component: SalesPage,
      },
      {
        path: 'history',
        name: 'history',
        component: HistoryPage,
      },
      {
        path: 'stock-entry',
        name: 'stock-entry',
        component: StockEntryPage,
        meta: {
          requiresAuth: true,
          requiresPro: true,
        },
      },
      {
        path: 'upgrade',
        name: 'upgrade',
        component: UpgradePage,
      },
      {
        path: 'renew',
        name: 'renew',
        component: RenewPage,
      },
      {
        path: 'categories',
        name: 'categories',
        component: CategoriesPage,
      },
      {
        path: 'debts',
        name: 'debts',
        component: DebtsPage,
      },
      {
        path: 'employees',
        name: 'employees',
        component: EmployeesPage,
        meta: {
          requiresOwner: true,
        },
      },
      {
        path: '/contact',
        name: 'contact',
        component: ContactPage,
      },
      {
        path: 'cash',
        name: 'cash',
        component: CashPage,
      },
      {
        path: 'inventory',
        name: 'inventory',
        component: InventoryPage,
        meta: {
          requiresPro: true,
          requiresManagerOrOwner: true,
        },
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsPage,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Garde de navigation globale
router.beforeEach(async (to, from, next) => {
  const loggedIn = isAuthenticated()

  if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
    next('/login')
    return
  }

  if (to.path === '/login' && loggedIn) {
    next('/dashboard')
    return
  }
  if (to.matched.some(record => record.meta.requiresOwner)) {
    if (!currentUser.value) {
      await loadCurrentUser()
    }

    if (currentUser.value?.role !== 'owner') {
      next('/dashboard')
      return
    }
  }

  if (loggedIn && !subscription.value) {
    await loadSubscription()
  }

  const freePages = ['/renew', '/upgrade']

  if (
    loggedIn
    && !isSubscriptionValid.value
    && !freePages.includes(to.path)
  ) {
    next('/renew')
    return
  }

  if (to.matched.some(record => record.meta.requiresPro) && !isPro.value) {
    next('/upgrade')
    return
  }

  next()
})
export default router
