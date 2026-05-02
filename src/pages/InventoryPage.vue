<template>
  <div>
    <div class="page-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Inventaire</h1>
        <p class="text-body-1 text-medium-emphasis">
          Comparez le stock système avec le stock réel compté en boutique
        </p>
      </div>

      <v-btn
        color="primary"
        :loading="starting"
        prepend-icon="mdi-clipboard-list-outline"
        size="large"
        @click="startInventory"
      >
        Lancer inventaire
      </v-btn>
    </div>

    <v-alert v-if="successMessage" class="mb-4" type="success" variant="tonal">
      {{ successMessage }}
    </v-alert>

    <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>

    <v-alert class="mb-4" type="info" variant="tonal">
      Fonctionnalité Pro : l’inventaire permet de détecter les écarts entre le stock enregistré et le stock réel.
    </v-alert>

    <PageLoader
      v-if="loading"
      message="Chargement des inventaires..."
    />

    <template v-else>
      <v-card class="premium-card rounded-xl mb-6" elevation="0">
        <v-table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Créé par</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="inventory in inventories" :key="inventory.id">
              <td class="font-weight-bold">{{ inventory.title }}</td>

              <td>
                <v-chip
                  :color="inventory.status === 'validated' ? 'success' : 'warning'"
                  size="small"
                  variant="tonal"
                >
                  {{ statusLabel(inventory.status) }}
                </v-chip>
              </td>

              <td>{{ formatDate(inventory.created_at) }}</td>
              <td>{{ inventory.username || '-' }}</td>

              <td class="text-right">
                <v-btn
                  color="primary"
                  size="small"
                  variant="tonal"
                  @click="openInventory(inventory.id)"
                >
                  Ouvrir
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div
          v-if="inventories.length === 0"
          class="pa-8 text-center text-medium-emphasis"
        >
          Aucun inventaire trouvé.
        </div>
      </v-card>

      <v-card
        v-if="selectedInventory"
        class="premium-card pa-5 rounded-xl"
        elevation="0"
      >
        <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-4">
          <div>
            <h2 class="text-h6 font-weight-bold">
              {{ selectedInventory.title }}
            </h2>

            <p class="text-caption text-medium-emphasis">
              Statut : {{ statusLabel(selectedInventory.status) }}
            </p>
          </div>

          <v-btn
            v-if="selectedInventory.status !== 'validated'"
            color="success"
            :loading="validating"
            prepend-icon="mdi-check-circle-outline"
            @click="validateInventory"
          >
            Valider inventaire
          </v-btn>
        </div>

        <div class="table-responsive">
          <v-table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Stock système</th>
                <th>Stock réel</th>
                <th>Écart</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in selectedInventory.items" :key="item.id">
                <td class="font-weight-bold">{{ item.product_name }}</td>
                <td>{{ item.system_stock }}</td>

                <td>
                  <v-text-field
                    v-model.number="item.real_stock"
                    density="compact"
                    :disabled="selectedInventory.status === 'validated'"
                    hide-details
                    min="0"
                    style="max-width: 120px"
                    type="number"
                    variant="outlined"
                  />
                </td>

                <td>
                  <v-chip
                    :color="differenceColor(item)"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.real_stock - item.system_stock }}
                  </v-chip>
                </td>

                <td class="text-right">
                  <v-btn
                    color="primary"
                    :disabled="selectedInventory.status === 'validated'"
                    size="small"
                    variant="tonal"
                    @click="updateItem(item)"
                  >
                    Enregistrer
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>
    </template>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import PageLoader from '@/components/PageLoader.vue'
  import api from '@/services/api'

  const loading = ref(true)
  const starting = ref(false)
  const validating = ref(false)

  const inventories = ref([])
  const selectedInventory = ref(null)

  const successMessage = ref('')
  const errorMessage = ref('')

  function formatDate (value) {
    if (!value) return '-'

    return new Date(value).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  function statusLabel (status) {
    if (status === 'validated') return 'Validé'
    if (status === 'cancelled') return 'Annulé'
    return 'Brouillon'
  }

  function differenceColor (item) {
    const diff = Number(item.real_stock || 0) - Number(item.system_stock || 0)

    if (diff < 0) return 'error'
    if (diff > 0) return 'warning'
    return 'success'
  }

  function getErrorMessage (error, fallback = 'Une erreur est survenue.') {
    const data = error.response?.data

    if (!data) return fallback
    if (typeof data === 'string') return data
    if (data.error) return data.error
    if (data.detail) return data.detail

    return fallback
  }

  async function fetchInventories () {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await api.get('inventory/')
      inventories.value = response.data.results || []
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de charger les inventaires.',
      )
    } finally {
      loading.value = false
    }
  }

  async function startInventory () {
    successMessage.value = ''
    errorMessage.value = ''
    starting.value = true

    try {
      const response = await api.post('inventory/start/')

      successMessage.value = 'Inventaire lancé avec succès.'
      await fetchInventories()

      if (response.data.inventory?.id) {
        await openInventory(response.data.inventory.id)
      }
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de lancer l’inventaire.',
      )
    } finally {
      starting.value = false
    }
  }

  async function openInventory (id) {
    successMessage.value = ''
    errorMessage.value = ''

    try {
      const response = await api.get(`inventory/${id}/`)
      selectedInventory.value = response.data
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible d’ouvrir cet inventaire.',
      )
    }
  }

  async function updateItem (item) {
    successMessage.value = ''
    errorMessage.value = ''

    try {
      const response = await api.patch(`inventory/items/${item.id}/`, {
        real_stock: item.real_stock,
      })

      item.difference = response.data.item.difference
      successMessage.value = 'Stock réel mis à jour.'
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de mettre à jour cette ligne.',
      )
    }
  }

  async function validateInventory () {
    if (!selectedInventory.value) return

    successMessage.value = ''
    errorMessage.value = ''
    validating.value = true

    try {
      const response = await api.post(
        `inventory/${selectedInventory.value.id}/validate/`,
      )

      selectedInventory.value = response.data.inventory
      successMessage.value = 'Inventaire validé. Le stock a été mis à jour.'

      await fetchInventories()
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de valider cet inventaire.',
      )
    } finally {
      validating.value = false
    }
  }

  onMounted(() => {
    fetchInventories()
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

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.table-responsive table {
  min-width: 760px;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
