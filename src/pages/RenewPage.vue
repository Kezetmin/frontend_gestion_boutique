<template>
  <div class="d-flex justify-center">
    <v-card
      class="pa-8 rounded-xl renew-page"
      elevation="0"
      max-width="700"
    >
      <v-icon
        class="mb-4"
        color="warning"
        icon="mdi-clock-alert-outline"
        size="70"
      />

      <h1 class="text-h4 font-weight-bold mb-3">
        {{
          isTrialExpired
            ? 'Votre essai est terminé'
            : 'Votre abonnement a expiré'
        }}
      </h1>

      <p class="text-body-1 text-medium-emphasis mb-6">
        {{
          isTrialExpired
            ? 'Votre période d’essai gratuite de 7 jours est terminée. Pour continuer à utiliser Ketz POS, veuillez renouveler votre abonnement.'
            : 'Votre abonnement est arrivé à expiration. Veuillez renouveler pour continuer à utiliser Ketz POS.'
        }}
      </p>

      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card class="pa-4 rounded-xl" variant="tonal">
            <div class="text-h6 font-weight-bold mb-2">
              Pack Basic
            </div>

            <div class="mb-2">
              Idéal pour petites boutiques
            </div>

            <div class="text-body-2">
              Produits, ventes, historique simple
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card
            class="pa-4 rounded-xl"
            color="primary"
            variant="tonal"
          >
            <div class="text-h6 font-weight-bold mb-2">
              Pack Pro
            </div>

            <div class="mb-2">
              Pour boutiques sérieuses
            </div>

            <div class="text-body-2">
              Inventaire, caisse avancée, multi-utilisateurs,
              crédits clients, rapports avancés
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-btn
        block
        class="mb-3"
        color="success"
        prepend-icon="mdi-whatsapp"
        size="large"
        @click="contactWhatsApp"
      >
        Renouveler sur WhatsApp
      </v-btn>

      <v-btn
        block
        variant="text"
        @click="logoutUser"
      >
        Se déconnecter
      </v-btn>
    </v-card>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { subscription } from '@/services/subscriptionState'
  function contactWhatsApp () {
    const phone = '237XXXXXXXXX'

    const message = encodeURIComponent(
      'Bonjour Ketz POS, mon essai gratuit est terminé et je souhaite renouveler mon abonnement.',
    )

    window.open(
      `https://wa.me/${phone}?text=${message}`,
      '_blank',
    )
  }

  const isTrialExpired = computed(() => {
    return subscription.value?.is_trial === true
  })

  function logoutUser () {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
</script>

<style scoped>
.renew-page {
  background: white;
  border: 1px solid #eef0f4;
}
</style>
