<template>
  <div class="menu-container">
    <Menubar :model="items" class="main-menu">
      <template #item="{ item, props, hasSubmenu, root }">
        <a
          v-bind="props.action"
          class="fm-menu-link"
          :class="root ? 'fm-menu-link--root' : 'fm-menu-link--submenu'"
          @click="closeDropdown"
        >
          <span class="fm-menu-label">{{ item.label }}</span>
          <i
            v-if="hasSubmenu"
            class="pi fm-menu-chevron"
            :class="root ? 'pi-chevron-down' : 'pi-chevron-right'"
            aria-hidden="true"
          ></i>
        </a>
      </template>

      <template #end>
        <div ref="userSectionRef" class="fm-user-v3-section">
          <Button
            class="fm-user-v3-trigger"
            :class="{ 'fm-user-v3-trigger--named': hasPersonalIdentity }"
            text
            type="button"
            aria-haspopup="menu"
            :aria-expanded="showDropdown"
            aria-controls="fm-user-menu-v3"
            @click="toggleDropdown"
          >
            <span
              v-if="hasPersonalIdentity"
              class="fm-user-v3-avatar fm-user-v3-avatar--initials"
              aria-hidden="true"
            >{{ userInitials }}</span>
            <span v-else class="fm-user-v3-avatar" aria-hidden="true">
              <i class="pi pi-user"></i>
            </span>

            <span class="fm-user-v3-label" :title="userLabel">{{ userLabel }}</span>

            <i
              class="pi pi-chevron-down fm-user-v3-chevron"
              :class="{ 'fm-user-v3-chevron--open': showDropdown }"
              aria-hidden="true"
            ></i>
          </Button>

          <div
            v-if="showDropdown"
            id="fm-user-menu-v3"
            class="fm-user-v3-dropdown"
            role="menu"
            aria-label="Opciones de usuario"
          >
            <div class="fm-user-v3-body">
              <div class="fm-user-v3-card">
                <div class="fm-user-v3-legajo-row">
                  <span class="fm-user-v3-legajo-icon" aria-hidden="true">
                    <i class="pi pi-id-card"></i>
                  </span>
                  <div class="fm-user-v3-legajo-copy">
                    <small>Legajo</small>
                    <strong>{{ legajo || 'No disponible' }}</strong>
                  </div>
                </div>

                <div class="fm-user-v3-person-row">
                  <span class="fm-user-v3-person-icon" aria-hidden="true">
                    <i class="pi pi-users"></i>
                  </span>
                  <div class="fm-user-v3-person-copy">
                    <small>Nombre y Apellido</small>
                    <strong :title="fullName">{{ fullName }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="fm-user-v3-footer">
              <Button
                class="fm-user-v3-logout"
                outlined
                type="button"
                icon="pi pi-sign-out"
                label="Cerrar sesión"
                role="menuitem"
                @click="logout"
              />
            </div>
          </div>
        </div>
      </template>
    </Menubar>

    <div class="menu-accent"></div>
    <div class="spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Button from 'primevue/button'
import Menubar from 'primevue/menubar'
import router from '@/router'
import { useAuthStore } from '@/store/auth'
import { getRutas } from './rutas'

const authStore = useAuthStore()
const rutas = authStore.rutas
const showDropdown = ref(false)
const userSectionRef = ref<HTMLElement | null>(null)
const items = ref(getRutas(rutas))

const rawNombre = computed(() => String(authStore.usuario?.nombre ?? authStore.nombre ?? '').trim())
const rawApellido = computed(() => String(authStore.usuario?.apellido ?? authStore.apellido ?? '').trim())
const legajo = computed(() => String(authStore.usuario?.legajo ?? authStore.legajo ?? '').trim())

const cleanName = computed(() => {
  if (!rawNombre.value) return ''
  return rawNombre.value.toLocaleLowerCase() === legajo.value.toLocaleLowerCase()
    ? ''
    : rawNombre.value
})

const derivedNameParts = computed(() => {
  const name = cleanName.value
  const explicitSurname = rawApellido.value

  if (!name) return { givenName: '', surname: explicitSurname }

  if (explicitSurname) {
    const normalizedName = name.toLocaleLowerCase()
    const normalizedSurname = explicitSurname.toLocaleLowerCase()

    if (normalizedName === normalizedSurname) {
      return { givenName: '', surname: explicitSurname }
    }

    if (normalizedName.endsWith(` ${normalizedSurname}`)) {
      return {
        givenName: name.slice(0, -(explicitSurname.length + 1)).trim(),
        surname: explicitSurname
      }
    }

    return { givenName: name, surname: explicitSurname }
  }

  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return {
      givenName: parts.slice(0, -1).join(' '),
      surname: parts.at(-1) ?? ''
    }
  }

  return { givenName: name, surname: '' }
})

