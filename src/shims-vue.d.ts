declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module '@/services/auth'
declare module '@/services/subscriptionState'
declare module '@/services/*'