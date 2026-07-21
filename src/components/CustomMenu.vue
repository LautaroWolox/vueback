<template>
  <div class="menu-container">
    <Menubar :model="items" class="main-menu">
      <template #end>
        <div class="user-section">
          <div class="user-profile" @click="toggleDropdown">
            <span class="username">{{ nombre }}</span>
            <i class="pi pi-chevron-down dropdown-icon" :class="{ 'rotated': showDropdown }"></i>
          </div>
          
          <div v-if="showDropdown" class="dropdown-content">
            <div class="user-info">
              <div class="info-item">
                <i class="pi pi-envelope"></i>
                <span>{{ email }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-id-card"></i>
                <span>Legajo: {{ legajo }}</span>
              </div>
            </div>
            <div class="divider"></div>
            <button class="logout-btn" @click="logout">
              <i class="pi pi-sign-out"></i>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </template>
    </Menubar>
    <div class="color-gradient"></div>
    <div class="spacer"></div>
  </div>
</template>

<script setup lang="ts">
import Menubar from 'primevue/menubar';
import router from '@/router';
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import 'primeicons/primeicons.css';
import { getRutas } from './rutas';

const authStore = useAuthStore()

const nombre = authStore.usuario?.nombre ?? ''
const email = authStore.usuario?.email ?? ''
const legajo = authStore.usuario?.legajo ?? ''
const rutas = authStore.rutas;
const showDropdown = ref(false);
const items = ref( getRutas(rutas ) );

const logout = () => {
  authStore.logout()
  router.push({ name: 'login2fa' })
}

const toggleDropdown = (event: MouseEvent) => {
  event.stopPropagation();
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const handleClickOutside = (event: any) => {
  const userSection = document.querySelector('.user-section');
  const dropdown = document.querySelector('.dropdown-content');
  
  if (!userSection!.contains(event.target) && (!dropdown || !dropdown.contains(event.target))) {
    closeDropdown();
  }
};

onMounted(() =>  document.addEventListener('click', handleClickOutside) );

onUnmounted(() =>  document.removeEventListener('click', handleClickOutside) );
</script>

<style scoped>
.menu-container {
  width: 100%;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.main-menu {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  border: none;
  border-radius: 0;
  padding: 0 2rem;
  height: 60px;
}

.user-section {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: auto;
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.username {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  margin-right: 0.5rem;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  color: white;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-content {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  padding: 1.25rem;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
}

.info-item:hover {
  background: #f8f9fa;
}

.info-item:hover span {
  color: #28a745 !important;
}

.info-item i {
  margin-right: 0.75rem;
  color: #6c757d;
}

.info-item span {
  font-size: 0.9rem;
  color: #495057;
  transition: color 0.3s ease;
}

.divider {
  height: 1px;
  background: #e9ecef;
  margin: 0 1.25rem;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #dc3545;
  font-weight: 600;
}

.logout-btn:hover {
  background: #f8f9fa;
}

.logout-btn i {
  margin-right: 0.75rem;
}

.color-gradient {
  height: 5px;
  width: 100%;
  background: linear-gradient(
    to right,
    #3fc1cb 0%, #3bb9c2 2%, #009a97 16%,
    #97a96b 24%, #ebbb1d 32%, #f28cb9 48%,
    #e30f72 66%, #91268f 82%, #024da1 100%
  );
}

.spacer {
  height: 30px;
  background-color: #f8f9fa;
}

/* Estilos para el menú principal */
:deep(.p-menubar) {
  background: transparent;
  border: none;
  padding: 0;
}

:deep(.p-menubar .p-menubar-root-list) {
  gap: 0.5rem;
}

:deep(.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content .p-menuitem-link) {
  padding: 1rem 1.5rem;
  color: white !important;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 4px;
}

:deep(.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content .p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
}

:deep(.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content .p-menuitem-link .p-menuitem-text) {
  font-size: 0.95rem;
}

:deep(.p-menubar .p-submenu-list) {
  background: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  margin-top: 0.5rem;
}

:deep(.p-menubar .p-submenu-list .p-menuitem-content .p-menuitem-link) {
  padding: 0.75rem 1.25rem;
  color: #495057 !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem-content .p-menuitem-link:hover) {
  background: #f8f9fa !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem-content .p-menuitem-link .p-menuitem-text) {
  font-size: 0.9rem;
}
</style>