const displayGivenName = computed(() => derivedNameParts.value.givenName)
const displaySurname = computed(() => derivedNameParts.value.surname)

const fullName = computed(() =>
  [displayGivenName.value, displaySurname.value].filter(Boolean).join(' ').trim()
)

const hasPersonalIdentity = computed(() => Boolean(
  displayGivenName.value && displaySurname.value &&
  fullName.value.toLocaleLowerCase() !== legajo.value.toLocaleLowerCase()
))

const userInitials = computed(() => {
  if (!hasPersonalIdentity.value) return ''

  const first = displayGivenName.value.charAt(0)
  const second = displaySurname.value.charAt(0)
  return `${first}${second}`.toLocaleUpperCase()
})

const userLabel = computed(() => hasPersonalIdentity.value
  ? fullName.value
  : legajo.value || 'Usuario')

const closeDropdown = () => {
  showDropdown.value = false
}

const logout = () => {
  closeDropdown()
  authStore.logout()
  router.push({ name: 'login2fa' })
}

const toggleDropdown = (event: MouseEvent) => {
  event.stopPropagation()
  showDropdown.value = !showDropdown.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (!userSectionRef.value?.contains(event.target as Node)) closeDropdown()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeDropdown()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.menu-container {
  position: relative;
  width: 100%;
  box-shadow: 0 2px 8px rgba(19, 49, 61, .12);
}

.main-menu,
:deep(.main-menu.p-menubar) {
  min-height: 42px !important;
  height: 42px !important;
  padding: 0 10px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: #00a9bd !important;
}

:deep(.p-menubar-root-list) {
  height: 42px !important;
  align-items: stretch !important;
  gap: 0 !important;
}

:deep(.p-menubar-root-list > .p-menubar-item),
:deep(.p-menubar-root-list > .p-menuitem) {
  height: 42px !important;
}

:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content),
:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-content) {
  height: 42px !important;
  border-radius: 0 !important;
  background: transparent !important;
  transition: background-color .11s ease;
}

.fm-menu-link {
  display: flex !important;
  align-items: center !important;
  text-decoration: none !important;
  cursor: pointer;
}

.fm-menu-link--root {
  height: 42px !important;
  gap: 7px;
  padding: 0 12px !important;
  color: #fff !important;
}

.fm-menu-link--root .fm-menu-label,
.fm-menu-link--root .fm-menu-chevron {
  color: #fff !important;
}

.fm-menu-link--root .fm-menu-label {
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.fm-menu-link--root .fm-menu-chevron {
  font-size: 8px;
}

:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content:hover),
:deep(.p-menubar-root-list > .p-menubar-item.p-focus > .p-menubar-item-content),
:deep(.p-menubar-root-list > .p-menubar-item.p-menubar-item-active > .p-menubar-item-content),
:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-content:hover),
:deep(.p-menubar-root-list > .p-menuitem.p-focus > .p-menuitem-content) {
  background: #0098ab !important;
}

:deep(.p-menubar-submenu),
:deep(.p-submenu-list) {
  min-width: 238px !important;
  width: max-content !important;
  max-width: 360px !important;
  padding: 0 !important;
  border: 1px solid #d7e0e5 !important;
  border-top: 3px solid #00a9bd !important;
  border-radius: 0 !important;
  background: #fff !important;
  box-shadow: 0 5px 14px rgba(18, 45, 57, .16) !important;
  overflow: visible !important;
  z-index: 3000 !important;
}

