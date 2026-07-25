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
        <div ref="userSectionRef" class="user-section">
          <Button
            class="user-profile"
            text
            type="button"
            aria-haspopup="menu"
            :aria-expanded="showDropdown"
            aria-controls="fm-user-menu"
            @click="toggleDropdown"
          >
            <span class="user-avatar" aria-hidden="true">{{ userInitials }}</span>
            <span class="user-profile-copy">
              <span class="username">{{ userLabel }}</span>
              <span class="user-caption">Mi cuenta</span>
            </span>
            <i
              class="pi pi-chevron-down dropdown-icon"
              :class="{ rotated: showDropdown }"
              aria-hidden="true"
            ></i>
          </Button>

          <div
            v-if="showDropdown"
            id="fm-user-menu"
            class="dropdown-content"
            role="menu"
            aria-label="Opciones de usuario"
          >
            <div class="account-summary">
              <span class="account-avatar" aria-hidden="true">{{ userInitials }}</span>
              <div class="account-summary__copy">
                <strong>{{ accountTitle }}</strong>
                <span>Sesión activa</span>
              </div>
            </div>

            <div class="user-info">
              <div v-if="legajo" class="info-item">
                <span class="info-icon" aria-hidden="true">
                  <i class="pi pi-id-card"></i>
                </span>
                <div class="info-copy">
                  <small>Legajo</small>
                  <span>{{ legajo }}</span>
                </div>
              </div>

              <div v-if="email" class="info-item">
                <span class="info-icon" aria-hidden="true">
                  <i class="pi pi-envelope"></i>
                </span>
                <div class="info-copy">
                  <small>Correo</small>
                  <span :title="email">{{ email }}</span>
                </div>
              </div>
            </div>

            <div class="logout-area">
              <Button
                class="logout-btn"
                text
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
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import router from '@/router'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { getRutas } from './rutas'

const authStore = useAuthStore()
const nombre = authStore.usuario?.nombre ?? ''
const email = authStore.usuario?.email ?? ''
const legajo = authStore.usuario?.legajo ?? ''
const rutas = authStore.rutas
const showDropdown = ref(false)
const userSectionRef = ref<HTMLElement | null>(null)
const items = ref(getRutas(rutas))

const userLabel = computed(() => legajo || nombre || 'Usuario')
const accountTitle = computed(() => nombre || (legajo ? `Usuario ${legajo}` : 'Usuario'))
const userInitials = computed(() => {
  const value = String(nombre || legajo || 'Usuario').trim()
  const parts = value.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return value.slice(0, 2).toUpperCase()
})

const logout = () => {
  closeDropdown()
  authStore.logout()
  router.push({ name: 'login2fa' })
}

const toggleDropdown = (event: MouseEvent) => {
  event.stopPropagation()
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
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
  box-shadow: 0 2px 9px rgba(19, 49, 61, .12);
}

.main-menu,
:deep(.main-menu.p-menubar) {
  min-height: 48px !important;
  height: 48px !important;
  padding: 0 12px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: #00a9bd !important;
}

:deep(.p-menubar-root-list) {
  height: 48px !important;
  align-items: stretch !important;
  gap: 0 !important;
}

:deep(.p-menubar-root-list > .p-menubar-item),
:deep(.p-menubar-root-list > .p-menuitem) {
  height: 48px !important;
}

:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content),
:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-content) {
  height: 48px !important;
  border-radius: 0 !important;
  background: transparent !important;
  transition: background-color .16s ease;
}

.fm-menu-link {
  display: flex !important;
  align-items: center !important;
  text-decoration: none !important;
  cursor: pointer;
}

.fm-menu-link--root {
  height: 48px !important;
  gap: 9px;
  padding: 0 15px !important;
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
  font-size: 9px;
}

:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content:hover),
:deep(.p-menubar-root-list > .p-menubar-item.p-focus > .p-menubar-item-content),
:deep(.p-menubar-root-list > .p-menubar-item.p-menubar-item-active > .p-menubar-item-content),
:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-content:hover),
:deep(.p-menubar-root-list > .p-menuitem.p-focus > .p-menuitem-content) {
  background: #0096aa !important;
}

/* Paneles de primer y segundo nivel: línea superior turquesa como referencia. */
:deep(.p-menubar-submenu),
:deep(.p-submenu-list) {
  min-width: 248px !important;
  width: max-content !important;
  max-width: 360px !important;
  padding: 0 !important;
  border: 1px solid #d9e2e7 !important;
  border-top: 3px solid #00a9bd !important;
  border-radius: 0 !important;
  background: #fff !important;
  box-shadow: 0 8px 22px rgba(18, 45, 57, .18) !important;
  overflow: visible !important;
  z-index: 3000 !important;
}

:deep(.p-menubar-submenu .p-menubar-submenu),
:deep(.p-submenu-list .p-submenu-list) {
  min-width: 278px !important;
  margin-top: -3px !important;
}

:deep(.p-menubar-submenu .p-menubar-item),
:deep(.p-submenu-list .p-menubar-item),
:deep(.p-submenu-list .p-menuitem) {
  min-height: 35px !important;
  height: auto !important;
}

:deep(.p-menubar-submenu .p-menubar-item-content),
:deep(.p-submenu-list .p-menubar-item-content),
:deep(.p-submenu-list .p-menuitem-content) {
  min-height: 35px !important;
  height: auto !important;
  border-radius: 0 !important;
  background: #fff !important;
  transition: background-color .14s ease;
}

.fm-menu-link--submenu {
  width: 100%;
  min-height: 35px !important;
  gap: 12px;
  padding: 8px 16px !important;
  color: #273b46 !important;
  background: transparent !important;
}

.fm-menu-link--submenu .fm-menu-label {
  flex: 1 1 auto;
  color: #273b46 !important;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.25;
  white-space: nowrap;
  opacity: 1 !important;
  visibility: visible !important;
}

.fm-menu-link--submenu .fm-menu-chevron {
  flex: 0 0 auto;
  margin-left: auto;
  color: #8da0aa !important;
  font-size: 9px;
}

:deep(.p-menubar-submenu .p-menubar-item-content:hover),
:deep(.p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content),
:deep(.p-menubar-submenu .p-menubar-item.p-menubar-item-active > .p-menubar-item-content),
:deep(.p-submenu-list .p-menubar-item-content:hover),
:deep(.p-submenu-list .p-menubar-item.p-focus > .p-menubar-item-content),
:deep(.p-submenu-list .p-menuitem-content:hover),
:deep(.p-submenu-list .p-menuitem.p-focus > .p-menuitem-content) {
  background: #dff7fa !important;
}

:deep(.p-menubar-submenu .p-menubar-item-content:hover .fm-menu-link--submenu),
:deep(.p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-link--submenu),
:deep(.p-menubar-submenu .p-menubar-item.p-menubar-item-active > .p-menubar-item-content .fm-menu-link--submenu),
:deep(.p-submenu-list .p-menubar-item-content:hover .fm-menu-link--submenu),
:deep(.p-submenu-list .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-link--submenu),
:deep(.p-submenu-list .p-menuitem-content:hover .fm-menu-link--submenu) {
  color: #007f91 !important;
  background: #dff7fa !important;
}

:deep(.p-menubar-submenu .p-menubar-item-content:hover .fm-menu-label),
:deep(.p-menubar-submenu .p-menubar-item-content:hover .fm-menu-chevron),
:deep(.p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-label),
:deep(.p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-chevron),
:deep(.p-submenu-list .p-menubar-item-content:hover .fm-menu-label),
:deep(.p-submenu-list .p-menubar-item-content:hover .fm-menu-chevron) {
  color: #007f91 !important;
}

.user-section {
  position: relative;
  height: 48px;
  display: flex;
  align-items: center;
  margin-left: auto;
}

