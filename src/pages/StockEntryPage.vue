<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Entrée de stock</h1>
        <p class="text-body-1 text-medium-emphasis">
          Ajoutez du stock et consultez l’historique des réapprovisionnements
        </p>
      </div>

      <v-chip color="primary" size="large" variant="tonal">
        Réapprovisionnement
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

    <v-row>
      <!-- Formulaire entrée de stock -->
      <v-col cols="12" md="5">
        <v-card class="premium-card pa-6 rounded-xl" elevation="0">
          <div class="mb-6">
            <h2 class="text-h6 font-weight-bold">Nouvelle entrée</h2>
            <p class="text-caption text-medium-emphasis">
              Sélectionnez le produit et indiquez la quantité ajoutée
            </p>
          </div>

          <v-form @submit.prevent="submitStockEntry">
            <v-select
              v-model="form.product"
              class="mb-4"
              density="comfortable"
              item-title="name"
              item-value="id"
              :items="products"
              label="Produit"
              prepend-inner-icon="mdi-package-variant"
              variant="outlined"
            />

            <v-text-field
              v-model.number="form.quantity"
              class="mb-4"
              density="comfortable"
              label="Quantité ajoutée"
              min="1"
              prepend-inner-icon="mdi-plus-box-outline"
              type="number"
              variant="outlined"
            />

            <v-text-field
              v-model="form.supplier"
              class="mb-4"
              density="comfortable"
              label="Fournisseur"
              prepend-inner-icon="mdi-truck-outline"
              variant="outlined"
            />

            <v-textarea
              v-model="form.note"
              class="mb-4"
              density="comfortable"
              label="Note"
              prepend-inner-icon="mdi-note-text-outline"
              rows="3"
              variant="outlined"
            />

            <v-btn
              block
              class="action-btn"
              color="primary"
              :loading="saving"
              prepend-icon="mdi-content-save-outline"
              size="large"
              type="submit"
            >
              Enregistrer l’entrée
            </v-btn>
          </v-form>
        </v-card>
      </v-col>

      <!-- Résumé produit sélectionné -->
      <v-col cols="12" md="7">
        <v-card class="premium-card pa-6 rounded-xl mb-4" elevation="0">
          <div class="mb-4">
            <h2 class="text-h6 font-weight-bold">Résumé</h2>
            <p class="text-caption text-medium-emphasis">
              Vérification avant enregistrement
            </p>
          </div>

          <v-row>
            <v-col cols="12" sm="6">
              <v-list lines="two">
                <v-list-item
                  prepend-icon="mdi-package-variant-closed"
                  :subtitle="selectedProduct ? selectedProduct.name : 'Aucun produit'"
                  title="Produit sélectionné"
                />

                <v-list-item
                  prepend-icon="mdi-warehouse"
                  :subtitle="selectedProduct ? `${selectedProduct.stock_quantity} unités` : '0 unité'"
                  title="Stock actuel"
                />
              </v-list>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="total-box pa-5 rounded-xl">
                <div class="text-caption text-medium-emphasis mb-2">
                  Nouveau stock estimé
                </div>

                <div class="text-h4 font-weight-bold">
                  {{ newStock }}
                </div>

                <div class="text-caption text-medium-emphasis">
                  unités après entrée
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- Historique -->
        <v-card class="premium-card rounded-xl" elevation="0">
          <div class="pa-5">
            <h2 class="text-h6 font-weight-bold">Historique des mouvements</h2>
            <p class="text-caption text-medium-emphasis">
              Dernières entrées de stock enregistrées
            </p>
          </div>

          <v-divider />

          <div v-if="loadingHistory" class="pa-8 text-center">
            <v-progress-circular color="primary" indeterminate />
            <p class="mt-4">Chargement de l’historique...</p>
          </div>

          <v-table v-else class="table-responsive">
            <thead>
              <tr>
                <th>Date</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Fournisseur</th>
                <th>Note</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="movement in stockMovements"
                :key="movement.id"
              >
                <td>{{ formatDate(movement.created_at) }}</td>

                <td class="font-weight-medium">
                  {{ movement.product_name || movement.product?.name || 'Produit' }}
                </td>

                <td>
                  <v-chip color="success" size="small" variant="tonal">
                    +{{ movement.quantity }}
                  </v-chip>
                </td>

                <td>
                  {{ movement.supplier || 'Non précisé' }}
                </td>

                <td>
                  {{ movement.note || '-' }}
                </td>
              </tr>
            </tbody>
          </v-table>

          <div
            v-if="!loadingHistory && stockMovements.length === 0"
            class="pa-8 text-center text-medium-emphasis"
          >
            Aucun mouvement de stock pour le moment.
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import api from '@/services/api'

  const products = ref([])
  const stockMovements = ref([])

  const saving = ref(false)
  const loadingHistory = ref(false)

  const successMessage = ref('')
  const errorMessage = ref('')

  const form = ref({
    product: null,
    quantity: 1,
    supplier: '',
    note: '',
  })

  const selectedProduct = computed(() => {
    return products.value.find(product => product.id === form.value.product)
  })

  const newStock = computed(() => {
    if (!selectedProduct.value) return 0

    return Number(selectedProduct.value.stock_quantity || 0) + Number(form.value.quantity || 0)
  })

  function formatDate (value) {
    if (!value) return 'Date inconnue'

    return new Date(value).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  async function fetchProducts () {
    try {
      const response = await api.get('products/')

      products.value = Array.isArray(response.data)
        ? response.data
        : response.data.results || []
    } catch (error) {
      errorMessage.value = 'Impossible de charger les produits.'
      console.error('Erreur produits:', error)
    }
  }
  async function fetchStockMovements () {
    loadingHistory.value = true

    try {
      const response = await api.get('products/stock/history/')

      console.log('Historique stock API:', response.data)

      if (Array.isArray(response.data)) {
        stockMovements.value = response.data
      } else if (response.data && Array.isArray(response.data.results)) {
        stockMovements.value = response.data.results
      } else {
        stockMovements.value = []
      }
    } catch (error) {
      errorMessage.value = 'Impossible de charger l’historique du stock.'
      console.error('Erreur historique stock:', error)
    } finally {
      loadingHistory.value = false
    }
  }

  function resetForm () {
    form.value = {
      product: null,
      quantity: 1,
      supplier: '',
      note: '',
    }
  }

  async function submitStockEntry () {
    successMessage.value = ''
    errorMessage.value = ''

    if (!form.value.product) {
      errorMessage.value = 'Veuillez choisir un produit.'
      return
    }

    if (!form.value.quantity || form.value.quantity <= 0) {
      errorMessage.value = 'La quantité doit être supérieure à 0.'
      return
    }

    saving.value = true

    try {
      const payload = {
        product: form.value.product,
        quantity: form.value.quantity,
      }

      if (form.value.supplier) {
        payload.supplier = form.value.supplier
      }

      if (form.value.note) {
        payload.note = form.value.note
      }

      api.post('products/stock/entry/', payload)

      successMessage.value = 'Entrée de stock enregistrée avec succès.'

      resetForm()

      await fetchProducts()
      await fetchStockMovements()
    } catch (error) {
      errorMessage.value = JSON.stringify(
        error.response?.data || 'Impossible d’enregistrer l’entrée de stock.',
      )

      console.error('Erreur entrée stock:', error)
    } finally {
      saving.value = false
    }
  }

  onMounted(async () => {
    await fetchProducts()
    await fetchStockMovements()
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

.total-box {
  background: #f5f7fb;
  border: 1px solid #eef0f4;
}
</style>
