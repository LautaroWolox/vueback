<template>
  <Dialog
    v-model:visible="showPopup"
    appendTo="body"
    modal
    :closable="false"
    :draggable="false"
    :resizable="false"
    class="fm-dialog emulation-confirm-dialog"
    :style="{ width: 'min(650px, calc(100vw - 32px))' }"
    @hide="cancelarConfirmacion"
  >
    <div class="emulation-confirm-body">
      <p class="emulation-confirm-message">
        Está por iniciar una sesión con los permisos del siguiente operador:
      </p>

      <div class="emulation-operator-card">
        <div class="emulation-operator-avatar" aria-hidden="true">
          <i class="pi pi-user"></i>
        </div>

        <div class="emulation-operator-data">
          <div class="emulation-operator-name">
            {{ selectedFullName }}
          </div>

          <dl class="emulation-operator-details">
            <div>
              <dt>Legajo</dt>
              <dd>{{ selectedLegajo || '—' }}</dd>
            </div>
            <div>
              <dt>Nombre</dt>
              <dd>{{ selectedName || '—' }}</dd>
            </div>
            <div>
              <dt>Apellido</dt>
              <dd>{{ selectedSurname || '—' }}</dd>
            </div>
          </dl>

          <div class="emulation-profiles">
            <span class="emulation-profiles__label">
              {{ selectedProfiles.length === 1 ? 'Perfil' : 'Perfiles' }}
            </span>
            <div class="emulation-profile-list">
              <span
                v-for="profile in selectedProfiles"
                :key="profile"
                class="emulation-profile-chip"
              >
                <i class="pi pi-shield"></i>
                {{ profile }}
              </span>
              <span v-if="!selectedProfiles.length" class="emulation-profile-empty">
                Sin perfil informado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <FmDialogActions
        secondary-label="CANCELAR"
        primary-label="ACEPTAR"
        @secondary="cancelarConfirmacion"
        @primary="emular"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import FmDialogActions from '@/components/shared/FmDialogActions.vue'
import router from '@/router'
import emulacionStore from '../store/emulacionStore.js'

const store = emulacionStore()
const toast = useToast()
const showPopup = ref(false)

const selectedOperator = computed(() => store.selectedOperator || {})
const selectedLegajo = computed(() => String(selectedOperator.value.legajo ?? ''))
const selectedName = computed(() => String(
  selectedOperator.value.nombre ??
  selectedOperator.value.name ??
  ''
))
const selectedSurname = computed(() => String(
  selectedOperator.value.apellido ??
  selectedOperator.value.surname ??
  ''
))
const selectedFullName = computed(() => {
  const fullName = `${selectedName.value} ${selectedSurname.value}`.trim()
  return fullName || `Operador ${selectedLegajo.value}`.trim()
})

const selectedProfiles = computed(() => {
  const rawProfiles =
    selectedOperator.value.perfiles ??
    selectedOperator.value.perfil ??
    selectedOperator.value.profile ??
    []

  const values = Array.isArray(rawProfiles)
    ? rawProfiles
    : String(rawProfiles || '').split(/[,;|]/)

  return values
    .map((profile) => {
      if (typeof profile === 'object' && profile !== null) {
        return profile.nombre ?? profile.descripcion ?? profile.label ?? profile.codigo ?? ''
      }
      return String(profile)
    })
    .map((profile) => profile.trim())
    .filter(Boolean)
})

const cancelarConfirmacion = () => {
  showPopup.value = false
  store.$clearConfirmation()
}

const emular = async () => {
  const operator = selectedOperator.value
  if (!operator?.legajo) return

  store.$setlegajoSelected(operator.legajo)
  showPopup.value = false
  store.toggleLoader = true

  await store.$emulate()

  if (store.error_message) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo emular',
      detail: store.error_message || 'No se pudo emular al operador seleccionado',
      life: 5000
    })
    store.toggleLoader = false
    return
  }

  await router.push({ name: 'main' })
  window.location.reload()
}

watch(() => store.confirmationVersion, () => {
  if (!store.selectedOperator) return
  showPopup.value = true
}, { immediate: true })
</script>

<style scoped>
:global(.emulation-confirm-dialog) {
  overflow: hidden !important;
}

:global(.emulation-confirm-dialog .p-dialog-header) {
  display: none !important;
}

:global(.emulation-confirm-dialog .p-dialog-content) {
  padding: 20px 22px !important;
  background: #fff !important;
}

:global(.emulation-confirm-dialog .p-dialog-footer) {
  padding: 12px 22px 18px !important;
  background: #fff !important;
}

.emulation-confirm-message {
  margin: 0 0 16px;
  color: #526c79;
  font-size: 13px;
}

.emulation-operator-card {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
  border: 1px solid #cfe0e6;
  border-left: 4px solid #00a9bd;
  border-radius: 4px;
  background: #f9fcfd;
}

.emulation-operator-avatar {
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #dff7fa;
  color: #007f90;
}

.emulation-operator-avatar i {
  font-size: 27px;
}

.emulation-operator-name {
  margin-bottom: 12px;
  color: #203947;
  font-size: 17px;
  font-weight: 700;
}

.emulation-operator-details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.emulation-operator-details div {
  min-width: 0;
}

.emulation-operator-details dt,
.emulation-profiles__label {
  margin-bottom: 3px;
  color: #718894;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.emulation-operator-details dd {
  margin: 0;
  color: #203947;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.emulation-profiles {
  margin-top: 14px;
}

.emulation-profile-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.emulation-profile-chip {
  min-height: 25px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border: 1px solid #a9dce3;
  border-radius: 13px;
  background: #eafcff;
  color: #176171;
  font-size: 11px;
  font-weight: 600;
  box-sizing: border-box;
}

.emulation-profile-chip i {
  color: #00a9bd;
  font-size: 10px;
}

.emulation-profile-empty {
  color: #718894;
  font-size: 11px;
  font-style: italic;
}

@media (max-width: 700px) {
  .emulation-operator-card {
    grid-template-columns: 1fr;
  }

  .emulation-operator-avatar {
    width: 50px;
    height: 50px;
  }

  .emulation-operator-details {
    grid-template-columns: 1fr;
  }
}
</style>
