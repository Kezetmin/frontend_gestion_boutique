<template>
  <div>
    <div class="d-flex justify-center">
      <v-card class="renew-card pa-8 rounded-xl" elevation="0" max-width="800">

        <div class="text-center mb-6">
          <v-avatar class="mb-4" color="error" size="72">
            <v-icon icon="mdi-alert-circle-outline" size="40" />
          </v-avatar>

          <v-alert class="mb-6" type="warning" variant="tonal">
            Votre abonnement est expiré, mais vos données sont conservées.
            Renouvelez simplement pour reprendre l’utilisation normale.
          </v-alert>

          <p class="text-body-1 text-medium-emphasis">
            Votre accès est limité. Renouvelez votre abonnement pour continuer
            à utiliser toutes les fonctionnalités de la boutique.
          </p>
        </div>

        <v-alert class="mb-6" type="warning" variant="tonal">
          Les données de votre boutique sont conservées. Il suffit de renouveler
          l’abonnement pour reprendre l’utilisation normale.
        </v-alert>

        <v-row class="mb-6">
          <v-col cols="12" md="6">
            <v-card class="pa-5 rounded-xl plan-card" elevation="0">
              <h2 class="text-h6 font-weight-bold mb-2">Renouveler Basic</h2>

              <p class="text-body-2 text-medium-emphasis mb-4">
                Continuer avec les fonctionnalités essentielles.
              </p>

              <div class="text-h5 font-weight-bold mb-4">
                5 000 FCFA / mois
              </div>

              <v-btn block class="action-btn" color="primary" variant="tonal">
                Renouveler Basic
              </v-btn>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="pa-5 rounded-xl plan-card pro-card" elevation="0">
              <h2 class="text-h6 font-weight-bold mb-2">Passer au Pro</h2>

              <p class="text-body-2 text-medium-emphasis mb-4">
                Débloquer les fonctions avancées et limites supérieures.
              </p>

              <div class="text-h5 font-weight-bold mb-4">
                10 000 FCFA / mois
              </div>

              <v-btn block class="action-btn" color="success" variant="flat">
                Activer Pro
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="mb-6" />

        <div class="text-center">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Pour le paiement au Cameroun, vous pouvez prévoir Mobile Money,
            Orange Money ou activation manuelle par l’administrateur.
          </p>

          <v-btn
            color="success"
            href="https://wa.me/237690322927"
            prepend-icon="mdi-whatsapp"
            size="large"
            target="_blank"
          >
            Renouveler via WhatsApp
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.renew-card,
.plan-card {
  background: white;
  border: 1px solid #eef0f4;
}

.pro-card {
  background: linear-gradient(135deg, #ecfdf5, #ffffff);
}
</style>
