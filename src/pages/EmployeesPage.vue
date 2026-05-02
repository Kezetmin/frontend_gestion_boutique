<template>
  <div>
    <div class="page-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Employés</h1>
        <p class="text-body-1 text-medium-emphasis">
          Gérez les utilisateurs de la boutique
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus-outline"
        size="large"
        @click="openCreateDialog"
      >
        Ajouter employé
      </v-btn>
    </div>

    <v-alert v-if="successMessage" class="mb-4" type="success" variant="tonal">
      {{ successMessage }}
    </v-alert>

    <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>

    <v-row class="mb-4">
      <v-col cols="12" lg="4" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">Total membres</div>
          <div class="text-h4 font-weight-bold">{{ members.length }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">Actifs</div>
          <div class="text-h4 font-weight-bold text-success">{{ activeCount }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" sm="6">
        <v-card class="premium-card pa-5 rounded-xl" elevation="0">
          <div class="text-caption text-medium-emphasis mb-2">Inactifs</div>
          <div class="text-h4 font-weight-bold text-error">{{ inactiveCount }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="premium-card pa-4 rounded-xl mb-4" elevation="0">
      <v-text-field
        v-model="search"
        hide-details
        label="Rechercher par username, email ou rôle"
        prepend-inner-icon="mdi-magnify"
      />
    </v-card>

    <v-card v-if="loading" class="premium-card pa-8 rounded-xl" elevation="0">
      <div class="text-center">
        <v-progress-circular color="primary" indeterminate size="54" />
        <p class="mt-4 text-body-2 text-medium-emphasis">
          Chargement des employés...
        </p>
      </div>
    </v-card>

    <v-card v-else class="premium-card rounded-xl" elevation="0">
      <div class="table-responsive">
        <v-table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="member in filteredMembers" :key="member.id">
              <td>
                <div class="font-weight-bold">
                  {{ member.username || member.user?.username }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  ID #{{ member.id }}
                </div>
              </td>

              <td>
                {{ member.email || member.user?.email || '-' }}
              </td>

              <td>
                <v-chip :color="roleColor(member.role)" size="small" variant="tonal">
                  {{ roleLabel(member.role) }}
                </v-chip>
              </td>

              <td>
                <v-chip
                  :color="member.is_active === false ? 'error' : 'success'"
                  size="small"
                  variant="tonal"
                >
                  {{ member.is_active === false ? 'Inactif' : 'Actif' }}
                </v-chip>
              </td>

              <td class="text-right">
                <v-btn
                  color="primary"
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  @click="openEditDialog(member)"
                />

                <v-btn
                  v-if="member.is_active !== false"
                  color="error"
                  icon="mdi-account-off-outline"
                  size="small"
                  variant="text"
                  @click="openDeactivateDialog(member)"
                />

                <v-btn
                  v-else
                  color="success"
                  icon="mdi-account-check-outline"
                  size="small"
                  variant="text"
                  @click="reactivateMember(member)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div
        v-if="filteredMembers.length === 0"
        class="pa-8 text-center text-medium-emphasis"
      >
        Aucun employé trouvé.
      </div>
    </v-card>

    <!-- Dialog création -->
    <v-dialog v-model="createDialog" max-width="560">
      <v-card class="dialog-card pa-2">
        <v-card-title class="text-h5 font-weight-bold">
          Ajouter un employé
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="createForm.username"
            class="mb-4"
            label="Username"
            prepend-inner-icon="mdi-account-outline"
          />

          <v-text-field
            v-model="createForm.email"
            class="mb-4"
            label="Email"
            prepend-inner-icon="mdi-email-outline"
          />

          <v-text-field
            v-model="createForm.password"
            class="mb-4"
            label="Mot de passe initial"
            prepend-inner-icon="mdi-lock-outline"
            type="password"
          />

          <v-select
            v-model="createForm.role"
            item-title="label"
            item-value="value"
            :items="roles"
            label="Rôle"
            prepend-inner-icon="mdi-shield-account-outline"
          />
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />

          <v-btn variant="text" @click="createDialog = false">
            Annuler
          </v-btn>

          <v-btn color="primary" :loading="saving" @click="createMember">
            Créer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog modification -->
    <v-dialog v-model="editDialog" max-width="520">
      <v-card class="dialog-card pa-2">
        <v-card-title class="text-h5 font-weight-bold">
          Modifier employé
        </v-card-title>

        <v-card-text>
          <v-alert class="mb-4" type="info" variant="tonal">
            Vous pouvez modifier le rôle et le statut de cet utilisateur.
          </v-alert>

          <v-select
            v-model="editForm.role"
            class="mb-4"
            item-title="label"
            item-value="value"
            :items="roles"
            label="Rôle"
            prepend-inner-icon="mdi-shield-account-outline"
          />

          <v-switch
            v-model="editForm.is_active"
            color="success"
            label="Utilisateur actif"
          />
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />

          <v-btn variant="text" @click="editDialog = false">
            Annuler
          </v-btn>

          <v-btn color="primary" :loading="saving" @click="updateMember">
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog désactivation -->
    <v-dialog v-model="deactivateDialog" max-width="460">
      <v-card class="dialog-card pa-2">
        <v-card-title class="text-h5 font-weight-bold">
          Désactiver employé
        </v-card-title>

        <v-card-text>
          Voulez-vous désactiver
          <strong>{{ selectedMember?.username || selectedMember?.user?.username }}</strong> ?
          <br>
          Il ne pourra plus utiliser l’application.
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />

          <v-btn variant="text" @click="deactivateDialog = false">
            Annuler
          </v-btn>

          <v-btn color="error" :loading="saving" @click="deactivateMember">
            Désactiver
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import api from '@/services/api'

  const members = ref([])
  const search = ref('')
  const loading = ref(true)
  const saving = ref(false)

  const successMessage = ref('')
  const errorMessage = ref('')

  const createDialog = ref(false)
  const editDialog = ref(false)
  const deactivateDialog = ref(false)

  const selectedMember = ref(null)

  const roles = [
    { label: 'Gérant', value: 'manager' },
    { label: 'Vendeur', value: 'seller' },
  ]

  const createForm = ref({
    username: '',
    email: '',
    password: '',
    role: 'seller',
  })

  const editForm = ref({
    role: 'seller',
    is_active: true,
  })

  function roleLabel (role) {
    if (role === 'owner') return 'Propriétaire'
    if (role === 'manager') return 'Gérant'
    if (role === 'seller') return 'Vendeur'
    return role || 'Utilisateur'
  }

  function roleColor (role) {
    if (role === 'owner') return 'primary'
    if (role === 'manager') return 'success'
    if (role === 'seller') return 'warning'
    return 'grey'
  }

  const activeCount = computed(() => {
    return members.value.filter(member => member.is_active !== false).length
  })

  const inactiveCount = computed(() => {
    return members.value.filter(member => member.is_active === false).length
  })

  const filteredMembers = computed(() => {
    if (!search.value) return members.value

    const keyword = search.value.toLowerCase()

    return members.value.filter(member => {
      const username = member.username || member.user?.username || ''
      const email = member.email || member.user?.email || ''
      const role = member.role || ''

      return (
        username.toLowerCase().includes(keyword)
        || email.toLowerCase().includes(keyword)
        || role.toLowerCase().includes(keyword)
      )
    })
  })

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

  async function fetchMembers () {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await api.get('shops/members/')

      members.value = Array.isArray(response.data)
        ? response.data
        : response.data.results || []
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de charger les employés.',
      )
    } finally {
      loading.value = false
    }
  }

  function openCreateDialog () {
    createForm.value = {
      username: '',
      email: '',
      password: '',
      role: 'seller',
    }

    createDialog.value = true
  }

  async function createMember () {
    successMessage.value = ''
    errorMessage.value = ''

    if (!createForm.value.username || !createForm.value.password || !createForm.value.role) {
      errorMessage.value = 'Username, mot de passe et rôle sont obligatoires.'
      return
    }

    saving.value = true

    try {
      await api.post('shops/members/', createForm.value)

      successMessage.value = 'Employé ajouté avec succès.'
      createDialog.value = false

      await fetchMembers()
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de créer cet employé.',
      )
    } finally {
      saving.value = false
    }
  }

  function openEditDialog (member) {
    selectedMember.value = member

    editForm.value = {
      role: member.role || 'seller',
      is_active: member.is_active !== false,
    }

    editDialog.value = true
  }

  async function updateMember () {
    if (!selectedMember.value) return

    successMessage.value = ''
    errorMessage.value = ''
    saving.value = true

    try {
      await api.put(`shops/members/${selectedMember.value.id}/`, editForm.value)

      successMessage.value = 'Employé modifié avec succès.'
      editDialog.value = false

      await fetchMembers()
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de modifier cet employé.',
      )
    } finally {
      saving.value = false
    }
  }

  function openDeactivateDialog (member) {
    selectedMember.value = member
    deactivateDialog.value = true
  }

  async function deactivateMember () {
    if (!selectedMember.value) return

    successMessage.value = ''
    errorMessage.value = ''
    saving.value = true

    try {
      await api.delete(`shops/members/${selectedMember.value.id}/`)

      successMessage.value = 'Employé désactivé avec succès.'
      deactivateDialog.value = false

      await fetchMembers()
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de désactiver cet employé.',
      )
    } finally {
      saving.value = false
    }
  }

  async function reactivateMember (member) {
    successMessage.value = ''
    errorMessage.value = ''
    saving.value = true

    try {
      await api.put(`shops/members/${member.id}/`, {
        role: member.role,
        is_active: true,
      })

      successMessage.value = 'Employé réactivé avec succès.'

      await fetchMembers()
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Impossible de réactiver cet employé.',
      )
    } finally {
      saving.value = false
    }
  }

  onMounted(() => {
    fetchMembers()
  })
</script>

<style scoped>
.premium-card {
  background: white;
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
  min-width: 860px;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