:deep(.p-menubar-submenu .p-menubar-submenu),
:deep(.p-submenu-list .p-submenu-list) {
  min-width: 276px !important;
  margin-top: -3px !important;
}

:deep(.p-menubar-submenu .p-menubar-item),
:deep(.p-submenu-list .p-menubar-item),
:deep(.p-submenu-list .p-menuitem),
:deep(.p-menubar-submenu .p-menubar-item-content),
:deep(.p-submenu-list .p-menubar-item-content),
:deep(.p-submenu-list .p-menuitem-content) {
  min-height: 32px !important;
  height: auto !important;
  border-radius: 0 !important;
}

:deep(.p-menubar-submenu .p-menubar-item-content),
:deep(.p-submenu-list .p-menubar-item-content),
:deep(.p-submenu-list .p-menuitem-content) {
  margin: 0 !important;
  border-bottom: 1px solid #edf1f3 !important;
  background: #fff !important;
  box-shadow: none !important;
  transition: background-color .10s ease !important;
}

:deep(.p-menubar-submenu .p-menubar-item:last-child > .p-menubar-item-content),
:deep(.p-submenu-list .p-menubar-item:last-child > .p-menubar-item-content),
:deep(.p-submenu-list .p-menuitem:last-child > .p-menuitem-content) {
  border-bottom: 0 !important;
}

.fm-menu-link--submenu {
  width: 100%;
  min-height: 32px !important;
  gap: 9px;
  padding: 5px 12px !important;
  color: #334853 !important;
  background: transparent !important;
}

.fm-menu-link--submenu .fm-menu-label {
  flex: 1 1 auto;
  color: #334853 !important;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  white-space: nowrap;
}

.fm-menu-link--submenu .fm-menu-chevron {
  flex: 0 0 auto;
  margin-left: auto;
  color: #83959e !important;
  font-size: 9px;
}

:deep(.p-menubar-submenu .p-menubar-item-content:hover),
:deep(.p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content),
:deep(.p-menubar-submenu .p-menubar-item.p-menubar-item-active > .p-menubar-item-content),
:deep(.p-submenu-list .p-menubar-item-content:hover),
:deep(.p-submenu-list .p-menubar-item.p-focus > .p-menubar-item-content),
:deep(.p-submenu-list .p-menuitem-content:hover),
:deep(.p-submenu-list .p-menuitem.p-focus > .p-menuitem-content) {
  background: #d8f2f6 !important;
  box-shadow: none !important;
  transform: none !important;
}

:deep(.p-menubar-submenu .p-menubar-item-content:hover .fm-menu-label),
:deep(.p-menubar-submenu .p-menubar-item-content:hover .fm-menu-chevron),
:deep(.p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-label),
:deep(.p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-chevron),
:deep(.p-menubar-submenu .p-menubar-item.p-menubar-item-active > .p-menubar-item-content .fm-menu-label),
:deep(.p-menubar-submenu .p-menubar-item.p-menubar-item-active > .p-menubar-item-content .fm-menu-chevron),
:deep(.p-submenu-list .p-menubar-item-content:hover .fm-menu-label),
:deep(.p-submenu-list .p-menubar-item-content:hover .fm-menu-chevron) {
  color: #087f90 !important;
}

.fm-user-v3-section {
  position: relative;
  height: 42px;
  display: flex;
  align-items: center;
  margin-left: auto;
}

.fm-user-v3-trigger,
:deep(.fm-user-v3-trigger.p-button) {
  min-width: 160px !important;
  min-height: 34px !important;
  height: 34px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 0 10px !important;
  border: 1px solid rgba(255, 255, 255, .30) !important;
  border-radius: 9px !important;
  background: rgba(0, 111, 127, .20) !important;
  color: #fff !important;
  box-shadow: none !important;
}

.fm-user-v3-trigger--named,
:deep(.fm-user-v3-trigger--named.p-button) {
  min-width: 210px !important;
  max-width: 300px !important;
}

