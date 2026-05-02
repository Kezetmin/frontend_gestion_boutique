<template>
  <div>
    <!-- Header -->
    <div class="page-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Dettes clients</h1>
        <p class="text-body-1 text-medium-emphasis">
          Suivez les ventes non soldées et les paiements restants
        </p>
      </div>

      <v-chip color="warning" size="large" variant="tonal">
        Crédits clients
      </v-chip>
    </div>

    <!-- Messages -->
    <v-alert
      v-if="successMessage"
      class="mb-4"
      type="success"
      variant="tonal"
    >
      {{ successMessage }}
    </v-alert>

    <v-alert
      v-if="errorMessage"
      class="mb-4"
      type="error"
      variant="tonal"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col cols="12" lg="4" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">
            Ventes non soldées
          </div>
          <div class="text-h4 font-weight-bold">
            {{ debts.length }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">
            Total restant
          </div>
          <div class="text-h5 font-weight-bold text-error">
            {{ formatFCFA(totalRemaining) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">
            Total déjà payé
          </div>
          <div class="text-h5 font-weight-bold text-success">
            {{ formatFCFA(totalPaid) }}
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
        label="Rechercher par client ou téléphone"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
      />
    </v-card>

    <!-- Loading -->
    <v-card v-if="loading" class="premium-card pa-8 rounded-xl" elevation="0">
      <div class="text-center">
        <v-progress-circular color="primary" indeterminate size="54" />
        <p class="mt-4 text-body-2 text-medium-emphasis">
          Chargement des dettes clients...
        </p>
      </div>
    </v-card>

    <!-- Tableau -->
    <v-card v-else class="premium-card rounded-xl" elevation="0">
      <div class="table-responsive">
        <v-table>
          <thead>
            <tr /><tr>
              <th>Client</th>
              <th>Articles</th>
              <th>Total</th>
              <th>Payé</th>
              <th>Reste</th>
              <th>Statut</th>
              <th>Date</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="debt in filteredDebts" :key="debt.id">
              <td class="font-weight-bold">
                {{ debt.customer_name || debt.customer?.name || 'Client inconnu' }}
              </td>

              <td>
                <div
                  v-if="debt.items && debt.items.length > 0"
                  class="text-caption"
                >
                  <div
                    v-for="(item, index) in debt.items"
                    :key="index"
                    class="mb-1"
                  >
                    <strong>{{ item.product_name }}</strong>
                    × {{ item.quantity }}
                  </div>
                </div>

                <span v-else class="text-medium-emphasis">
                  Aucun article
                </span>
              </td>

              <td>
                {{ formatFCFA(debt.total_amount) }}
              </td>

              <td class="text-success font-weight-bold">
                {{ formatFCFA(debt.amount_paid) }}
              </td>

              <td class="text-error font-weight-bold">
                {{ formatFCFA(debt.remaining_amount) }}
              </td>

              <td>
                <v-chip
                  :color="getStatusColor(debt.payment_status)"
                  size="small"
                  variant="tonal"
                >
                  {{ getStatusLabel(debt.payment_status) }}
                </v-chip>
              </td>

              <td>
                {{ formatDate(debt.created_at) }}
              </td>

              <td class="text-right">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-cash-plus"
                  size="small"
                  variant="tonal"
                  @click="openPaymentDialog(debt)"
                >
                  Ajouter paiement
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div
        v-if="filteredDebts.length === 0"
        class="pa-8 text-center text-medium-emphasis"
      >
        Aucune dette client trouvée.
      </div>
    </v-card>

    <!-- Dialog Ajouter paiement -->
    <v-dialog v-model="paymentDialog" max-width="520">
      <v-card class="dialog-card pa-2">
        <v-card-title class="text-h5 font-weight-bold">
          Ajouter un paiement
        </v-card-title>

        <v-card-text>
          <v-alert class="mb-4" type="info" variant="tonal">
            Enregistrez un versement pour réduire le reste à payer.
          </v-alert>

          <v-list class="mb-4" lines="two">
            <v-list-item
              :subtitle="selectedDebt ? getCustomerName(selectedDebt) : '-'"
              title="Client"
            />

            <v-list-item
              :subtitle="selectedDebt ? formatFCFA(selectedDebt.remaining_amount) : '0 FCFA'"
              title="Reste à payer"
            />
          </v-list>

          <v-text-field
            v-model.number="paymentForm.amount"
            class="mb-4"
            density="comfortable"
            label="Montant du paiement"
            min="1"
            prepend-inner-icon="mdi-cash"
            type="number"
            variant="outlined"
          />

          <v-textarea
            v-model="paymentForm.note"
            density="comfortable"
            label="Note"
            placeholder="Exemple : paiement Mobile Money, versement cash..."
            prepend-inner-icon="mdi-note-text-outline"
            rows="3"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />

          <v-btn variant="text" @click="paymentDialog = false">
            Annuler
          </v-btn>

          <v-btn
            color="primary"
            :loading="paying"
            @click="submitPayment"
          >
            Enregistrer paiement
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import api from '@/services/api'

  const debts = ref([])
  const search = ref('')
  const loading = ref(true)

  const successMessage = ref('')
  const errorMessage = ref('')

  const paymentDialog = ref(false)
  const selectedDebt = ref(null)
  const paying = ref(false)

  const paymentForm = ref({
    amount: 0,
    note: '',
  })

  function formatFCFA (value) {
    const number = Number(value || 0)
    return `${number.toLocaleString('fr-FR')} FCFA`
  }

  function formatDate (value) {
    if (!value) return '-'

    return new Date(value).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
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

  function getCustomerName (debt) {
    return debt.customer_name || debt.customer?.name || 'Client inconnu'
  }

  function getCustomerPhone (debt) {
    return debt.customer_phone || debt.customer?.phone || ''
  }

  function getStatusLabel (status) {
    if (status === 'partial') return 'Partiel'
    if (status === 'unpaid') return 'Impayé'
    if (status === 'paid') return 'Payé'

    return status || '-'
  }

  function getStatusColor (status) {
    if (status === 'partial') return 'warning'
    if (status === 'unpaid') return 'error'
    if (status === 'paid') return 'success'

    return 'grey'
  }

  const filteredDebts = computed(() => {
    if (!search.value) return debts.value

    const keyword = search.value.toLowerCase()

    return debts.value.filter(debt => {
      const name = getCustomerName(debt).toLowerCase()
      const phone = getCustomerPhone(debt).toLowerCase()

      return name.includes(keyword) || phone.includes(keyword)
    })
  })

  const totalRemaining = computed(() => {
    return debts.value.reduce((total, debt) => {
      return total + Number(debt.remaining_amount || 0)
    }, 0)
  })

  const totalPaid = computed(() => {
    return debts.value.reduce((total, debt) => {
      return total + Number(debt.amount_paid || 0)
    }, 0)
  })

  async function fetchDebts () {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await api.get('sales/debts/')

      debts.value = Array.isArray(response.data)
        ? response.data
        : response.data.results || []
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de charger les dettes clients.',
      )

      console.error('Erreur dettes clients:', error)
    } finally {
      loading.value = false
    }
  }

  function openPaymentDialog (debt) {
    selectedDebt.value = debt
    paymentForm.value = {
      amount: Number(debt.remaining_amount || 0),
      note: '',
    }
    paymentDialog.value = true
  }

  async function submitPayment () {
    successMessage.value = ''
    errorMessage.value = ''

    if (!selectedDebt.value) return

    if (!paymentForm.value.amount || paymentForm.value.amount <= 0) {
      errorMessage.value = 'Le montant du paiement doit être supérieur à 0.'
      return
    }

    if (paymentForm.value.amount > Number(selectedDebt.value.remaining_amount || 0)) {
      errorMessage.value = 'Le paiement ne peut pas dépasser le reste à payer.'
      return
    }

    paying.value = true

    try {
      await api.post(`sales/${selectedDebt.value.id}/add-payment/`, {
        amount: paymentForm.value.amount,
        note: paymentForm.value.note,
      })

      successMessage.value = 'Paiement ajouté avec succès.'

      paymentDialog.value = false
      selectedDebt.value = null

      await fetchDebts()
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible d’ajouter le paiement.',
      )

      console.error('Erreur paiement dette:', error)
    } finally {
      paying.value = false
    }
  }

  onMounted(() => {
    fetchDebts()
  })
</script>

<style scoped>
.premium-card {
  background: white;
  border: 1px solid #eef0f4;
  transition: all 0.2s ease;
}

.premium-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
}

.dialog-card {
  border-radius: 22px !important;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.table-responsive table {
  min-width: 900px;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
