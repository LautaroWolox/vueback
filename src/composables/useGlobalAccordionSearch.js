import { onBeforeUnmount, onMounted } from 'vue'
import { installAccordionSearchBehavior } from '@/utils/accordionSearchBehavior'
import { installMigratedAccordionSearchBehavior } from '@/utils/migratedAccordionSearchBehavior'
import { installBuscadorOtsInitialPanels } from '@/utils/buscadorOtsInitialPanels'

export function useGlobalAccordionSearch() {
  let removeBehaviors = []

  onMounted(() => {
    removeBehaviors = [
      installBuscadorOtsInitialPanels(document),
      installAccordionSearchBehavior(document),
      installMigratedAccordionSearchBehavior(document)
    ]
  })

  onBeforeUnmount(() => {
    removeBehaviors.forEach((removeBehavior) => removeBehavior?.())
    removeBehaviors = []
  })
}