.fm-user-v3-trigger:hover,
:deep(.fm-user-v3-trigger.p-button:hover),
.fm-user-v3-trigger[aria-expanded="true"],
:deep(.fm-user-v3-trigger.p-button[aria-expanded="true"]) {
  border-color: rgba(255, 255, 255, .44) !important;
  background: rgba(0, 105, 120, .31) !important;
  box-shadow: none !important;
  transform: none !important;
}

.fm-user-v3-avatar {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, .17);
  color: #fff;
  font-size: 12px;
}

.fm-user-v3-avatar--initials {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .02em;
}

.fm-user-v3-label {
  min-width: 0;
  max-width: 125px;
  flex: 1 1 auto;
  overflow: hidden;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fm-user-v3-trigger--named .fm-user-v3-label {
  max-width: 210px;
}

.fm-user-v3-chevron {
  color: #fff;
  font-size: 8px;
  transition: transform .18s ease;
}

.fm-user-v3-chevron--open {
  transform: rotate(180deg);
}

.fm-user-v3-dropdown {
  position: absolute;
  z-index: 3100;
  top: calc(100% + 6px);
  right: 0;
  width: 292px;
  overflow: hidden;
  border: 1px solid #d9e3e7;
  border-top: 3px solid #00a9bd;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 12px 26px rgba(17, 48, 61, .20);
  animation: fm-user-v3-dropdown-in .16s ease-out;
}

@keyframes fm-user-v3-dropdown-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.fm-user-v3-body {
  padding: 10px;
  background: #fff;
}

.fm-user-v3-card {
  overflow: hidden;
  border: 1px solid #d9e3e7;
  border-radius: 7px;
  background: #f8fbfc;
}

.fm-user-v3-legajo-row,
.fm-user-v3-person-row {
  min-height: 58px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 8px 10px;
}

.fm-user-v3-person-row {
  border-top: 1px solid #e4ecef;
}

.fm-user-v3-legajo-icon,
.fm-user-v3-person-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #dff7fa;
  color: #008b9d;
}

.fm-user-v3-legajo-icon i,
.fm-user-v3-person-icon i {
  font-size: 18px;
}

.fm-user-v3-legajo-copy,
.fm-user-v3-person-copy {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.fm-user-v3-legajo-copy small,
.fm-user-v3-person-copy small {
  color: #6f8792;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .03em;
  text-transform: uppercase;
}

.fm-user-v3-legajo-copy strong,
.fm-user-v3-person-copy strong {
  min-height: 17px;
  overflow: hidden;
  color: #29424e;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fm-user-v3-footer {
  display: flex;
  justify-content: center;
  padding: 0 10px 10px;
  background: #fff;
}

.fm-user-v3-logout,
:deep(.fm-user-v3-logout.p-button) {
  width: 160px !important;
  min-width: 160px !important;
  max-width: 160px !important;
  min-height: 32px !important;
  height: 32px !important;
  justify-content: center !important;
  gap: 7px !important;
  padding: 0 10px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 7px !important;
  background: #fff !important;
  color: #008b9d !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  box-shadow: none !important;
}

.fm-user-v3-logout:hover,
:deep(.fm-user-v3-logout.p-button:hover) {
  border-color: #008fa1 !important;
  background: #e8fafd !important;
  color: #006f7d !important;
  box-shadow: none !important;
  transform: none !important;
}

.menu-accent {
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #008fa1 0%, #00a9bd 50%, #26c6d5 100%);
}

.spacer {
  height: 37px;
  background: #f7f9fa;
}

@media (max-width: 900px) {
  .fm-user-v3-trigger,
  :deep(.fm-user-v3-trigger.p-button),
  .fm-user-v3-trigger--named,
  :deep(.fm-user-v3-trigger--named.p-button) {
    min-width: 42px !important;
    width: 42px !important;
    padding: 0 9px !important;
  }

  .fm-user-v3-label {
    display: none;
  }

  .fm-menu-link--root {
    padding: 0 8px !important;
  }
}
</style>