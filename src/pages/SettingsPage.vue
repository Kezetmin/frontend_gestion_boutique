<template>
  <div>
    <div class="page-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          Paramètres
        </h1>

        <p class="text-body-1 text-medium-emphasis">
          Gestion de votre boutique
        </p>
      </div>
    </div>

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

    <v-card
      v-if="shop?.is_demo"
      class="pa-6 rounded-xl danger-card"
      elevation="0"
    >
      <div class="text-h6 font-weight-bold mb-2">
        Réinitialisation démo
      </div>

      <p class="text-body-2 text-medium-emphasis mb-4">
        Supprime ventes, produits, clients, inventaires
        pour recommencer une nouvelle démonstration.
      </p>

      <v-btn
        color="error"
        prepend-icon="mdi-delete-alert-outline"
        @click="dialog = true"
      >
        Réinitialiser démo
      </v-btn>
    </v-card>

    <v-card
      v-else
      class="pa-6 rounded-xl"
      elevation="0"
    >
      <div class="text-body-1">
        Aucun outil de démonstration disponible.
      </div>
    </v-card>

    <!-- Dialog confirmation -->
    <v-dialog
      v-model="dialog"
      max-width="500"
    >
      <v-card class="pa-5 rounded-xl">
        <h2 class="text-h6 font-weight-bold mb-3">
          Confirmation
        </h2>

        <p class="mb-4">
          Cette action supprimera toutes les données de démonstration.
        </p>

        <v-text-field
          v-model="confirmText"
          label="Tapez RESET pour confirmer"
          variant="outlined"
        />

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            @click="dialog = false"
          >
            Annuler
          </v-btn>

          <v-btn
            color="error"
            :disabled="confirmText !== 'RESET'"
            :loading="loading"
            @click="resetDemo"
          >
            Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import api from '@/services/api'

  const shop = ref(null)
  const dialog = ref(false)
  const confirmText = ref('')
  const loading = ref(false)

  const successMessage = ref('')
  const errorMessage = ref('')

  async function fetchShop () {
    try {
      const response = await api.get('shops/my-shop/')
      shop.value = response.data
    } catch (error) {
      console.error(error)
    }
  }

  async function resetDemo () {
    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''

    try {
      const response = await api.post('shops/demo-reset/')

      successMessage.value = response.data.message
      dialog.value = false
      confirmText.value = ''
    } catch (error) {
      errorMessage.value
        = error.response?.data?.error
          || 'Impossible de réinitialiser.'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchShop()
  })
</script>

<style scoped>
.danger-card {
  border: 1px solid #ffdddd;
  background: #fff8f8;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
