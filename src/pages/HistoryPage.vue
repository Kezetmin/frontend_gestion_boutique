<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Historique des ventes</h1>
        <p class="text-body-1 text-medium-emphasis">
          Consultez les ventes passées de la boutique
        </p>
      </div>

      <v-chip color="primary" size="large" variant="tonal">
        Historique actif
      </v-chip>
      <v-chip
        v-if="isSeller"
        color="warning"
        size="large"
        variant="tonal"
      >
        Mes ventes uniquement
      </v-chip>

      <v-chip
        v-else
        color="primary"
        size="large"
        variant="tonal"
      >
        Toutes les ventes
      </v-chip>
    </div>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col cols="12" lg="4" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">
            Nombre de ventes
          </div>

          <div class="text-h4 font-weight-bold">
            {{ validSalesCount }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">
            Chiffre total
          </div>

          <div class="text-h5 font-weight-bold">
            {{ formatFCFA(totalRevenue) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">
            Bénéfice total
          </div>

          <div class="text-h5 font-weight-bold">
            {{ formatFCFA(totalProfit) }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">
            Credit restants
          </div>

          <div class="text-h5 font-weight-bold">
            {{ formatFCFA(totalRemaining) }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recherche -->
    <v-card class="premium-card pa-4 rounded-xl mb-4" elevation="0">
      <v-text-field
        v-model="search"
        density="comfortable"
        hide-details
        label="Rechercher une vente"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
      />
    </v-card>

    <!-- Loading -->
    <PageLoader
      v-if="loading"
      message="Chargement de l’historique..."
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
        <v-alert
          v-if="!isPro"
          class="mb-4"
          type="info"
          variant="tonal"
        >
          🔒 Les filtres avancés sont disponibles dans le pack Pro.

          <div class="mt-2">
            <v-btn color="primary" size="small" @click="$router.push('/upgrade')">
              Passer au Pro
            </v-btn>
          </div>
        </v-alert>

        <v-btn
          :color="periodFilter === 'all' ? 'primary' : 'default'"
          :disabled="!isPro"
          variant="tonal"
          @click="applyQuickFilter('all')"
        >
          Tout
        </v-btn>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="startDate"
            density="comfortable"
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
            hide-details
            label="Date fin"
            type="date"
            variant="outlined"
          />
        </v-col>
        <v-col v-if="isOwner || isManager" cols="12" md="6">
          <v-select
            v-model="selectedUser"
            clearable
            density="comfortable"
            hide-details
            item-title="username"
            item-value="id"
            :items="employees"
            label="Filtrer par vendeur"
            prepend-inner-icon="mdi-account-filter-outline"
            variant="outlined"
            @update:model-value="fetchSalesHistory"
          />
        </v-col>
      </v-row>
    </v-card>
    <!-- Tableau -->
    <v-card class="premium-card rounded-xl" elevation="0">
      <v-table class="table-responsive">
        <thead>
          <tr>
            <th>Date</th>
            <th>Montant</th>
            <th>Bénéfice</th>
            <th>Statut</th>
            <th>Détails</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in filteredSales" :key="sale.id">
            <td>
              <div class="font-weight-bold">
                {{ formatDate(sale.created_at) }}
              </div>

              <div class="text-caption text-medium-emphasis">
                Vente #{{ sale.id }}
              </div>
            </td>

            <td class="font-weight-bold">
              {{ formatFCFA(sale.total_amount) }}
            </td>

            <td>
              <v-chip
                :color="sale.status === 'cancelled' ? 'grey' : 'success'"
                size="small"
                variant="tonal"
              >
                {{ formatFCFA(sale.total_profit) }}
              </v-chip>
            </td>

            <td>
              <v-chip
                :color="getSaleStatusColor(sale)"
                size="small"
              >
                {{ getSaleStatusLabel(sale) }}
              </v-chip>
            </td>

            <td>
              <div
                v-if="sale.items && sale.items.length > 0"
                class="text-caption"
              >
                <div
                  v-for="item in sale.items"
                  :key="item.id"
                  class="mb-1"
                >
                  {{ item.product_name }} × {{ item.quantity }}
                </div>
              </div>

              <span v-else class="text-medium-emphasis">
                Aucun détail
              </span>

              <div
                v-if="sale.status === 'cancelled' && sale.cancel_reason"
                class="text-caption text-error mt-2"
              >
                Motif : {{ sale.cancel_reason }}
              </div>
            </td>

            <td class="text-right">
              <v-btn
                class="mr-2"
                color="primary"
                prepend-icon="mdi-receipt-text-outline"
                size="small"
                variant="tonal"
                @click="openReceiptDialog(sale)"
              >
                Reçu
              </v-btn>
              <v-btn
                color="error"
                :disabled="sale.status === 'cancelled'"
                prepend-icon="mdi-cancel"
                size="small"
                variant="tonal"
                @click="openCancelDialog(sale)"
              >
                Annuler vente
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div
        v-if="filteredSales.length === 0"
        class="pa-8 text-center text-medium-emphasis"
      >
        Aucune vente trouvée.
      </div>
    </v-card>
  </div>
  <v-dialog v-model="cancelDialog" max-width="520">
    <v-card class="dialog-card pa-2">
      <v-card-title class="text-h5 font-weight-bold">
        Annuler la vente
      </v-card-title>

      <v-card-text>
        <v-alert class="mb-4" type="warning" variant="tonal">
          Cette action va annuler la vente, mais elle restera visible dans
          l’historique.
        </v-alert>

        <p class="mb-4">
          Voulez-vous vraiment annuler la vente
          <strong>#{{ selectedSale?.id }}</strong> ?
        </p>

        <v-textarea
          v-model="cancelReason"
          density="comfortable"
          label="Motif d’annulation"
          placeholder="Exemple : erreur de quantité, client a annulé..."
          rows="3"
          variant="outlined"
        />
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />

        <v-btn
          variant="text"
          @click="cancelDialog = false"
        >
          Fermer
        </v-btn>

        <v-btn
          color="error"
          :loading="cancelling"
          @click="cancelSale"
        >
          Confirmer l’annulation
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="receiptDialog" max-width="520">
    <v-card class="dialog-card pa-4">
      <v-card-title class="text-h5 font-weight-bold">
        Reçu de vente
      </v-card-title>

      <v-card-text>
        <div v-if="receiptLoading" class="text-center pa-6">
          <v-progress-circular color="primary" indeterminate />
          <p class="mt-3 text-body-2 text-medium-emphasis">
            Chargement du reçu...
          </p>
        </div>
        <div v-else-if="selectedReceipt" id="receipt-print-area" class="receipt">
          <div class="text-center mb-2">
            <h2 class="receipt-title">
              {{ selectedReceipt.shop_name }}
            </h2>

            <div class="receipt-sub">
              Reçu N° {{ selectedReceipt.receipt_number }}
            </div>

            <div class="receipt-sub">
              {{ formatDate(selectedReceipt.date) }}
            </div>
          </div>

          <v-divider class="my-2" />

          <div class="receipt-row">
            <span>Vendeur</span>
            <span>{{ selectedReceipt.seller }}</span>
          </div>

          <div class="receipt-row">
            <span>Client</span>
            <span>{{ selectedReceipt.customer || 'Comptoir' }}</span>
          </div>

          <v-divider class="my-2" />

          <table class="receipt-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Qté</th>
                <th>P.U</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in selectedReceipt.items"
                :key="index"
              >
                <td>{{ item.product_name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatFCFA(item.unit_price) }}</td>
                <td>{{ formatFCFA(item.subtotal) }}</td>
              </tr>
            </tbody>
          </table>

          <v-divider class="my-2" />

          <div class="receipt-total">
            <div class="receipt-row">
              <strong>Total</strong>
              <strong>{{ formatFCFA(selectedReceipt.total_amount) }}</strong>
            </div>

            <div class="receipt-row">
              <span>Payé</span>
              <span>{{ formatFCFA(selectedReceipt.amount_paid) }}</span>
            </div>

            <div class="receipt-row">
              <span>Reste</span>
              <span>{{ formatFCFA(selectedReceipt.remaining_amount) }}</span>
            </div>
          </div>

          <v-divider class="my-2" />

          <div class="text-center receipt-footer">
            Merci pour votre achat 🙏
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn variant="text" @click="receiptDialog = false">
          Fermer
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-printer-outline"
          @click="printReceipt"
        >
          Imprimer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import PageLoader from '@/components/PageLoader.vue'
  import api from '@/services/api'
  import { isPro } from '@/services/subscriptionState'
  import {
    currentUser,
    isManager,
    isOwner,
    isSeller,
    loadCurrentUser,
  } from '@/services/userState'
  const employees = ref([])
  const selectedUser = ref(null)
  const cancelDialog = ref(false)
  const selectedSale = ref(null)
  const cancelReason = ref('')
  const cancelling = ref(false)
  const receiptDialog = ref(false)
  const receiptLoading = ref(false)
  const selectedReceipt = ref(null)

  const sales = ref([])
  const search = ref('')
  const loading = ref(true)
  const errorMessage = ref('')
  const periodFilter = ref('all')
  const startDate = ref('')
  const endDate = ref('')

  function formatFCFA (value) {
    const number = Number(value || 0)
    return `${number.toLocaleString('fr-FR')} FCFA`
  }

  function formatDate (value) {
    if (!value) return 'Date inconnue'

    return new Date(value).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }
  function getSaleStatusLabel (sale) {
    if (sale.status === 'cancelled') {
      return 'Annulée'
    }

    if (sale.payment_status === 'partial') {
      return 'Partielle'
    }

    if (sale.payment_status === 'paid') {
      return 'Payée'
    }

    return 'Validée'
  }

  function getSaleStatusColor (sale) {
    if (sale.status === 'cancelled') {
      return 'error'
    }

    if (sale.payment_status === 'partial') {
      return 'warning'
    }

    if (sale.payment_status === 'paid') {
      return 'success'
    }

    return 'info'
  }
  const visibleSales = computed(() => {
    if (!isSeller.value) {
      return sales.value
    }

    return sales.value.filter(sale => {
      return sale.username === currentUser.value?.username
    })
  })
  const filteredSales = computed(() => {
    let data = visibleSales.value

    // Les filtres de date seulement pour Pro
    if (isPro.value) {
      if (startDate.value) {
        data = data.filter(sale => getSaleDateOnly(sale) >= startDate.value)
      }

      if (endDate.value) {
        data = data.filter(sale => getSaleDateOnly(sale) <= endDate.value)
      }
    }

    if (search.value) {
      const keyword = search.value.toLowerCase()

      data = data.filter(sale => {
        const itemsText = sale.items
          ? sale.items.map(item => item.product_name).join(' ').toLowerCase()
          : ''

        const customerText = sale.customer_name
          ? sale.customer_name.toLowerCase()
          : ''

        return (
          itemsText.includes(keyword)
          || customerText.includes(keyword)
          || String(sale.id).includes(keyword)
        )
      })
    }

    return data
  })
  function isCancelled (sale) {
    return sale.status === 'cancelled'
  }

  function getSaleDateOnly (sale) {
    return new Date(sale.created_at).toISOString().slice(0, 10)
  }

  function applyQuickFilter (period) {
    periodFilter.value = period

    const today = new Date()
    const todayString = today.toISOString().slice(0, 10)

    if (period === 'today') {
      startDate.value = todayString
      endDate.value = todayString
    }

    if (period === '7days') {
      const date = new Date()
      date.setDate(today.getDate() - 6)

      startDate.value = date.toISOString().slice(0, 10)
      endDate.value = todayString
    }

    if (period === '30days') {
      const date = new Date()
      date.setDate(today.getDate() - 29)

      startDate.value = date.toISOString().slice(0, 10)
      endDate.value = todayString
    }

    if (period === 'all') {
      startDate.value = ''
      endDate.value = ''
    }

    fetchSalesHistory()
  }
  async function fetchSalesHistory () {
    loading.value = true
    errorMessage.value = ''

    try {
      const params = {}

      if (startDate.value) {
        params.date_from = startDate.value
      }

      if (endDate.value) {
        params.date_to = endDate.value
      }

      if (selectedUser.value) {
        params.user_id = selectedUser.value
      }

      const response = await api.get('sales/history/', { params })

      sales.value = Array.isArray(response.data)
        ? response.data
        : response.data.results || []
    } catch (error) {
      errorMessage.value = error.response?.status === 403
        ? error.response?.data?.error
          || 'Fonction réservée au pack Pro.'
        : 'Impossible de charger l’historique.'
    } finally {
      loading.value = false
    }
  }
  onMounted(async () => {
    if (!currentUser.value) {
      await loadCurrentUser()
    }

    if (isOwner.value || isManager.value) {
      await fetchEmployees()
    }

    await fetchSalesHistory()
  })

  function openCancelDialog (sale) {
    selectedSale.value = sale
    cancelReason.value = ''
    cancelDialog.value = true
  }

  async function cancelSale () {
    if (!selectedSale.value) return

    if (!cancelReason.value) {
      errorMessage.value = 'Veuillez saisir un motif d’annulation.'
      return
    }

    cancelling.value = true
    errorMessage.value = ''

    try {
      await api.post(`sales/${selectedSale.value.id}/cancel/`, {
        cancel_reason: cancelReason.value,
      })

      cancelDialog.value = false
      selectedSale.value = null
      cancelReason.value = ''

      await fetchSalesHistory()
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible d’annuler cette vente.',
      )

      console.error('Erreur annulation vente:', error)
    } finally {
      cancelling.value = false
    }
  }
  async function openReceiptDialog (sale) {
    receiptLoading.value = true
    selectedReceipt.value = null
    receiptDialog.value = true

    try {
      const response = await api.get(`sales/${sale.id}/receipt/`)
      selectedReceipt.value = response.data
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de charger le reçu.',
      )
    } finally {
      receiptLoading.value = false
    }
  }

  function getErrorMessage (error, fallback = 'Une erreur est survenue.') {
    const data = error.response?.data

    if (!data) return fallback
    if (typeof data === 'string') return data

    if (data.detail) return data.detail
    if (data.error) return data.error

    const firstKey = Object.keys(data)[0]

    if (firstKey && Array.isArray(data[firstKey])) {
      return data[firstKey][0]
    }

    return fallback
  }
  const validFilteredSales = computed(() => {
    return filteredSales.value.filter(sale => !isCancelled(sale))
  })

  const cancelledSalesCount = computed(() => {
    return filteredSales.value.filter(sale => isCancelled(sale)).length
  })
  async function fetchEmployees () {
    try {
      const response = await api.get('shops/members/')

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || []

      employees.value = data.map(member => ({
        id: member.user_id || member.user?.id || member.id,
        username: member.username || member.user?.username || 'Utilisateur',
        role: member.role,
      }))
    } catch (error) {
      console.error('Erreur employés:', error)
    }
  }

  const totalRevenue = computed(() => {
    return validFilteredSales.value.reduce((total, sale) => {
      return total + Number(sale.total_amount || 0)
    }, 0)
  })

  const totalProfit = computed(() => {
    return validFilteredSales.value.reduce((total, sale) => {
      return total + Number(sale.total_profit || 0)
    }, 0)
  })

  const totalRemaining = computed(() => {
    return validFilteredSales.value.reduce((total, sale) => {
      return total + Number(sale.remaining_amount || 0)
    }, 0)
  })

  const validSalesCount = computed(() => {
    return validFilteredSales.value.length
  })
  function printReceipt () {
    const content = document.querySelector('#receipt-print-area')

    if (!content) return

    const printWindow = window.open('', '', 'width=400,height=600')

    printWindow.document.write(`
    <html>
      <head>
        <title>Reçu</title>
        <style>
  body {
    font-family: monospace;
    padding: 10px;
    font-size: 12px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 4px;
    font-size: 11px;
  }

  .text-center {
    text-align: center;
  }
</style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
</script>

<style scoped>
.premium-card {
  background: white;
  border: 1px solid #eef0f4;
  transition: all 0.2s ease;
}

.premium-card:hover {
  box-shadow: 0 12px 24px rgba(0,0,0,.05);
}
.receipt {
  font-family: monospace;
  font-size: 12px;
}

.receipt-title {
  font-weight: bold;
  font-size: 16px;
}

.receipt-sub {
  font-size: 11px;
  color: #666;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
}

.receipt-table th,
.receipt-table td {
  font-size: 11px;
  padding: 4px 0;
  text-align: left;
}

.receipt-total {
  margin-top: 8px;
}

.receipt-footer {
  font-size: 11px;
  margin-top: 10px;
}
</style>
