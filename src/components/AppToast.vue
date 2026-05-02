<template>
  <v-snackbar
    v-model="visible"
    :color="color"
    location="top right"
    rounded="lg"
    timeout="3000"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2" :icon="icon" />
      <span>{{ message }}</span>
    </div>

    <template #actions>
      <v-btn
        icon="mdi-close"
        variant="text"
        @click="visible = false"
      />
    </template>
  </v-snackbar>
</template>

<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    show: Boolean,
    message: String,
    color: {
      type: String,
      default: 'success',
    },
    icon: {
      type: String,
      default: 'mdi-check-circle-outline',
    },
  })

  const emit = defineEmits(['update:show'])

  const visible = ref(false)

  watch(
    () => props.show,
    value => {
      visible.value = value
    },
  )

  watch(visible, value => {
    emit('update:show', value)
  })
</script>
