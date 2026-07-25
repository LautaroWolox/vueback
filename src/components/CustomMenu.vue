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
            <i class="pi pi-user user-profile-icon" aria-hidden="true"></i>
            <span class="username" :title="userLabel">{{ userLabel }}</span>
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
            <div class="user-info">
              <div class="info-item">
                <span class="info-icon" aria-hidden="true">
                  <i class="pi pi-id-card"></i>
                </span>
                <div class="info-copy">
                  <small>Legajo</small>
                  <span>{{ legajo || 'No disponible' }}</span>
                </div>
              </div>
            </div>

            <div class="logout-area">
              <Button
                class="logout-btn"
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
const nombre = authStore.usuario?.nombre ?? ''
const legajo = authStore.usuario?.legajo ?? ''
const rutas = authStore.rutas
const showDropdown = ref(false)
const userSectionRef = ref<HTMLElement | null>(null)
const items = ref(getRutas(rutas))

const userLabel = computed(() => nombre || legajo || 'Usuario')

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
  box-shadow: inset 0 -1px 0 rgba(0, 104, 119, .16);
  transition:
    background-color .13s ease,
    box-shadow .13s ease,
    transform .13s ease;
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
  font-size: 11px;
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
  background: #0095a9 !important;
  box-shadow:
    inset 0 3px 6px rgba(0, 66, 76, .28),
    inset 0 0 0 1px rgba(255, 255, 255, .08) !important;
  transform: translateY(1px);
}

:deep(.p-menubar-submenu),
:deep(.p-submenu-list) {
  min-width: 238px !important;
  width: max-content !important;
  max-width: 340px !important;
  padding: 0 !important;
  border: 1px solid #d8e1e5 !important;
  border-top: 3px solid #00a9bd !important;
  border-radius: 0 !important;
  background: #eef3f5 !important;
  box-shadow: 0 7px 18px rgba(18, 45, 57, .17) !important;
  overflow: visible !important;
  z-index: 3000 !important;
}

:deep(.p-menubar-submenu .p-menubar-submenu),
:deep(.p-submenu-list .p-submenu-list) {
  min-width: 266px !important;
  margin-top: -3px !important;
}

:deep(.p-menubar-submenu .p-menubar-item),
:deep(.p-submenu-list .p-menubar-item),
:deep(.p-submenu-list .p-menuitem),
:deep(.p-menubar-submenu .p-menubar-item-content),
:deep(.p-submenu-list .p-menubar-item-content),
:deep(.p-submenu-list .p-menuitem-content) {
  min-height: 31px !important;
  height: auto !important;
  border-radius: 0 !important;
}

:deep(.p-menubar-submenu .p-menubar-item-content),
:deep(.p-submenu-list .p-menubar-item-content),
:deep(.p-submenu-list .p-menuitem-content) {
  margin: 1px 2px !important;
  background: #fff !important;
  box-shadow:
    0 1px 1px rgba(18, 45, 57, .05),
    inset 0 -1px 0 #e6ecef;
  transition:
    background-color .13s ease,
    box-shadow .13s ease,
    transform .13s ease;
}

.fm-menu-link--submenu {
  width: 100%;
  min-height: 31px !important;
  gap: 9px;
  padding: 6px 12px !important;
  color: #273b46 !important;
  background: transparent !important;
}

.fm-menu-link--submenu .fm-menu-label {
  flex: 1 1 auto;
  color: #273b46 !important;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  white-space: nowrap;
}

.fm-menu-link--submenu .fm-menu-chevron {
  flex: 0 0 auto;
  margin-left: auto;
  color: #82959f !important;
  font-size: 8px;
}

:deep(.p-menubar-submenu .p-menubar-item-content:hover),
:deep(.p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content),
:deep(.p-menubar-submenu .p-menubar-item.p-menubar-item-active > .p-menubar-item-content),
:deep(.p-submenu-list .p-menubar-item-content:hover),
:deep(.p-submenu-list .p-menubar-item.p-focus > .p-menubar-item-content),
:deep(.p-submenu-list .p-menuitem-content:hover),
:deep(.p-submenu-list .p-menuitem.p-focus > .p-menuitem-content) {
  background: #dff7fa !important;
  box-shadow:
    inset 0 3px 6px rgba(26, 78, 90, .18),
    inset 0 0 0 1px rgba(0, 169, 189, .17) !important;
  transform: translateY(1px);
}

:deep(.p-menubar-submenu .p-menubar-item-content:hover .fm-menu-label),
:deep(.p-menubar-submenu .p-menubar-item-content:hover .fm-menu-chevron),
:deep(.p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-label),
:deep(.p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-chevron),
:deep(.p-submenu-list .p-menubar-item-content:hover .fm-menu-label),
:deep(.p-submenu-list .p-menubar-item-content:hover .fm-menu-chevron) {
  color: #007d8e !important;
}

.user-section {
  position: relative;
  height: 42px;
  display: flex;
  align-items: center;
  margin-left: auto;
}

.user-profile,
:deep(.user-profile.p-button) {
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

.user-profile:hover,
:deep(.user-profile.p-button:hover),
.user-profile[aria-expanded="true"],
:deep(.user-profile.p-button[aria-expanded="true"]) {
  border-color: rgba(255, 255, 255, .48) !important;
  background: rgba(0, 105, 120, .35) !important;
  box-shadow: inset 0 3px 6px rgba(0, 66, 76, .22) !important;
  transform: translateY(1px) !important;
}

.user-profile-icon {
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

.username {
  min-width: 0;
  max-width: 125px;
  flex: 1 1 auto;
  overflow: hidden;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  color: #fff;
  font-size: 8px;
  transition: transform .18s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-content {
  position: absolute;
  z-index: 3100;
  top: calc(100% + 6px);
  right: 0;
  width: 232px;
  overflow: hidden;
  border: 1px solid #d9e3e7;
  border-top: 3px solid #00a9bd;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 12px 26px rgba(17, 48, 61, .20);
  animation: dropdown-in .16s ease-out;
}

@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-info {
  padding: 10px;
  background: #fff;
}

.info-item {
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 9px;
  border: 1px solid #e4ecef;
  border-radius: 6px;
  background: #f8fbfc;
  color: #344f5b;
}

.info-icon {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #dff7fa;
  color: #008b9d;
}

.info-icon i {
  font-size: 13px;
}

.info-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-copy small {
  color: #7b919a;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.info-copy span {
  color: #304d59;
  font-size: 11px;
  font-weight: 500;
}

.logout-area {
  padding: 0 10px 10px;
  background: #fff;
}

.logout-btn,
:deep(.logout-btn.p-button) {
  width: 100% !important;
  min-height: 34px !important;
  height: 34px !important;
  justify-content: center !important;
  gap: 8px !important;
  padding: 0 10px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 6px !important;
  background: #fff !important;
  color: #008b9d !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  box-shadow: none !important;
}

.logout-btn:hover,
:deep(.logout-btn.p-button:hover) {
  border-color: #008fa1 !important;
  background: #e8fafd !important;
  color: #006f7d !important;
  box-shadow: inset 0 2px 5px rgba(26, 78, 90, .14) !important;
  transform: translateY(1px) !important;
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
  .user-profile,
  :deep(.user-profile.p-button) {
    min-width: 42px !important;
    width: 42px !important;
    padding: 0 9px !important;
  }

  .username {
    display: none;
  }

  .fm-menu-link--root {
    padding: 0 8px !important;
  }
}
</style>
