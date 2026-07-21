<template>
  <div class="menu-container">
    <Menubar :model="items" class="main-menu">
      <template #end>
        <div class="user-section">
          <Button class="user-profile" text type="button" @click="toggleDropdown">
            <span class="user-avatar" aria-hidden="true">{{ userInitials }}</span>
            <span class="username">{{ userLabel }}</span>
            <i class="pi pi-chevron-down dropdown-icon" :class="{ rotated: showDropdown }"></i>
          </Button>

          <div v-if="showDropdown" class="dropdown-content">
            <div class="user-info">
              <div v-if="email" class="info-item">
                <i class="pi pi-envelope"></i>
                <span>{{ email }}</span>
              </div>
              <div v-if="legajo" class="info-item">
                <i class="pi pi-id-card"></i>
                <span>Legajo: {{ legajo }}</span>
              </div>
            </div>

            <Button
              class="logout-btn"
              text
              type="button"
              icon="pi pi-sign-out"
              label="Cerrar Sesión"
              @click="logout"
            />
          </div>
        </div>
      </template>
    </Menubar>

    <div class="color-gradient"></div>
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
const items = ref(getRutas(rutas))

const userLabel = computed(() => legajo || nombre || 'Usuario')
const userInitials = computed(() => {
  const value = String(nombre || legajo || 'Usuario').trim()
  const parts = value.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return value.slice(0, 2).toUpperCase()
})

const logout = () => {
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
  const userSection = document.querySelector('.user-section')
  if (!userSection?.contains(event.target as Node)) closeDropdown()
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
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
  padding: 0 10px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: #00a9bd !important;
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
  min-width: 0 !important;
  min-height: 34px !important;
  height: 34px !important;
  display: flex !important;
  align-items: center !important;
  gap: 7px !important;
  padding: 0 8px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #fff !important;
  box-shadow: none !important;
}

.user-profile:hover,
:deep(.user-profile.p-button:hover) {
  background: rgba(255, 255, 255, .13) !important;
  transform: none !important;
}

.user-avatar {
  width: 27px;
  height: 27px;
  flex: 0 0 27px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
  color: #008fa1;
  font-size: 10px;
  font-weight: 700;
}

.username {
  max-width: 128px;
  overflow: hidden;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  z-index: 1500;
  top: calc(100% + 4px);
  right: 0;
  min-width: 220px;
  overflow: hidden;
  border: 1px solid #dce5e9;
  background: #fff;
  box-shadow: 0 9px 24px rgba(18, 45, 57, .18);
  animation: dropdown-in .16s ease-out;
}

@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-info {
  padding: 7px 9px;
  border-bottom: 1px solid #e5ecef;
}

.info-item {
  min-height: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 5px;
  color: #4e6572;
  font-size: 11px;
}

.info-item i {
  width: 14px;
  color: #008fa1;
  font-size: 11px;
}

.info-item span {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn,
:deep(.logout-btn.p-button) {
  width: 100% !important;
  min-height: 34px !important;
  height: 34px !important;
  justify-content: flex-start !important;
  gap: 8px !important;
  padding: 0 12px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: #fff !important;
  color: #d92932 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  box-shadow: none !important;
}

.logout-btn:hover,
:deep(.logout-btn.p-button:hover) {
  background: #eafcfe !important;
  color: #008fa1 !important;
}

.color-gradient {
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #00b4b5, #00d4ff, #024da1, #91268f, #e30f72, #ff7a00, #ebbb1d, #97c93d, #00a65a, #00b4b5);
  background-size: 300% 100%;
  animation: fm-color-flow 22s linear infinite;
}

@keyframes fm-color-flow {
  from { background-position: 0 50%; }
  to { background-position: 100% 50%; }
}

.spacer {
  height: 30px;
  background: #f7f9fa;
}

:deep(.p-menubar-root-list) {
  gap: 0 !important;
}

:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content),
:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content .p-menubar-item-link) {
  min-height: 48px !important;
  height: 48px !important;
  border-radius: 0 !important;
}

:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content .p-menubar-item-link) {
  padding: 0 12px !important;
}

:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content .p-menubar-item-label) {
  color: #fff !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}

:deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content:hover) {
  background: rgba(255, 255, 255, .14) !important;
}

@media (max-width: 900px) {
  .username { display: none; }
  :deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content .p-menubar-item-link) {
    padding: 0 8px !important;
  }
}
</style>
