import { computed, ref } from 'vue'
import api from './api'

export const currentUser = ref(null)
export const userLoading = ref(false)

export const isOwner = computed(() => {
  return currentUser.value?.role === 'owner'
})

export const isManager = computed(() => {
  return currentUser.value?.role === 'manager'
})

export const isSeller = computed(() => {
  return currentUser.value?.role === 'seller'
})

export const canManageEmployees = computed(() => {
  return isOwner.value
})

export const canManageSubscription = computed(() => {
  return isOwner.value
})

export const canManageProducts = computed(() => {
  return isOwner.value || isManager.value
})

export const canManageStock = computed(() => {
  return isOwner.value || isManager.value
})

export async function loadCurrentUser () {
  userLoading.value = true

  try {
    const response = await api.get('accounts/profile/')
    currentUser.value = response.data
  } catch (error) {
    console.error('Erreur utilisateur connecté:', error)
    currentUser.value = null
  } finally {
    userLoading.value = false
  }
}
