<template>
  <div>
    <!-- Header -->
    <div class="page-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Vente</h1>
        <p class="text-body-1 text-medium-emphasis">
          Enregistrez une vente avec plusieurs produits, paiement cash ou crédit
        </p>
      </div>

      <v-chip color="primary" size="large" variant="tonal">
        Caisse active
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
      <!-- Zone gauche -->
      <v-col cols="12" md="7">
        <!-- Ajout produit au panier -->
        <v-card class="premium-card form-card pa-6 rounded-xl" elevation="0">
          <div class="mb-6">
            <h2 class="text-h6 font-weight-bold">Ajouter un produit</h2>
            <p class="text-caption text-medium-emphasis">
              Sélectionnez un produit, la quantité et le prix vendu
            </p>
          </div>

          <v-select
            v-model="form.product"
            class="mb-4"
            density="comfortable"
            item-title="name"
            item-value="id"
            :items="products"
            label="Produit vendu"
            prepend-inner-icon="mdi-package-variant"
            variant="outlined"
          />

          <v-text-field
            v-model.number="form.quantity"
            class="mb-4"
            density="comfortable"
            label="Quantité"
            min="1"
            prepend-inner-icon="mdi-counter"
            type="number"
            variant="outlined"
          />

          <v-text-field
            v-model.number="form.unit_price"
            class="mb-2"
            density="comfortable"
            hint="Modifiable si remise ou prix négocié"
            label="Prix vendu (FCFA)"
            min="0"
            persistent-hint
            prepend-inner-icon="mdi-cash"
            type="number"
            variant="outlined"
          />

          <div
            v-if="selectedProduct"
            class="text-caption text-medium-emphasis mb-4"
          >
            Prix normal :
            <strong>{{ formatFCFA(selectedProduct.sale_price) }}</strong>
            · Stock :
            <strong>{{ selectedProduct.stock_quantity }}</strong>
          </div>

          <v-btn
            block
            class="action-btn"
            color="primary"
            prepend-icon="mdi-cart-plus"
            size="large"
            @click="addToCart"
          >
            Ajouter au panier
          </v-btn>
        </v-card>

        <!-- Panier -->
        <v-card class="premium-card pa-4 rounded-xl mt-4" elevation="0">
          <div class="d-flex justify-space-between align-center mb-3">
            <h3 class="text-h6 font-weight-bold">Panier</h3>

            <v-chip color="primary" size="small" variant="tonal">
              {{ cartItems.length }} article(s)
            </v-chip>
          </div>

          <div class="table-responsive">
            <v-table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Qté</th>
                  <th>Prix</th>
                  <th>Total</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in cartItems" :key="index">
                  <td class="font-weight-medium">
                    {{ item.product_name }}
                  </td>

                  <td>{{ item.quantity }}</td>

                  <td>{{ formatFCFA(item.unit_price) }}</td>

                  <td class="font-weight-bold">
                    {{ formatFCFA(item.subtotal) }}
                  </td>

                  <td class="text-right">
                    <v-btn
                      color="error"
                      icon="mdi-delete-outline"
                      size="small"
                      variant="text"
                      @click="removeCartItem(index)"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <div
            v-if="cartItems.length === 0"
            class="pa-6 text-center text-medium-emphasis"
          >
            Aucun produit dans le panier.
          </div>
        </v-card>

        <!-- Paiement -->
        <v-card class="premium-card form-card pa-6 rounded-xl mt-4" elevation="0">
          <div class="mb-6">
            <h2 class="text-h6 font-weight-bold">Paiement</h2>
            <p class="text-caption text-medium-emphasis">
              Indiquez le client et le montant payé maintenant
            </p>
          </div>

          <div class="d-flex align-start ga-2 mb-4">
            <v-select
              v-model="form.customer"
              clearable
              density="comfortable"
              hint="Obligatoire si la vente n'est pas totalement payée"
              item-title="name"
              item-value="id"
              :items="customers"
              label="Client"
              persistent-hint
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
            />

            <v-btn
              class="mt-1"
              color="primary"
              icon="mdi-account-plus-outline"
              variant="tonal"
              @click="openCustomerDialog"
            />
          </div>

          <v-text-field
            v-model.number="form.amount_paid"
            density="comfortable"
            label="Montant payé maintenant"
            min="0"
            prepend-inner-icon="mdi-cash-check"
            type="number"
            variant="outlined"
          />

          <v-btn
            block
            class="action-btn mt-4"
            color="success"
            :loading="loading"
            prepend-icon="mdi-cash-register"
            size="large"
            @click="submitSale"
          >
            Encaisser la vente
          </v-btn>
        </v-card>
      </v-col>

      <!-- Résumé caisse -->
      <v-col cols="12" md="5">
        <v-card class="premium-card form-card pa-6 rounded-xl h-100" elevation="0">
          <div class="mb-6">
            <h2 class="text-h6 font-weight-bold">Résumé caisse</h2>
            <p class="text-caption text-medium-emphasis">
              Vérification avant validation
            </p>
          </div>

          <v-list lines="two">
            <v-list-item
              prepend-icon="mdi-cart-outline"
              :subtitle="`${cartItems.length} article(s)`"
              title="Articles dans le panier"
            />

            <v-list-item
              prepend-icon="mdi-account-outline"
              :subtitle="selectedCustomer ? selectedCustomer.name : 'Aucun client choisi'"
              title="Client"
            />
          </v-list>

          <v-divider class="my-5" />

          <div class="pa-4 rounded-xl total-box mb-4">
            <div class="text-caption text-medium-emphasis mb-1">
              Total vente
            </div>

            <div class="text-h4 font-weight-bold">
              {{ formatFCFA(totalAmount) }}
            </div>
          </div>

          <v-row>
            <v-col cols="12" sm="6">
              <v-card class="pa-4 rounded-xl mini-summary" elevation="0">
                <div class="text-caption text-medium-emphasis mb-1">
                  Payé
                </div>

                <div class="text-h6 font-weight-bold text-success">
                  {{ formatFCFA(amountPaid) }}
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6">
              <v-card class="pa-4 rounded-xl mini-summary" elevation="0">
                <div class="text-caption text-medium-emphasis mb-1">
                  Reste
                </div>

                <div class="text-h6 font-weight-bold text-error">
                  {{ formatFCFA(remainingAmount) }}
                </div>
              </v-card>
            </v-col>
          </v-row>

          <div class="mt-4">
            <v-chip
              :color="paymentStatusColor"
              size="large"
              variant="tonal"
            >
              {{ paymentStatusLabel }}
            </v-chip>
          </div>

          <v-alert
            v-if="remainingAmount > 0 && !form.customer"
            class="mt-4"
            type="info"
            variant="tonal"
          >
            Choisissez un client pour enregistrer une vente à crédit.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog nouveau client -->
    <v-dialog v-model="customerDialog" max-width="520">
      <v-card class="dialog-card pa-2">
        <v-card-title class="text-h5 font-weight-bold">
          Nouveau client
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="customerForm.name"
            class="mb-4"
            density="comfortable"
            label="Nom du client"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
          />

          <v-text-field
            v-model="customerForm.phone"
            class="mb-4"
            density="comfortable"
            label="Téléphone"
            prepend-inner-icon="mdi-phone-outline"
            variant="outlined"
          />

          <v-text-field
            v-model="customerForm.email"
            class="mb-4"
            density="comfortable"
            label="Email optionnel"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
          />

          <v-textarea
            v-model="customerForm.note"
            density="comfortable"
            label="Note optionnelle"
            prepend-inner-icon="mdi-note-text-outline"
            rows="3"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />

          <v-btn variant="text" @click="customerDialog = false">
            Annuler
          </v-btn>

          <v-btn
            color="primary"
            :loading="savingCustomer"
            @click="createCustomer"
          >
            Enregistrer client
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import api from '@/services/api'

  const products = ref([])
  const customers = ref([])
  const cartItems = ref([])

  const form = ref({
    product: null,
    quantity: 1,
    unit_price: 0,
    customer: null,
    amount_paid: 0,
  })

  const loading = ref(false)
  const successMessage = ref('')
  const errorMessage = ref('')

  const customerDialog = ref(false)
  const savingCustomer = ref(false)

  const customerForm = ref({
    name: '',
    phone: '',
    email: '',
    note: '',
  })

  const selectedProduct = computed(() => {
    return products.value.find(product => product.id === form.value.product)
  })

  const selectedCustomer = computed(() => {
    return customers.value.find(customer => customer.id === form.value.customer)
  })

  const totalAmount = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + Number(item.subtotal || 0)
    }, 0)
  })

  const amountPaid = computed(() => {
    return Number(form.value.amount_paid || 0)
  })

  const remainingAmount = computed(() => {
    const remaining = totalAmount.value - amountPaid.value
    return Math.max(remaining, 0)
  })

  const paymentStatus = computed(() => {
    if (totalAmount.value <= 0) return 'unpaid'

    if (amountPaid.value >= totalAmount.value) {
      return 'paid'
    }

    if (amountPaid.value > 0 && amountPaid.value < totalAmount.value) {
      return 'partial'
    }

    return 'unpaid'
  })

  const paymentStatusLabel = computed(() => {
    if (paymentStatus.value === 'paid') return 'Payé'
    if (paymentStatus.value === 'partial') return 'Paiement partiel'
    return 'Impayé'
  })

  const paymentStatusColor = computed(() => {
    if (paymentStatus.value === 'paid') return 'success'
    if (paymentStatus.value === 'partial') return 'warning'
    return 'error'
  })

  function formatFCFA (value) {
    const number = Number(value || 0)
    return `${number.toLocaleString('fr-FR')} FCFA`
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

  watch(
    () => form.value.product,
    productId => {
      const product = products.value.find(item => item.id === productId)

      form.value.unit_price = product ? Number(product.sale_price || 0) : 0
    },
  )

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

  async function fetchCustomers () {
    try {
      const response = await api.get('customers/')

      customers.value = Array.isArray(response.data)
        ? response.data
        : response.data.results || []
    } catch (error) {
      errorMessage.value = 'Impossible de charger les clients.'
      console.error('Erreur clients:', error)
    }
  }

  function addToCart () {
    errorMessage.value = ''
    successMessage.value = ''

    if (!form.value.product) {
      errorMessage.value = 'Veuillez choisir un produit.'
      return
    }

    if (!form.value.quantity || form.value.quantity <= 0) {
      errorMessage.value = 'La quantité doit être supérieure à 0.'
      return
    }

    if (!form.value.unit_price || form.value.unit_price <= 0) {
      errorMessage.value = 'Le prix vendu doit être supérieur à 0.'
      return
    }

    if (selectedProduct.value && form.value.quantity > selectedProduct.value.stock_quantity) {
      errorMessage.value = 'Stock insuffisant pour ce produit.'
      return
    }

    const existingItem = cartItems.value.find(
      item => item.product === form.value.product,
    )

    if (existingItem) {
      const newQuantity = existingItem.quantity + Number(form.value.quantity)

      if (selectedProduct.value && newQuantity > selectedProduct.value.stock_quantity) {
        errorMessage.value = 'La quantité totale dépasse le stock disponible.'
        return
      }

      existingItem.quantity = newQuantity
      existingItem.unit_price = Number(form.value.unit_price)
      existingItem.subtotal = existingItem.quantity * existingItem.unit_price
    } else {
      cartItems.value.push({
        product: form.value.product,
        product_name: selectedProduct.value.name,
        quantity: Number(form.value.quantity),
        unit_price: Number(form.value.unit_price),
        subtotal: Number(form.value.quantity) * Number(form.value.unit_price),
      })
    }

    form.value.product = null
    form.value.quantity = 1
    form.value.unit_price = 0
  }

  function removeCartItem (index) {
    cartItems.value.splice(index, 1)
  }

  function resetSaleForm () {
    form.value = {
      product: null,
      quantity: 1,
      unit_price: 0,
      customer: null,
      amount_paid: 0,
    }

    cartItems.value = []
  }

  async function submitSale () {
    successMessage.value = ''
    errorMessage.value = ''

    if (cartItems.value.length === 0) {
      errorMessage.value = 'Veuillez ajouter au moins un produit au panier.'
      return
    }

    if (form.value.amount_paid < 0) {
      errorMessage.value = 'Le montant payé ne peut pas être négatif.'
      return
    }

    if (remainingAmount.value > 0 && !form.value.customer) {
      errorMessage.value = 'Veuillez choisir un client pour une vente à crédit.'
      return
    }

    loading.value = true

    try {
      const payload = {
        customer: form.value.customer,
        amount_paid: amountPaid.value,
        items: cartItems.value.map(item => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      }

      await api.post('sales/', payload)

      successMessage.value = 'Vente enregistrée avec succès.'

      resetSaleForm()

      await fetchProducts()
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible d’enregistrer la vente.',
      )

      console.error('Erreur vente:', error)
    } finally {
      loading.value = false
    }
  }

  function openCustomerDialog () {
    customerForm.value = {
      name: '',
      phone: '',
      email: '',
      note: '',
    }

    customerDialog.value = true
  }

  async function createCustomer () {
    errorMessage.value = ''
    successMessage.value = ''

    if (!customerForm.value.name) {
      errorMessage.value = 'Le nom du client est obligatoire.'
      return
    }

    savingCustomer.value = true

    try {
      const response = await api.post('customers/', customerForm.value)

      successMessage.value = 'Client ajouté avec succès.'

      customerDialog.value = false

      await fetchCustomers()

      form.value.customer = response.data.id
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de créer ce client.',
      )
    } finally {
      savingCustomer.value = false
    }
  }

  onMounted(async () => {
    await fetchProducts()
    await fetchCustomers()
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

.total-box,
.mini-summary {
  background: #f5f7fb;
  border: 1px solid #eef0f4;
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
  min-width: 650px;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