.user-profile,
:deep(.user-profile.p-button) {
  min-width: 172px !important;
  min-height: 38px !important;
  height: 38px !important;
  display: flex !important;
  align-items: center !important;
  gap: 9px !important;
  padding: 0 10px 0 6px !important;
  border: 1px solid rgba(255, 255, 255, .20) !important;
  border-radius: 11px !important;
  background: rgba(0, 111, 127, .20) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(0, 77, 89, .10) !important;
  transition: background-color .16s ease, border-color .16s ease !important;
}

.user-profile:hover,
:deep(.user-profile.p-button:hover),
.user-profile[aria-expanded="true"],
:deep(.user-profile.p-button[aria-expanded="true"]) {
  border-color: rgba(255, 255, 255, .38) !important;
  background: rgba(0, 105, 120, .36) !important;
  transform: none !important;
}

.user-avatar {
  width: 29px;
  height: 29px;
  flex: 0 0 29px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
  color: #008fa1;
  font-size: 10px;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(0, 65, 76, .14);
}

.user-profile-copy {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}

.username {
  max-width: 112px;
  overflow: hidden;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-caption {
  color: rgba(255, 255, 255, .72);
  font-size: 9px;
  font-weight: 500;
  line-height: 1;
}

.dropdown-icon {
  color: #fff;
  font-size: 9px;
  transition: transform .18s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-content {
  position: absolute;
  z-index: 3100;
  top: calc(100% + 7px);
  right: 0;
  width: 286px;
  overflow: hidden;
  border: 1px solid #d9e3e7;
  border-top: 3px solid #00a9bd;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 15px 34px rgba(17, 48, 61, .23);
  animation: dropdown-in .16s ease-out;
}

@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-5px) scale(.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.account-summary {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  background: linear-gradient(135deg, #f2fcfd 0%, #e6f8fb 100%);
  border-bottom: 1px solid #dbeaec;
}

.account-avatar {
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #00a9bd;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(0, 126, 143, .23);
}

.account-summary__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-summary__copy strong {
  max-width: 190px;
  overflow: hidden;
  color: #183744;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-summary__copy span {
  color: #5a7681;
  font-size: 10px;
}

.user-info {
  display: grid;
  gap: 6px;
  padding: 11px 12px;
  background: #fff;
}

.info-item {
  min-height: 47px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 9px;
  border: 1px solid #edf1f3;
  border-radius: 7px;
  background: #fafcfd;
  color: #344f5b;
}

.info-icon {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #dff7fa;
  color: #008b9d;
}

.info-icon i {
  font-size: 12px;
}

.info-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-copy small {
  color: #82959d;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.info-copy span {
  max-width: 196px;
  overflow: hidden;
  color: #344f5b;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-area {
  padding: 9px 12px 11px;
  border-top: 1px solid #edf1f3;
  background: #fff;
}

.logout-btn,
:deep(.logout-btn.p-button) {
  width: 100% !important;
  min-height: 38px !important;
  height: 38px !important;
  justify-content: center !important;
  gap: 9px !important;
  padding: 0 12px !important;
  border: 1px solid #f1c9cc !important;
  border-radius: 7px !important;
  background: #fff7f7 !important;
  color: #d82331 !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  box-shadow: none !important;
}

.logout-btn:hover,
:deep(.logout-btn.p-button:hover) {
  border-color: #e99ba1 !important;
  background: #ffeded !important;
  color: #b91824 !important;
}

.menu-accent {
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #008fa1 0%, #00a9bd 50%, #26c6d5 100%);
}

.spacer {
  height: 30px;
  background: #f7f9fa;
}

@media (max-width: 900px) {
  .user-profile,
  :deep(.user-profile.p-button) {
    min-width: 0 !important;
  }

  .user-profile-copy {
    display: none;
  }

  .fm-menu-link--root {
    padding: 0 9px !important;
  }
}
</style>
