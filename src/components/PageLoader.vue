<template>
  <v-card class="pa-8 rounded-xl premium-card" elevation="0">
    <div class="text-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="54"
      />

      <p class="mt-4 text-body-2 text-medium-emphasis">
        {{ message }}
      </p>
    </div>
  </v-card>
</template>

<script setup>
  defineProps({
    message: {
      type: String,
      default: 'Chargement en cours...',
    },
  })
</script>

<style scoped>
.premium-card {
  background: white;
  border: 1px solid #eef0f4;
}
</style>
