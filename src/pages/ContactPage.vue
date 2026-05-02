<template>
  <div>
    <div class="page-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Support & Contact</h1>
        <p class="text-body-1 text-medium-emphasis">
          Assistance, abonnement et accompagnement client
        </p>
      </div>

      <v-chip color="success" size="large" variant="tonal">
        Support disponible
      </v-chip>
    </div>

    <v-row>
      <v-col cols="12" md="7">
        <v-card class="premium-card pa-6 rounded-xl mb-4" elevation="0">
          <div class="d-flex align-center mb-5 ga-3">
            <v-avatar color="primary" size="60">
              <span class="text-white font-weight-bold text-h5">K</span>
            </v-avatar>

            <div>
              <div class="text-h5 font-weight-bold">
                Ketz Digital Solutions
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Solutions digitales pour commerces au Cameroun
              </div>
            </div>
          </div>

          <v-alert class="mb-5" type="info" variant="tonal">
            Pour toute assistance, renouvellement ou activation Pro, contactez-nous directement.
          </v-alert>

          <v-row>
            <v-col cols="12" sm="6">
              <div class="contact-box">
                <v-icon class="mb-2" color="success">mdi-whatsapp</v-icon>
                <div class="font-weight-bold">WhatsApp</div>
                <div class="text-caption text-medium-emphasis">
                  Support rapide
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="contact-box">
                <v-icon class="mb-2" color="primary">mdi-phone</v-icon>
                <div class="font-weight-bold">Téléphone</div>
                <div class="text-caption text-medium-emphasis">
                 237683182341
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="contact-box">
                <v-icon class="mb-2" color="primary">mdi-email-outline</v-icon>
                <div class="font-weight-bold">Email</div>
                <div class="text-caption text-medium-emphasis">
                  ketzdigital@gmail.com
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="contact-box">
                <v-icon class="mb-2" color="warning">mdi-map-marker-outline</v-icon>
                <div class="font-weight-bold">Localisation</div>
                <div class="text-caption text-medium-emphasis">
                  Kribi, Cameroun
                </div>
              </div>
            </v-col>
          </v-row>

          <div class="d-flex flex-wrap ga-3 mt-6">
            <v-btn
              color="success"
              prepend-icon="mdi-whatsapp"
              size="large"
              @click="openWhatsApp"
            >
              Contacter sur WhatsApp
            </v-btn>

            <v-btn
              color="primary"
              prepend-icon="mdi-crown-outline"
              size="large"
              to="/upgrade"
              variant="tonal"
            >
              Voir abonnement
            </v-btn>

            <v-btn
              color="warning"
              prepend-icon="mdi-refresh"
              size="large"
              to="/renew"
              variant="tonal"
            >
              Renouveler
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="premium-card pa-6 rounded-xl mb-4" elevation="0">
          <h2 class="text-h6 font-weight-bold mb-3">
            Horaires support
          </h2>

          <v-list lines="two">
            <v-list-item
              prepend-icon="mdi-clock-outline"
              subtitle="08h00 - 20h00"
              title="Lundi - Samedi"
            />

            <v-list-item
              prepend-icon="mdi-alert-circle-outline"
              subtitle="Assistance WhatsApp prioritaire"
              title="Urgence client"
            />

            <v-list-item
              prepend-icon="mdi-school-outline"
              subtitle="Accompagnement à l’utilisation de l’application"
              title="Formation"
            />
          </v-list>
        </v-card>

        <v-card class="premium-card pa-6 rounded-xl" elevation="0">
          <h2 class="text-h6 font-weight-bold mb-3">
            Services inclus
          </h2>

          <v-chip-group column>
            <v-chip color="primary" variant="tonal">Installation</v-chip>
            <v-chip color="success" variant="tonal">Formation</v-chip>
            <v-chip color="warning" variant="tonal">Support</v-chip>
            <v-chip color="info" variant="tonal">Abonnement</v-chip>
            <v-chip color="error" variant="tonal">Dépannage</v-chip>
          </v-chip-group>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="premium-card pa-6 rounded-xl mt-4" elevation="0">
      <h2 class="text-h6 font-weight-bold mb-4">
        Questions fréquentes
      </h2>

      <v-expansion-panels variant="accordion">
        <v-expansion-panel
          text="Contactez-nous sur WhatsApp. Après paiement, l’abonnement est réactivé par l’administrateur."
          title="Comment renouveler mon abonnement ?"
        />

        <v-expansion-panel
          text="Non. Les données restent conservées. Il suffit de renouveler pour reprendre l’utilisation normale."
          title="Mes données sont-elles perdues si l’abonnement expire ?"
        />

        <v-expansion-panel
          text="Oui. Le propriétaire peut créer des comptes vendeurs ou gérants selon le pack activé."
          title="Puis-je ajouter des vendeurs ?"
        />

        <v-expansion-panel
          text="Oui. L’interface est adaptée aux téléphones Android, tablettes et ordinateurs."
          title="L’application fonctionne-t-elle sur téléphone ?"
        />
      </v-expansion-panels>
    </v-card>
  </div>
</template>

<script setup>
  function openWhatsApp () {
    const phone = '237683182341'
    const message = encodeURIComponent(
      'Bonjour, j’ai besoin d’aide avec l’application KetzStock.',
    )

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }
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

.contact-box {
  background: #f8fafc;
  border: 1px solid #eef0f4;
  border-radius: 18px;
  padding: 18px;
  height: 100%;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
