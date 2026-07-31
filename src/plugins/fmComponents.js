/**
 * fmComponents.js
 * Plugin único que registra globalmente todos los componentes Fm* de FieldManager.
 * Importar y usar con app.use(fmComponents) en main.js.
 *
 * Regla: todo componente Fm* nuevo debe agregarse aquí y en ningún otro lugar.
 */
import FmActionButton    from '@/components/shared/FmActionButton.vue'
import FmAlertDialog     from '@/components/shared/FmAlertDialog.vue'
import FmButton          from '@/components/shared/FmButton.vue'
import FmColumnFilter    from '@/components/shared/FmColumnFilter.vue'
import FmCompactSelect   from '@/components/shared/FmCompactSelect.vue'
import FmConfirmDialog   from '@/components/shared/FmConfirmDialog.vue'
import FmEmptyState      from '@/components/shared/FmEmptyState.vue'
import FmFilterShell     from '@/components/shared/FmFilterShell.vue'
import FmFormDialog      from '@/components/shared/FmFormDialog.vue'
import FmGridActions     from '@/components/shared/FmGridActions.vue'
import FmGridPaginator   from '@/components/shared/FmGridPaginator.vue'
import FmGridShell       from '@/components/shared/FmGridShell.vue'
import FmPanel           from '@/components/shared/FmPanel.vue'
import FmResponsivePage  from '@/components/shared/FmResponsivePage.vue'
import FmTypingLoader    from '@/components/shared/FmTypingLoader.vue'

/** @type {import('vue').Plugin} */
export const fmComponents = {
  install(app) {
    app.component('FmActionButton',   FmActionButton)
    app.component('FmAlertDialog',    FmAlertDialog)
    app.component('FmButton',         FmButton)
    app.component('FmColumnFilter',   FmColumnFilter)
    app.component('FmCompactSelect',  FmCompactSelect)
    app.component('FmConfirmDialog',  FmConfirmDialog)
    app.component('FmEmptyState',     FmEmptyState)
    app.component('FmFilterShell',    FmFilterShell)
    app.component('FmFormDialog',     FmFormDialog)
    app.component('FmGridActions',    FmGridActions)
    app.component('FmGridPaginator',  FmGridPaginator)
    app.component('FmGridShell',      FmGridShell)
    app.component('FmPanel',          FmPanel)
    app.component('FmResponsivePage', FmResponsivePage)
    app.component('FmTypingLoader',   FmTypingLoader)
  }
}

export default fmComponents
