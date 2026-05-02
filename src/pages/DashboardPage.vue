<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Dashboard</h1>
        <p class="text-body-1 text-medium-emphasis">
          Bienvenue sur le pilotage de {{ dashboard.shop_name }}
        </p>
      </div>

      <v-chip color="success" size="large" variant="tonal">
        {{ dashboard.date }}
      </v-chip>
    </div>
    <v-card class="table-card pa-4 rounded-xl mb-4" elevation="0">
      <div class="d-flex flex-wrap ga-2 align-center">
        <span class="text-body-2 text-medium-emphasis mr-2">
          Période :
        </span>

        <v-btn
          v-for="period in periods"
          :key="period.value"
          :color="selectedPeriod === period.value ? 'primary' : 'default'"
          variant="tonal"
          @click="changePeriod(period.value)"
        >
          {{ period.label }}
        </v-btn>
      </div>
    </v-card>
    <!-- Loading -->
    <v-card
      v-if="loading"
      class="pa-8 rounded-xl"
      elevation="0"
    >
      <PageLoader
        v-if="loading"
        message="Chargement du tableau de bord..."
      />
    </v-card>

    <!-- Error -->
    <v-alert
      v-else-if="errorMessage"
      class="mb-4"
      type="error"
      variant="tonal"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- Content -->
    <template v-else>
      <!-- Stats -->
      <v-row class="mb-2">
        <v-col cols="12" lg="3" sm="6">
          <v-card
            class="stat-card clickable-card pa-5 rounded-xl"
            elevation="0"
            @click="goToHistory"
          >
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-medium-emphasis mb-2">
                  Nombre de ventes
                </div>
                <div class="text-h4 font-weight-bold">
                  {{ dashboard.sales_count_today }}
                </div>
              </div>

              <v-avatar color="primary" size="52">
                <v-icon icon="mdi-cart-outline" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="3" sm="6">
          <v-card class="stat-card pa-5 rounded-xl" elevation="0">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-medium-emphasis mb-2">
                  Vendu aujourd’hui
                </div>
                <div class="text-h5 font-weight-bold">
                  {{ formatFCFA(dashboard.total_sales_today) }}
                </div>
              </div>

              <v-avatar color="info" size="52">
                <v-icon icon="mdi-receipt-text-outline" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="3" sm="6">
          <v-card class="stat-card pa-5 rounded-xl" elevation="0">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-medium-emphasis mb-2">
                  Encaissé aujourd’hui
                </div>
                <div class="text-h5 font-weight-bold text-success">
                  {{ formatFCFA(dashboard.cash_collected_today) }}
                </div>
              </div>

              <v-avatar color="success" size="52">
                <v-icon icon="mdi-cash-check" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="3" sm="6">
          <v-card
            class="stat-card clickable-card pa-5 rounded-xl"
            elevation="0"
            @click="goToDebts"
          >
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-medium-emphasis mb-2">
                  Crédits restants
                </div>
                <div class="text-h5 font-weight-bold text-error">
                  {{ formatFCFA(dashboard.total_remaining_debts) }}
                </div>
              </div>

              <v-avatar color="error" size="52">
                <v-icon icon="mdi-account-cash-outline" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Stats ligne 2 -->
      <v-row class="mb-4">
        <v-col cols="12" lg="4" sm="6">
          <v-card class="stat-card pa-5 rounded-xl" elevation="0">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-medium-emphasis mb-2">
                  Bénéfice du jour
                </div>
                <div class="text-h5 font-weight-bold">
                  {{ formatFCFA(dashboard.today_profit) }}
                </div>
              </div>

              <v-avatar color="warning" size="52">
                <v-icon icon="mdi-chart-line" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4" sm="6">
          <v-card
            class="stat-card clickable-card pa-5 rounded-xl"
            elevation="0"
            @click="goToDebts"
          >
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-medium-emphasis mb-2">
                  Ventes non soldées
                </div>
                <div class="text-h4 font-weight-bold">
                  {{ dashboard.unpaid_sales_count }}
                </div>
              </div>

              <v-avatar color="warning" size="52">
                <v-icon icon="mdi-alert-circle-outline" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4" sm="6">
          <v-card
            class="stat-card clickable-card pa-5 rounded-xl"
            elevation="0"
            @click="goToProducts"
          >
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-medium-emphasis mb-2">
                  Stock faible
                </div>
                <div class="text-h4 font-weight-bold">
                  {{ dashboard.low_stock_products.length }}
                </div>
              </div>

              <v-avatar color="error" size="52">
                <v-icon icon="mdi-alert-outline" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="table-card pa-5 rounded-xl" elevation="0">
            <div class="d-flex justify-space-between align-center flex-wrap ga-3">
              <div>
                <h2 class="text-h6 font-weight-bold">
                  Situation des crédits clients
                </h2>

                <p class="text-caption text-medium-emphasis">
                  Suivi rapide des montants encore à récupérer auprès des clients
                </p>
              </div>

              <v-btn
                color="primary"
                prepend-icon="mdi-account-cash-outline"
                to="/debts"
                variant="tonal"
              >
                Voir dettes clients
              </v-btn>
            </div>

            <v-divider class="my-4" />

            <v-row>
              <v-col cols="12" md="4">
                <div class="text-caption text-medium-emphasis mb-1">
                  Argent encaissé aujourd’hui
                </div>
                <div class="text-h6 font-weight-bold text-success">
                  {{ formatFCFA(dashboard.cash_collected_today) }}
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="text-caption text-medium-emphasis mb-1">
                  Montant encore dehors
                </div>
                <div class="text-h6 font-weight-bold text-error">
                  {{ formatFCFA(dashboard.total_remaining_debts) }}
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="text-caption text-medium-emphasis mb-1">
                  Nombre de ventes non soldées
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ dashboard.unpaid_sales_count }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Tables -->
      <v-row>
        <!-- Stock faible -->
        <v-col cols="12" lg="6">
          <v-card class="pa-5 rounded-xl table-card" elevation="0">
            <div class="mb-4">
              <h2 class="text-h6 font-weight-bold">
                Produits à surveiller
              </h2>

              <p class="text-caption text-medium-emphasis">
                Stock proche de la rupture
              </p>
            </div>

            <v-table class="table-responsive">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Stock</th>
                  <th>Seuil</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="item in dashboard.low_stock_products"
                  :key="item.id"
                >
                  <td>{{ item.name }}</td>
                  <td>{{ item.stock_quantity }}</td>
                  <td>{{ item.low_stock_threshold }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>

        <!-- Top produits -->
        <v-col cols="12" lg="6">
          <v-card class="pa-5 rounded-xl table-card" elevation="0">
            <div class="mb-4">
              <h2 class="text-h6 font-weight-bold">
                Top Produits
              </h2>

              <p class="text-caption text-medium-emphasis">
                Les meilleures ventes
              </p>
            </div>

            <v-table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Qté</th>
                  <th>Ventes</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="item in dashboard.top_products"
                  :key="item.product_id"
                >
                  <td>{{ item.product_name }}</td>
                  <td>{{ item.total_quantity_sold }}</td>
                  <td>{{ item.sales_count }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import PageLoader from '@/components/PageLoader.vue'
  import api from '@/services/api'

  const loading = ref(true)
  const errorMessage = ref('')
  const router = useRouter()
  const dashboard = ref({
    shop_name: '',
    date: '',
    sales_count_today: 0,
    total_sales_today: 0,
    today_profit: 0,
    cash_collected_today: 0,
    total_remaining_debts: 0,
    unpaid_sales_count: 0,
    low_stock_products: [],
    top_products: [],
  })

  function formatFCFA (value) {
    return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`
  }

  async function fetchDashboard (period = selectedPeriod.value) {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await api.get(`dashboard/?period=${period}`)

      dashboard.value = {
        shop_name: response.data.shop_name || '',
        date: response.data.date || '',
        sales_count_today: response.data.sales_count_today || 0,
        total_sales_today: response.data.total_sales_today || 0,
        today_profit: response.data.today_profit || 0,
        cash_collected_today: response.data.cash_collected_today || 0,
        total_remaining_debts: response.data.total_remaining_debts || 0,
        unpaid_sales_count: response.data.unpaid_sales_count || 0,
        low_stock_products: response.data.low_stock_products || [],
        top_products: response.data.top_products || [],
      }
    } catch (error) {
      errorMessage.value = 'Impossible de charger le dashboard.'
      console.error('Erreur dashboard:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchDashboard()
  })

  function goToHistory () {
    router.push('/history')
  }
  function goToDebts () {
    router.push('/debts')
  }
  function goToProducts () {
    router.push('/products')
  }
  const selectedPeriod = ref('today')

  const periods = [
    { label: 'Aujourd’hui', value: 'today' },
    { label: '7 jours', value: '7days' },
    { label: '30 jours', value: '30days' },
  ]
  async function changePeriod (period) {
    selectedPeriod.value = period
    await fetchDashboard(period)
  }

</script>

<style scoped>
.stat-card {
  background: white;
  border: 1px solid #eef0f4;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,.06);
}

.table-card {
  background: white;
  border: 1px solid #eef0f4;
}
.clickable-card {
  cursor: pointer;
  transition: all 0.22s ease;
}

.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
}

.clickable-card:active {
  transform: scale(0.98);
}
</style>
