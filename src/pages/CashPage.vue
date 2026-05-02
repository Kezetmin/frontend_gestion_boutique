<template>
  <div>
    <!-- Header -->
    <div class="page-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Caisse</h1>
        <p class="text-body-1 text-medium-emphasis">
          Résumé des encaissements de la boutique
        </p>
      </div>

      <v-chip color="success" size="large" variant="tonal">
        {{ periodLabel }}
      </v-chip>
    </div>

    <!-- Alert Basic -->
    <v-alert
      v-if="!isPro"
      class="mb-4"
      type="info"
      variant="tonal"
    >
      🔒 Vous êtes en pack Basic : seule la caisse du jour est disponible.
      Les filtres 7 jours, 30 jours et dates personnalisées sont réservés au pack Pro.

      <div class="mt-3">
        <v-btn
          color="primary"
          size="small"
          to="/upgrade"
          variant="flat"
        >
          Passer au Pro
        </v-btn>
      </div>
    </v-alert>

    <!-- Filtres Pro -->
    <v-card class="premium-card pa-4 rounded-xl mb-4" elevation="0">
      <div class="d-flex flex-wrap ga-2 mb-4">
        <v-btn
          :color="periodFilter === 'today' ? 'primary' : 'default'"
          variant="tonal"
          @click="applyQuickFilter('today')"
        >
          Aujourd’hui
        </v-btn>

        <v-btn
          :color="periodFilter === '7days' ? 'primary' : 'default'"
          :disabled="!isPro"
          variant="tonal"
          @click="applyQuickFilter('7days')"
        >
          7 jours
        </v-btn>

        <v-btn
          :color="periodFilter === '30days' ? 'primary' : 'default'"
          :disabled="!isPro"
          variant="tonal"
          @click="applyQuickFilter('30days')"
        >
          30 jours
        </v-btn>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="startDate"
            density="comfortable"
            :disabled="!isPro"
            hide-details
            label="Date début"
            type="date"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="endDate"
            density="comfortable"
            :disabled="!isPro"
            hide-details
            label="Date fin"
            type="date"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <v-btn
        v-if="isPro"
        class="mt-4"
        color="primary"
        prepend-icon="mdi-filter-outline"
        variant="flat"
        @click="fetchCashSummary"
      >
        Appliquer le filtre
      </v-btn>
    </v-card>

    <!-- Loading -->
    <PageLoader
      v-if="loading"
      message="Chargement de la caisse..."
    />

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
      <v-row>
        <v-col cols="12" md="4">
          <v-card class="premium-card pa-5 rounded-xl" elevation="0">
            <div class="text-caption text-medium-emphasis mb-2">
              Total ventes
            </div>

            <div class="text-h5 font-weight-bold">
              {{ formatFCFA(cash.total_sales) }}
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="premium-card pa-5 rounded-xl" elevation="0">
            <div class="text-caption text-medium-emphasis mb-2">
              Encaissé sur ventes
            </div>

            <div class="text-h5 font-weight-bold text-success">
              {{ formatFCFA(cash.total_paid) }}
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="premium-card pa-5 rounded-xl" elevation="0">
            <div class="text-caption text-medium-emphasis mb-2">
              Crédit restant
            </div>

            <div class="text-h5 font-weight-bold text-error">
              {{ formatFCFA(cash.total_remaining) }}
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="premium-card pa-5 rounded-xl" elevation="0">
            <div class="text-caption text-medium-emphasis mb-2">
              Total paiements reçus
            </div>

            <div class="text-h5 font-weight-bold">
              {{ formatFCFA(cash.total_payments) }}
            </div>

            <div class="text-caption text-medium-emphasis mt-1">
              {{ cash.payments_count }} paiement(s)
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="premium-card pa-5 rounded-xl" elevation="0">
            <div class="text-caption text-medium-emphasis mb-2">
              Nombre de ventes
            </div>

            <div class="text-h4 font-weight-bold">
              {{ cash.sales_count }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="premium-card pa-5 rounded-xl mt-4" elevation="0">
        <h2 class="text-h6 font-weight-bold mb-2">
          Lecture rapide
        </h2>

        <p class="text-body-2 text-medium-emphasis mb-0">
          La caisse permet de voir ce qui a été vendu, ce qui a été réellement encaissé,
          et ce qui reste encore dehors sous forme de crédit client.
        </p>
      </v-card>
    </template>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import PageLoader from '@/components/PageLoader.vue'
  import api from '@/services/api'
  import { isPro } from '@/services/subscriptionState'

  const loading = ref(true)
  const errorMessage = ref('')

  const periodFilter = ref('today')
  const startDate = ref('')
  const endDate = ref('')

  const cash = ref({
    date_from: '',
    date_to: '',
    total_sales: 0,
    total_paid: 0,
    total_remaining: 0,
    total_payments: 0,
    sales_count: 0,
    payments_count: 0,
  })

  const periodLabel = computed(() => {
    if (!cash.value.date_from || !cash.value.date_to) {
      return 'Aujourd’hui'
    }

    if (cash.value.date_from === cash.value.date_to) {
      return cash.value.date_from
    }

    return `${cash.value.date_from} → ${cash.value.date_to}`
  })

  function formatFCFA (value) {
    return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`
  }

  function todayString () {
    return new Date().toISOString().slice(0, 10)
  }

  function applyQuickFilter (period) {
    periodFilter.value = period

    const today = new Date()
    const todayValue = today.toISOString().slice(0, 10)

    if (period === 'today') {
      startDate.value = todayValue
      endDate.value = todayValue
    }

    if (period === '7days') {
      const date = new Date()
      date.setDate(today.getDate() - 6)

      startDate.value = date.toISOString().slice(0, 10)
      endDate.value = todayValue
    }

    if (period === '30days') {
      const date = new Date()
      date.setDate(today.getDate() - 29)

      startDate.value = date.toISOString().slice(0, 10)
      endDate.value = todayValue
    }

    fetchCashSummary()
  }

  async function fetchCashSummary () {
    loading.value = true
    errorMessage.value = ''

    try {
      const params = {}

      // Basic : on n’envoie aucun filtre avancé
      // Le backend retournera automatiquement la caisse du jour
      if (isPro.value && startDate.value && endDate.value) {
        params.date_from = startDate.value
        params.date_to = endDate.value
      }

      const response = await api.get('sales/cash-summary/', { params })

      cash.value = response.data
    } catch (error) {
      errorMessage.value
        = error.response?.data?.error || 'Impossible de charger la caisse.'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    startDate.value = todayString()
    endDate.value = todayString()
    fetchCashSummary()
  })
</script>

<style scoped>
.premium-card {
  background: white;
  border: 1px solid #eef0f4;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
