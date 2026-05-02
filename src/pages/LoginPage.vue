<template>
  <v-container class="login-page fill-height pa-0" fluid>
    <v-row class="fill-height" no-gutters>
      <!-- Partie gauche -->
      <v-col
        class="d-none d-md-flex align-center justify-center login-left"
        cols="12"
        md="7"
      >
        <div class="text-center px-10">
          <h1 class="text-h3 font-weight-bold mb-4">
            Gestion Boutique Cameroun
          </h1>
          <v-img
            class="mx-auto mb-4"
            max-width="200"
            src="@/assets/logo.png"
          />

          <h2 class="text-center">Ketz STOCK</h2>
          <p class="text-center text-grey">
            Une solution Ketz Digital Solutions
          </p>

          <p class="text-h6 mb-6">
            Gérez vos produits, vos ventes, votre stock et vos bénéfices
            dans une interface moderne et simple.
          </p>

          <v-sheet
            class="mx-auto pa-6 rounded-xl"
            color="white"
            elevation="2"
            max-width="500"
          >
            <div class="text-subtitle-1 font-weight-medium mb-3">
              Pourquoi cette application ?
            </div>

            <div class="text-body-1 mb-2">- suivre le stock facilement</div>
            <div class="text-body-1 mb-2">- enregistrer les ventes rapidement</div>
            <div class="text-body-1 mb-2">- surveiller les produits en rupture</div>
            <div class="text-body-1">- connaître les bénéfices de la boutique</div>
          </v-sheet>
        </div>
      </v-col>

      <!-- Partie droite -->
      <v-col
        class="d-flex align-center justify-center login-right"
        cols="12"
        md="5"
      >
        <v-card class="pa-8 rounded-xl login-card" elevation="8" width="420">
          <div class="text-center mb-6">
            <h2 class="text-h4 font-weight-bold mb-2">Connexion</h2>
            <p class="text-body-1 text-medium-emphasis">
              Connecte-toi pour accéder à ta boutique
            </p>
          </div>

          <!-- Message d'erreur -->
          <v-alert
            v-if="errorMessage"
            class="mb-4"
            type="error"
            variant="tonal"
          >
            {{ errorMessage }}
          </v-alert>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="username"
              class="mb-4"
              density="comfortable"
              label="Nom d'utilisateur"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
            />

            <v-text-field
              v-model="password"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              class="mb-4"
              density="comfortable"
              label="Mot de passe"
              prepend-inner-icon="mdi-lock-outline"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-btn
              block
              class="mt-2"

              color="primary"
              :loading="loading"
              size="large"
              type="submit"
            >
              Se connecter
            </v-btn>
            <v-img
              class="mx-auto mb-4"
              max-width="200"
              src="@/assets/logo.png"
            />
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import api from '@/services/api'
  import { setToken } from '@/services/auth'

  // Routeur pour redirection après connexion
  const router = useRouter()

  // Champs du formulaire
  const username = ref('')
  const password = ref('')

  // États UI
  const showPassword = ref(false)
  const loading = ref(false)
  const errorMessage = ref('')

  // Fonction de connexion
  async function handleLogin () {
    errorMessage.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    // Petite validation simple
    if (!username.value || !password.value) {
      errorMessage.value = 'Veuillez remplir tous les champs.'
      return
    }

    loading.value = true

    try {
      // Requête vers le backend Django
      const response = await api.post('accounts/login/', {
        username: username.value,
        password: password.value,
      })

      // On suppose que le backend renvoie un token
      // Exemple : { "token": "abc123..." }
      const token = response.data.token

      // Sauvegarde du token dans le navigateur
      setToken(token)
      // Redirection vers dashboard
      router.push('/dashboard')
    } catch (error) {
      errorMessage.value = error.response && error.response.data ? 'Nom d’utilisateur ou mot de passe incorrect.' : 'Impossible de contacter le serveur.'
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.login-page {
  min-height: 100vh;
}

.login-left {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
}

.login-right {
  background-color: #f8fafc;
}

.login-card {
  max-width: 420px;
  width: 100%;
}
</style>
