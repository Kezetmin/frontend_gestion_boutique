<template>
  <div class="d-flex justify-center">
    <v-card class="pa-8 rounded-xl upgrade-page" elevation="0" max-width="950">
      <div class="text-center mb-8">
        <v-icon
          class="mb-4"
          color="warning"
          icon="mdi-crown-outline"
          size="72"
        />

        <h1 class="text-h4 font-weight-bold mb-3">
          Passez au pack Pro
        </h1>

        <p class="text-body-1 text-medium-emphasis">
          Débloquez les fonctions avancées pour mieux contrôler vos ventes,
          vos employés, vos stocks et vos crédits clients.
        </p>
      </div>

      <v-alert
        class="mb-6"
        type="warning"
        variant="tonal"
      >
        Vous utilisez actuellement une fonctionnalité réservée au pack Pro.
      </v-alert>

      <v-row class="mb-6">
        <!-- BASIC -->
        <v-col cols="12" md="6">
          <v-card class="pa-5 rounded-xl plan-card" elevation="0">
            <div class="text-h6 font-weight-bold mb-1">
              Pack Basic
            </div>

            <div class="text-caption text-medium-emphasis mb-4">
              Pour démarrer simplement
            </div>

            <div class="text-h5 font-weight-bold mb-4">
              5 000 FCFA / mois
            </div>

            <div class="feature-item">✅ Ventes simples</div>
            <div class="feature-item">✅ Gestion produits limitée</div>
            <div class="feature-item">✅ Historique simple</div>
            <div class="feature-item">✅ 1 utilisateur</div>
            <div class="feature-item disabled">❌ Filtres avancés</div>
            <div class="feature-item disabled">❌ Employés supplémentaires</div>
            <div class="feature-item disabled">❌ Crédits clients avancés</div>
            <div class="feature-item">✅ Reçu simple</div>
            <div class="feature-item">✅ Caisse du jour uniquement</div>
            <div class="feature-item disabled">❌ Caisse avancée</div>
            <div class="feature-item disabled">❌ Filtres caisse 7j / 30j</div>
          </v-card>
        </v-col>

        <!-- PRO -->
        <v-col cols="12" md="6">
          <v-card class="pa-5 rounded-xl pro-card" elevation="0">
            <v-chip class="mb-3" color="primary" size="small">
              Recommandé
            </v-chip>

            <div class="text-h6 font-weight-bold mb-1">
              Pack Pro
            </div>

            <div class="text-caption text-medium-emphasis mb-4">
              Pour une boutique sérieuse
            </div>

            <div class="text-h5 font-weight-bold text-primary mb-4">
              10 000 FCFA / mois
            </div>

            <div class="feature-item">✅ Produits avec limites élevées</div>
            <div class="feature-item">✅ Gestion des employés</div>
            <div class="feature-item">✅ Entrées et historique de stock</div>
            <div class="feature-item">✅ Crédits clients</div>
            <div class="feature-item">✅ Filtres avancés</div>
            <div class="feature-item">✅ Rapports et bénéfices détaillés</div>
            <div class="feature-item">✅ Meilleur contrôle de la boutique</div>
            <div class="feature-item">✅ Reçus professionnels imprimables</div>
            <div class="feature-item">✅ Caisse avancée avec filtres</div>
            <div class="feature-item">✅ Suivi des encaissements</div>
            <div class="feature-item">✅ Contrôle par vendeur</div>
            <div class="feature-item">✅ Inventaires</div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12" md="4">
          <v-card class="pa-4 rounded-xl premium-card" elevation="0">
            <v-icon class="mb-2" color="primary" icon="mdi-account-group-outline" />
            <div class="font-weight-bold mb-1">Contrôlez vos employés</div>
            <div class="text-caption text-medium-emphasis">
              Suivez les ventes par vendeur et limitez les accès.
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-4 rounded-xl premium-card" elevation="0">
            <v-icon class="mb-2" color="success" icon="mdi-chart-line" />
            <div class="font-weight-bold mb-1">Analysez vos bénéfices</div>
            <div class="text-caption text-medium-emphasis">
              Voyez clairement ce que la boutique gagne réellement.
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-4 rounded-xl premium-card" elevation="0">
            <v-icon class="mb-2" color="warning" icon="mdi-account-cash-outline" />
            <div class="font-weight-bold mb-1">Gérez les crédits</div>
            <div class="text-caption text-medium-emphasis">
              Suivez les dettes clients et les paiements partiels.
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="pa-5 rounded-xl contact-card mb-6" elevation="0">
        <div class="font-weight-bold mb-2">
          Besoin d’activation ?
        </div>

        <div class="text-body-2 text-medium-emphasis">
          Contactez-nous sur WhatsApp pour activer le pack Pro sur votre boutique.
        </div>
      </v-card>

      <div class="d-flex flex-wrap justify-center ga-3">
        <v-btn
          class="action-btn"
          color="success"
          prepend-icon="mdi-whatsapp"
          size="large"
          @click="contactWhatsApp"
        >
          Activer Pro par WhatsApp
        </v-btn>

        <v-btn
          color="primary"
          size="large"
          to="/contact"
          variant="tonal"
        >
          Voir les contacts
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
  function contactWhatsApp () {
    const phone = '237683182341'
    const message = encodeURIComponent(
      'Bonjour, je souhaite activer le pack Pro pour mon application de gestion de boutique.',
    )

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }
</script>

<style scoped>
.upgrade-page {
  background: white;
  border: 1px solid #eef0f4;
}

.plan-card,
.premium-card,
.contact-card {
  background: #f8fafc;
  border: 1px solid #eef0f4;
}

.pro-card {
  background: #f5f7ff;
  border: 2px solid #1976d2;
}

.feature-item {
  margin-bottom: 10px;
  font-size: 14px;
}

.feature-item.disabled {
  color: #8a8f98;
}

.action-btn {
  font-weight: 700;
}
</style>
