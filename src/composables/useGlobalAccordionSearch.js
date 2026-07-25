import { onBeforeUnmount, onMounted } from 'vue'
import { installAccordionSearchBehavior } from '@/utils/accordionSearchBehavior'
import { installMigratedAccordionSearchBehavior } from '@/utils/migratedAccordionSearchBehavior'

export function useGlobalAccordionSearch() {
  let removeBehaviors = []

  onMounted(() => {
    removeBehaviors = [
      installAccordionSearchBehavior(document),
      installMigratedAccordionSearchBehavior(document)
    ]
  })

  onBeforeUnmount(() => {
    removeBehaviors.forEach((removeBehavior) => removeBehavior?.())
    removeBehaviors = []
  })
}
