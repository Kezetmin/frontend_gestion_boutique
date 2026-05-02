import api from './api'

export async function getSubscriptionStatus () {
  const response = await api.get('subscriptions/my-subscription/')
  return response.data
}

export function isProPlan (subscription) {
  return (
    subscription?.plan === 'pro'
    || subscription?.plan_name === 'Pro'
  )
}

export function isBasicPlan (subscription) {
  return (
    subscription?.plan === 'basic'
    || subscription?.plan_name === 'Basic'
  )
}
