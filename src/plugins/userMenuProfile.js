import { watch } from 'vue'
import { useAuthStore } from '@/store/auth'

const normalizeText = (value) => String(value ?? '').trim()

const isUsefulName = (name, legajo) => {
  if (!name) return false
  if (name.toLowerCase() === legajo.toLowerCase()) return false
  return !/^[a-z]?\d+$/i.test(name)
}

export const installUserMenuProfile = () => {
  const authStore = useAuthStore()

  const syncUserMenu = () => {
    const legajo = normalizeText(authStore.usuario?.legajo || authStore.legajo)
    const name = normalizeText(authStore.usuario?.nombre || authStore.nombre)
    const visibleName = isUsefulName(name, legajo) ? name : ''

    document.querySelectorAll('.user-profile .username').forEach((element) => {
      const label = visibleName || legajo || 'Usuario'

      if (element.textContent !== label) element.textContent = label
      if (element.getAttribute('title') !== label) element.setAttribute('title', label)
    })

    document.querySelectorAll('.dropdown-content .info-copy').forEach((copy) => {
      let nameElement = copy.querySelector('.fm-user-full-name')

      if (!visibleName) {
        nameElement?.remove()
        return
      }

      if (!nameElement) {
        nameElement = document.createElement('span')
        nameElement.className = 'fm-user-full-name'
        copy.append(nameElement)
      }

      if (nameElement.textContent !== visibleName) nameElement.textContent = visibleName
      if (nameElement.getAttribute('title') !== visibleName) {
        nameElement.setAttribute('title', visibleName)
      }
    })
  }

  const observer = new MutationObserver(syncUserMenu)
  observer.observe(document.body, { childList: true, subtree: true })

  watch(
    () => [
      authStore.nombre,
      authStore.legajo,
      authStore.usuario?.nombre,
      authStore.usuario?.legajo
    ],
    syncUserMenu,
    { immediate: true }
  )

  if (authStore.autenticado) {
    void authStore.fetchUserData().finally(syncUserMenu)
  }
}
