<template>
  <div class="empty-state text-center pa-8">
    <v-avatar class="mb-4" :color="color" size="72">
      <v-icon :icon="icon" size="38" />
    </v-avatar>

    <h3 class="text-h6 font-weight-bold mb-2">
      {{ title }}
    </h3>

    <p class="text-body-2 text-medium-emphasis mb-4">
      {{ message }}
    </p>

    <slot />
  </div>
</template>

<script setup>
  defineProps({
    icon: {
      type: String,
      default: 'mdi-inbox-outline',
    },
    title: {
      type: String,
      default: 'Aucune donnée',
    },
    message: {
      type: String,
      default: 'Les informations apparaîtront ici.',
    },
    color: {
      type: String,
      default: 'primary',
    },
  })
</script>

<style scoped>
.empty-state {
  background: #f8fafc;
  border-radius: 20px;
  border: 1px dashed #dbe3ef;
}
</style>
