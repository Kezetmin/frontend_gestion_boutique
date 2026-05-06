<template>
  <div>
    <!-- Header -->
    <div class="page-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Produits</h1>
        <p class="text-body-1 text-medium-emphasis">
          Gérez le stock, les prix et les produits de la boutique
        </p>
      </div>

      <div class="header-actions">
        <v-btn
          v-if="canManageProducts"
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="openCreateDialog"
        >
          Ajouter un produit
        </v-btn>

        <v-btn
          v-if="isPro"
          color="primary"
          prepend-icon="mdi-file-chart-outline"
          size="large"
          variant="flat"
        >
          Rapport avancé
        </v-btn>

        <v-btn
          v-else
          color="primary"
          prepend-icon="mdi-lock-outline"
          size="large"
          to="/upgrade"
          variant="tonal"
        >
          Passez au Pro
        </v-btn>
      </div>
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
      <v-col cols="12" lg="3" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">Total produits</div>
          <div class="text-h4 font-weight-bold">{{ products.length }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="3" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">Stock faible</div>
          <div class="text-h4 font-weight-bold">{{ lowStockCount }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="3" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">Disponibles</div>
          <div class="text-h4 font-weight-bold">{{ availableCount }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="3" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">Valeur stock</div>
          <div class="text-h5 font-weight-bold">{{ formatFCFA(stockValue) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recherche -->
    <v-card class="premium-card pa-4 rounded-xl mb-4" elevation="0">
      <v-row>
        <v-col cols="12" md="8">
          <v-text-field
            v-model="search"
            density="comfortable"
            hide-details
            label="Rechercher un produit"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="selectedCategoryFilter"
            clearable
            density="comfortable"
            hide-details
            item-title="name"
            item-value="id"
            :items="categories"
            label="Filtrer par catégorie"
            prepend-inner-icon="mdi-shape-outline"
            variant="outlined"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading -->
    <PageLoader
      v-if="loading"
      message="Chargement des produits..."
    />

    <!-- Tableau -->
    <v-card v-else class="premium-card rounded-xl" elevation="0">
      <v-table class="table-responsive">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Catégorie</th>
            <th>Prix achat</th>
            <th>Prix vente</th>
            <th>Stock</th>
            <th>État</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>
              <div class="font-weight-bold">{{ product.name }}</div>
              <div class="text-caption text-medium-emphasis">
                ID #{{ product.id }}
              </div>
            </td>

            <td>
              <v-chip
                v-if="product.category_name"
                color="primary"
                size="small"
                variant="tonal"
              >
                {{ product.category_name }}
              </v-chip>

              <v-chip
                v-else
                color="grey"
                size="small"
                variant="tonal"
              >
                Non classé
              </v-chip>
            </td>
            <td>{{ formatFCFA(product.purchase_price) }}</td>
            <td class="font-weight-bold">{{ formatFCFA(product.sale_price) }}</td>

            <td>
              <v-chip
                :color="product.stock_quantity <= product.low_stock_threshold ? 'warning' : 'success'"
                size="small"
                variant="tonal"
              >
                {{ product.stock_quantity }} en stock
              </v-chip>
            </td>

            <td>
              <v-chip
                v-if="product.stock_quantity <= product.low_stock_threshold"
                color="warning"
                size="small"
                variant="tonal"
              >
                Stock faible
              </v-chip>

              <v-chip
                v-else
                color="success"
                size="small"
                variant="tonal"
              >
                Disponible
              </v-chip>
            </td>

            <td class="text-right">
              <v-btn
                v-if="canManageProducts"
                color="primary"
                icon="mdi-pencil-outline"
                size="small"
                variant="text"
                @click="openEditDialog(product)"
              />

              <v-btn
                v-if="canManageProducts"
                color="error"
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                @click="openDeleteDialog(product)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>

      <EmptyState
        v-if="filteredProducts.length === 0"
        icon="mdi-package-variant"
        message="Ajoutez votre premier produit ou modifiez votre recherche."
        title="Aucun produit trouvé"
      >
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Ajouter un produit
        </v-btn>
      </EmptyState>
    </v-card>

    <!-- Dialog Ajouter / Modifier -->
    <v-dialog v-model="productDialog" max-width="650">
      <v-card class="dialog-card pa-2">
        <v-card-title class="text-h5 font-weight-bold">
          {{ isEditing ? 'Modifier le produit' : 'Ajouter un produit' }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                density="comfortable"
                label="Nom du produit"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="form.category"
                clearable
                density="comfortable"
                item-title="name"
                item-value="id"
                :items="categories"
                label="Catégorie"
                prepend-inner-icon="mdi-shape-outline"
                variant="outlined"
              />
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                variant="text"
                @click="categoryDialog = true"
              >
                Nouvelle catégorie
              </v-btn>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                density="comfortable"
                label="Description"
                rows="2"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.purchase_price"
                density="comfortable"
                label="Prix d'achat"
                type="number"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.sale_price"
                density="comfortable"
                label="Prix de vente"
                type="number"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.stock_quantity"
                density="comfortable"
                label="Quantité en stock"
                type="number"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.low_stock_threshold"
                density="comfortable"
                label="Seuil stock faible"
                type="number"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />

          <v-btn variant="text" @click="productDialog = false">
            Annuler
          </v-btn>

          <v-btn
            class="action-btn"
            color="primary"
            :loading="saving"
            @click="saveProduct"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Suppression -->
    <v-dialog v-model="deleteDialog" max-width="450">
      <v-card class="dialog-card pa-2">
        <v-card-title class="text-h5 font-weight-bold">
          Supprimer le produit
        </v-card-title>

        <v-card-text>
          Voulez-vous vraiment supprimer
          <strong>{{ selectedProduct?.name }}</strong> ?
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />

          <v-btn variant="text" @click="deleteDialog = false">
            Annuler
          </v-btn>

          <v-btn
            class="action-btn"
            color="error"
            :loading="deleting"
            @click="deleteProduct"
          >
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
  <v-dialog v-model="categoryDialog" max-width="500">
    <v-card class="pa-5 rounded-xl">
      <h2 class="text-h6 mb-4">
        Nouvelle catégorie
      </h2>

      <v-text-field
        v-model="newCategoryName"
        label="Nom catégorie"
        variant="outlined"
      />

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="categoryDialog = false"
        >
          Annuler
        </v-btn>

        <v-btn
          color="primary"
          :loading="categoryLoading"
          @click="createCategory"
        >
          Créer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import AppToast from '@/components/AppToast.vue'
  import EmptyState from '@/components/EmptyState.vue'
  import PageLoader from '@/components/PageLoader.vue'
  import api from '@/services/api'
  import { isPro } from '@/services/subscriptionState'
  import { canManageProducts } from '@/services/userState'
  const categoryDialog = ref(false)
  const newCategoryName = ref('')
  const categoryLoading = ref(false)
  const products = ref([])
  const search = ref('')
  const loading = ref(true)

  const successMessage = ref('')
  const errorMessage = ref('')

  const productDialog = ref(false)
  const deleteDialog = ref(false)

  const saving = ref(false)
  const deleting = ref(false)

  const isEditing = ref(false)
  const selectedProduct = ref(null)
  const categories = ref([])
  const selectedCategoryFilter = ref(null)

  const toast = ref(false)
  const toastMessage = ref('')
  const toastColor = ref('success')
  const toastIcon = ref('mdi-check-circle-outline')
  async function createCategory () {
    if (!newCategoryName.value.trim()) return

    categoryLoading.value = true
    errorMessage.value = ''

    try {
      const response = await api.post('products/categories/', {
        name: newCategoryName.value.trim(),
      })

      const newCategory
        = response.data.category || response.data

      // ajouter dans la liste affichée
      categories.value.push(newCategory)

      // sélectionner automatiquement la nouvelle catégorie
      form.value.category = newCategory.id

      newCategoryName.value = ''
      categoryDialog.value = false
    } catch (error) {
      errorMessage.value
        = error.response?.data?.error
          || 'Impossible de créer la catégorie.'
    } finally {
      categoryLoading.value = false
    }
  }

  async function fetchCategories () {
    try {
      const response = await api.get('products/categories/')

      categories.value = Array.isArray(response.data)
        ? response.data
        : response.data.results || []
    } catch (error) {
      console.error('Erreur chargement catégories:', error)
    }
  }

  function showToast (message,
                      color = 'success',
                      icon = 'mdi-check-circle-outline') {
                        toastMessage.value = message
                        toastColor.value = color
                        toastIcon.value = icon
                        toast.value = true
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

  const form = ref({
    name: '',
    description: '',
    purchase_price: 0,
    sale_price: 0,
    stock_quantity: 0,
    low_stock_threshold: 5,
    category: null,
  })

  function formatFCFA (value) {
    const number = Number(value || 0)
    return `${number.toLocaleString('fr-FR')} FCFA`
  }

  const filteredProducts = computed(() => {
    let data = products.value

    if (search.value) {
      const keyword = search.value.toLowerCase()

      data = data.filter(product =>
        product.name.toLowerCase().includes(keyword),
      )
    }

    if (selectedCategoryFilter.value) {
      data = data.filter(product =>
        product.category === selectedCategoryFilter.value,
      )
    }

    return data
  })

  const lowStockCount = computed(() => {
    return products.value.filter(
      product => product.stock_quantity <= product.low_stock_threshold,
    ).length
  })

  const availableCount = computed(() => {
    return products.value.filter(
      product => product.stock_quantity > product.low_stock_threshold,
    ).length
  })

  const stockValue = computed(() => {
    return products.value.reduce((total, product) => {
      return total + Number(product.purchase_price || 0) * Number(product.stock_quantity || 0)
    }, 0)
  })

  function resetForm () {
    form.value = {
      name: '',
      description: '',
      purchase_price: 0,
      sale_price: 0,
      stock_quantity: 0,
      low_stock_threshold: 5,
      category: null,
    }
  }

  async function fetchProducts () {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await api.get('products/')
      products.value = Array.isArray(response.data)
        ? response.data
        : response.data.results || []
    } catch (error) {
      errorMessage.value = 'Impossible de charger les produits.'
      console.error('Erreur produits:', error)
    } finally {
      loading.value = false
    }
  }

  function openCreateDialog () {
    isEditing.value = false
    selectedProduct.value = null
    resetForm()
    productDialog.value = true
  }

  function openEditDialog (product) {
    isEditing.value = true
    selectedProduct.value = product

    form.value = {
      name: product.name,
      description: product.description || '',
      purchase_price: product.purchase_price,
      sale_price: product.sale_price,
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      category: product.category || null,
    }

    productDialog.value = true
  }

  function openDeleteDialog (product) {
    selectedProduct.value = product
    deleteDialog.value = true
  }

  async function saveProduct () {
    successMessage.value = ''
    errorMessage.value = ''
    if (!form.value.name) {
      showToast(
        'Le nom du produit est obligatoire.',
        'error',
        'mdi-alert-circle-outline',
      )
      return
    }

    saving.value = true

    try {
      if (isEditing.value && selectedProduct.value) {
        await api.put(`products/${selectedProduct.value.id}/`, form.value)

        showToast(
          'Produit modifié avec succès.',
          'success',
          'mdi-check-circle-outline',
        )
      } else {
        await api.post('products/', form.value)

        showToast(
          'Produit ajouté avec succès.',
          'success',
          'mdi-check-circle-outline',
        )
      }

      productDialog.value = false
      await fetchProducts()
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Impossible d’effectuer cette action.',
      )

      showToast(
        message,
        'error',
        'mdi-alert-circle-outline',
      )
    } finally {
      saving.value = false
    }
  }

  async function deleteProduct () {
    if (!selectedProduct.value) return

    successMessage.value = ''
    errorMessage.value = ''
    deleting.value = true

    try {
      await api.delete(`products/${selectedProduct.value.id}/`)
      successMessage.value = 'Produit supprimé avec succès.'
      deleteDialog.value = false
      await fetchProducts()
    } catch (error) {
      errorMessage.value = JSON.stringify(error.response?.data || 'Erreur lors de la suppression.')
      console.error('Erreur suppression produit:', error)
    } finally {
      deleting.value = false
    }
  }

  onMounted(async () => {
    await fetchProducts()
    await fetchCategories()
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
  }

  .header-actions .v-btn {
    width: 100%;
  }
}
</style>
