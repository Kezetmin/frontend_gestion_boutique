<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Catégories</h1>
        <p class="text-body-1 text-medium-emphasis">
          Organisez les produits par famille pour mieux gérer la boutique
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="large"
        @click="openCreateDialog"
      >
        Ajouter une catégorie
      </v-btn>
    </div>

    <v-alert v-if="successMessage" class="mb-4" type="success" variant="tonal">
      {{ successMessage }}
    </v-alert>

    <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>

    <v-card class="premium-card pa-4 rounded-xl mb-4" elevation="0">
      <v-text-field
        v-model="search"
        density="comfortable"
        hide-details
        label="Rechercher une catégorie"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
      />
    </v-card>

    <PageLoader
      v-if="loading"
      message="Chargement des catégories..."
    />

    <v-card v-else class="premium-card rounded-xl" elevation="0">
      <v-table class="table-responsive">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Date création</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="category in filteredCategories" :key="category.id">
            <td>
              <v-chip color="primary" size="small" variant="tonal">
                {{ category.name }}
              </v-chip>
            </td>

            <td>{{ category.description || '-' }}</td>

            <td>{{ formatDate(category.created_at) }}</td>

            <td class="text-right">
              <v-btn
                color="primary"
                icon="mdi-pencil-outline"
                size="small"
                variant="text"
                @click="openEditDialog(category)"
              />

              <v-btn
                color="error"
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                @click="openDeleteDialog(category)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>

    </v-card>

    <!-- Dialog ajout / modification -->
    <v-dialog v-model="categoryDialog" max-width="550">
      <v-card class="dialog-card pa-2">
        <v-card-title class="text-h5 font-weight-bold">
          {{ isEditing ? 'Modifier la catégorie' : 'Ajouter une catégorie' }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.name"
            class="mb-4"
            density="comfortable"
            label="Nom de la catégorie"
            variant="outlined"
          />

          <v-textarea
            v-model="form.description"
            density="comfortable"
            label="Description"
            rows="3"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />

          <v-btn variant="text" @click="categoryDialog = false">
            Annuler
          </v-btn>

          <v-btn class="action-btn" color="primary" :loading="saving" @click="saveCategory">
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog suppression -->
    <v-dialog v-model="deleteDialog" max-width="450">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-h5 font-weight-bold">
          Supprimer la catégorie
        </v-card-title>

        <v-card-text>
          Voulez-vous vraiment supprimer
          <strong>{{ selectedCategory?.name }}</strong> ?
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />

          <v-btn variant="text" @click="deleteDialog = false">
            Annuler
          </v-btn>

          <v-btn color="error" :loading="deleting" @click="deleteCategory">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <AppToast
    v-model:show="toast"
    :color="toastColor"
    :icon="toastIcon"
    :message="toastMessage"
  />
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import AppToast from '@/components/AppToast.vue'
  import PageLoader from '@/components/PageLoader.vue'
  import api from '@/services/api'

  const categories = ref([])
  const search = ref('')
  const loading = ref(true)
  const saving = ref(false)
  const deleting = ref(false)

  const successMessage = ref('')
  const errorMessage = ref('')

  const categoryDialog = ref(false)
  const deleteDialog = ref(false)
  const isEditing = ref(false)
  const selectedCategory = ref(null)

  const toast = ref(false)
  const toastMessage = ref('')
  const toastColor = ref('success')
  const toastIcon = ref('mdi-check-circle-outline')

  const form = ref({
    name: '',
    description: '',
  })

  const filteredCategories = computed(() => {
    if (!search.value) return categories.value

    const keyword = search.value.toLowerCase()

    return categories.value.filter(category =>
      category.name.toLowerCase().includes(keyword),
    )
  })
  function showToast (message,
                      color = 'success',
                      icon = 'mdi-check-circle-outline') {
                        toastMessage.value = message
                        toastColor.value = color
                        toastIcon.value = icon
                        toast.value = true
                      }

  function formatDate (value) {
    if (!value) return '-'

    return new Date(value).toLocaleDateString('fr-FR')
  }

  function resetForm () {
    form.value = {
      name: '',
      description: '',
    }
  }

  async function fetchCategories () {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await api.get('products/categories/')

      categories.value = Array.isArray(response.data)
        ? response.data
        : response.data.results || []
    } catch (error) {
      errorMessage.value = 'Impossible de charger les catégories.'
      console.error('Erreur catégories:', error)
    } finally {
      loading.value = false
    }
  }

  function openCreateDialog () {
    isEditing.value = false
    selectedCategory.value = null
    resetForm()
    categoryDialog.value = true
  }

  function openEditDialog (category) {
    isEditing.value = true
    selectedCategory.value = category

    form.value = {
      name: category.name,
      description: category.description || '',
    }

    categoryDialog.value = true
  }

  function openDeleteDialog (category) {
    selectedCategory.value = category
    deleteDialog.value = true
  }

  async function saveCategory () {
    successMessage.value = ''
    errorMessage.value = ''

    if (!form.value.name) {
      errorMessage.value = 'Le nom de la catégorie est obligatoire.'
      return
    }

    saving.value = true

    try {
      if (isEditing.value && selectedCategory.value) {
        await api.put(`products/categories/${selectedCategory.value.id}/`, form.value)
        successMessage.value = 'Catégorie modifiée avec succès.'
      } else {
        await api.post('products/categories/', form.value)
        showToast('Produit ajouté avec succès.')
      }

      categoryDialog.value = false
      await fetchCategories()
    } catch (error) {
      errorMessage.value = JSON.stringify(
        error.response?.data || 'Erreur lors de l’enregistrement.',
      )
      showToast(
        'Impossible d’enregistrer le produit.',
        'error',
        'mdi-alert-circle-outline',
      )
    } finally {
      saving.value = false
    }
  }

  async function deleteCategory () {
    if (!selectedCategory.value) return

    successMessage.value = ''
    errorMessage.value = ''
    deleting.value = true

    try {
      await api.delete(`products/categories/${selectedCategory.value.id}/`)
      successMessage.value = 'Catégorie supprimée avec succès.'
      deleteDialog.value = false
      await fetchCategories()
    } catch (error) {
      errorMessage.value = JSON.stringify(
        error.response?.data || 'Erreur lors de la suppression.',
      )
    } finally {
      deleting.value = false
    }
  }

  onMounted(() => {
    fetchCategories()
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
</style>
