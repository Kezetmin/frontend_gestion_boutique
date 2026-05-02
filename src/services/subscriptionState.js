import { computed, ref } from 'vue'
import { getSubscriptionStatus } from './subscription'

export const subscription = ref(null)
export const subscriptionLoading = ref(false)

export const isPro = computed(() => {
  return subscription.value?.plan_name === 'Pro'
})

export const isBasic = computed(() => {
  return subscription.value?.plan_name === 'Basic'
})

export const isSubscriptionValid = computed(() => {
  return subscription.value?.is_valid === true
})

export const hasExpired = computed(() => {
  return subscription.value?.has_expired === true
})

export const subscriptionStatusLabel = computed(() => {
  if (!subscription.value) {
    return 'Aucun abonnement'
  }
  if (subscription.value.has_expired) {
    return 'Expiré'
  }
  if (subscription.value.is_valid) {
    return 'Actif'
  }

  return 'Inactif'
})

export async function loadSubscription () {
  subscriptionLoading.value = true

  try {
    subscription.value = await getSubscriptionStatus()
  } catch (error) {
    console.error('Erreur abonnement:', error)
    subscription.value = null
  } finally {
    subscriptionLoading.value = false
  }
}
