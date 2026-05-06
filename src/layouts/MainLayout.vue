<template>
  <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      app
      class="sidebar"
      :permanent="$vuetify.display.mdAndUp"
      :temporary="$vuetify.display.smAndDown"
      width="280"
    >
      <div class="pa-5">
        <!-- Logo / marque -->
        <div class="d-flex align-center mb-6">
          <v-img
            class="mx-auto mb-4"
            max-width="160"
            src="@/assets/logo.png"
          />

        </div>

        <v-divider class="mb-4" />

        <!-- Menu principal -->
        <v-list density="comfortable" nav>

          <!-- Dashboard -->
          <v-list-item
            prepend-icon="mdi-view-dashboard-outline"
            rounded="xl"
            title="Dashboard"
            to="/dashboard"
          />

          <!-- Vente -->
          <v-list-item
            prepend-icon="mdi-cart-outline"
            rounded="xl"
            title="Vente"
            to="/sales"
          />

          <!-- Historique -->
          <v-list-item
            prepend-icon="mdi-history"
            rounded="xl"
            title="Historique"
            to="/history"
          />

          <!-- Produits -->
          <v-list-item
            prepend-icon="mdi-package-variant-closed"
            rounded="xl"
            title="Produits"
            to="/products"
          />

          <!-- Dettes -->
          <v-list-item
            v-if="!isSeller"
            prepend-icon="mdi-account-cash-outline"
            rounded="xl"
            title="Dettes clients"
            to="/debts"
          />

          <!-- Stock -->
          <v-list-item
            v-if="isOwner || isManager"
            prepend-icon="mdi-warehouse"
            rounded="xl"
            title="Entrée stock"
            to="/stock-entry"
          />
          <v-list-item
            v-if="isOwner || isManager"
            prepend-icon="mdi-clipboard-list-outline"
            rounded="xl"
            title="Inventaire"
            to="/inventory"
          />
          <v-list-item
            prepend-icon="mdi-cash-register"
            rounded="xl"
            title="Caisse"
            to="/cash"
          />

          <!-- Catégories -->
          <v-list-item
            v-if="isOwner || isManager"
            prepend-icon="mdi-shape-outline"
            rounded="xl"
            title="Catégories"
            to="/categories"
          />

          <!-- Employés -->
          <v-list-item
            v-if="isOwner"
            prepend-icon="mdi-account-group-outline"
            rounded="xl"
            title="Employés"
            to="/employees"
          />

          <!-- Abonnement -->
          <v-list-item
            v-if="isOwner"
            prepend-icon="mdi-crown-outline"
            rounded="xl"
            title="Abonnement"
            to="/upgrade"
          />

        </v-list>
        <v-list-item
          prepend-icon="mdi-headset"
          rounded="xl"
          title="Support"
          to="/contact"
        />
        <v-list-item
          prepend-icon="mdi-cog-outline"
          title="Paramètres"
          to="/settings"
        />
      </div>

      <!-- Bas de sidebar -->
      <template #append>
        <div class="pa-5">
          <v-card class="pa-4 rounded-xl upgrade-card" elevation="0">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-2 font-weight-bold">
                Pack {{ subscription?.plan_name || 'Basic' }}
              </div>

              <v-chip
                :color="subscription?.is_valid ? 'success' : 'error'"
                size="small"
                variant="tonal"
              >
                {{ subscription?.is_valid ? 'Actif' : 'Expiré' }}
              </v-chip>
            </div>

            <div class="text-caption text-medium-emphasis mb-3">
              <span v-if="subscription?.has_expired">
                Renouvellement nécessaire
              </span>

              <span v-else-if="isPro">
                Fonctions avancées activées
              </span>

              <span v-else>
                Fonctions essentielles activées
              </span>
            </div>

            <v-btn
              v-if="subscription?.has_expired"
              block
              color="error"
              size="small"
              to="/renew"
              variant="flat"
            >
              Renouveler
            </v-btn>

            <v-btn
              v-else-if="!isPro"
              block
              color="primary"
              size="small"
              to="/upgrade"
              variant="flat"
            >
              Passer au Pro
            </v-btn>
          </v-card>

          <v-btn
            block
            class="mt-4"
            color="error"
            prepend-icon="mdi-logout"
            variant="outlined"
            @click="handleLogout"
          >
            Déconnexion
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Topbar -->
    <v-chip
      v-if="isSeller"
      color="warning"
      variant="tonal"
    >
      Mode vendeur
    </v-chip>
    <v-app-bar
      app
      class="topbar px-3"
      flat
      height="72"
    >
      <v-app-bar-nav-icon
        class="d-md-none mr-2"
        @click="drawer = !drawer"
      />

      <div class="topbar-title">
        <div class="text-subtitle-1 font-weight-bold">
          KetzPOS
        </div>

        <div class="text-caption text-medium-emphasis d-none d-sm-block">
          Gestion Boutique
        </div>
      </div>

      <v-spacer />

      <v-chip
        v-if="currentUser"
        class="mr-3 d-none d-md-flex"
        :color="roleColor(currentUser.role)"
        variant="tonal"
      >
        {{ roleLabel(currentUser.role) }}
      </v-chip>

      <v-btn
        class="d-none d-md-flex"
        color="error"
        prepend-icon="mdi-logout"
        variant="outlined"
        @click="handleLogout"
      >
        Déconnexion
      </v-btn>

      <v-btn
        class="d-md-none"
        color="primary"
        icon="mdi-account-circle-outline"
        variant="tonal"
      />
    </v-app-bar>

    <!-- Contenu -->
    <v-main class="main-bg">
      <v-container class="pa-6" fluid>
        <router-view />
      </v-container>

    </v-main>
  </v-app>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { logout } from '@/services/auth'
  import {
    hasExpired,
    isPro,
    isSubscriptionValid,
    loadSubscription,
    subscription,
    subscriptionStatusLabel,
  } from '@/services/subscriptionState'
  import {
    canManageEmployees,
    canManageProducts,
    canManageStock,
    canManageSubscription,
    currentUser,
    isManager,
    isOwner,
    isSeller,
    loadCurrentUser,
  } from '@/services/userState'

  const drawer = ref(true)

  const router = useRouter()
  function roleLabel (role) {
    if (role === 'owner') return 'Propriétaire'
    if (role === 'manager') return 'Gérant'
    if (role === 'seller') return 'Vendeur'
    return role || 'Utilisateur'
  }

  function roleColor (role) {
    if (role === 'owner') return 'primary'
    if (role === 'manager') return 'success'
    if (role === 'seller') return 'warning'
    return 'grey'
  }

  function handleLogout () {
    logout()
    router.push('/login')
  }
  onMounted(() => {
    loadSubscription()
    loadCurrentUser()
  })
</script>

<style scoped>
.sidebar {
  border-right: 1px solid #eef0f4;
  background: #ffffff;
}

.topbar {
  border-bottom: 1px solid #eef0f4;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
}

.main-bg {
  background: #f5f7fb;
  min-height: 100vh;
}

.upgrade-card {
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
  border: 1px solid #e5e7eb;
}

@media (max-width: 960px) {
  .responsive-container {
    padding: 14px !important;
  }

  .topbar {
    height: auto;
  }
}

.sidebar {
  z-index: 1200;
}

.topbar {
  z-index: 1100;
  border-bottom: 1px solid #eef0f4;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
}

.topbar-title {
  min-width: 0;
}

.main-bg {
  background: #f5f7fb;
  min-height: 100vh;
}

@media (max-width: 960px) {
  .responsive-container {
    padding: 16px !important;
  }
}
</style>
