import { onBeforeUnmount, onMounted } from 'vue'
import { installAccordionSearchBehavior } from '@/utils/accordionSearchBehavior'

export function useGlobalAccordionSearch() {
  let removeBehavior = null

  onMounted(() => {
    removeBehavior = installAccordionSearchBehavior(document)
  })

  onBeforeUnmount(() => {
    removeBehavior?.()
    removeBehavior = null
  })
}
