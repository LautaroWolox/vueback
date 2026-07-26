import { watch } from 'vue'
import { useAuthStore } from '@/store/auth'

const EMPTY_VALUE = '\u00A0'
const normalizeText = (value) => String(value ?? '').trim()

const isUsefulName = (name, legajo) => {
  if (!name) return false
  if (name.toLowerCase() === legajo.toLowerCase()) return false
  return !/^[a-z]?\d+$/i.test(name)
}

const splitName = (displayName, storedSurname, legajo) => {
  const normalizedName = normalizeText(displayName)
  const normalizedSurname = normalizeText(storedSurname)

  if (!isUsefulName(normalizedName, legajo)) {
    return { nombre: '', apellido: normalizedSurname }
  }

  if (normalizedSurname) {
    const escapedSurname = normalizedSurname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const nombre = normalizedName
      .replace(new RegExp(`\\s+${escapedSurname}$`, 'i'), '')
      .trim()

    return {
      nombre: nombre || normalizedName,
      apellido: normalizedSurname
    }
  }

  if (normalizedName.includes(',')) {
    const [apellido, ...nombreParts] = normalizedName.split(',')
    return {
      nombre: nombreParts.join(',').trim(),
      apellido: apellido.trim()
    }
  }

  const parts = normalizedName.split(/\s+/).filter(Boolean)
  if (parts.length < 2) return { nombre: normalizedName, apellido: '' }

  return {
    nombre: parts.slice(0, -1).join(' '),
    apellido: parts.at(-1) ?? ''
  }
}

const ensureProfileField = (container, field, label) => {
  let wrapper = container.querySelector(`[data-fm-user-field="${field}"]`)

  if (!wrapper) {
    wrapper = document.createElement('div')
    wrapper.className = 'fm-user-profile-field'
    wrapper.dataset.fmUserField = field

    const fieldLabel = document.createElement('small')
    fieldLabel.textContent = label

    const fieldValue = document.createElement('span')
    fieldValue.className = 'fm-user-profile-field__value'

    wrapper.append(fieldLabel, fieldValue)
    container.append(wrapper)
  }

  return wrapper.querySelector('.fm-user-profile-field__value')
}

const setProfileFieldValue = (element, value) => {
  if (!element) return

  const visibleValue = normalizeText(value)
  const text = visibleValue || EMPTY_VALUE

  if (element.textContent !== text) element.textContent = text
  element.classList.toggle('is-empty', !visibleValue)

  if (visibleValue) element.setAttribute('title', visibleValue)
  else element.removeAttribute('title')
}

export const installUserMenuProfile = () => {
  const authStore = useAuthStore()

  const syncUserMenu = () => {
    const legajo = normalizeText(authStore.usuario?.legajo || authStore.legajo)
    const storedName = normalizeText(authStore.usuario?.nombre || authStore.nombre)
    const storedSurname = normalizeText(authStore.usuario?.apellido || authStore.apellido)
    const { nombre, apellido } = splitName(storedName, storedSurname, legajo)
    const fullName = [nombre, apellido].filter(Boolean).join(' ').trim()

    document.querySelectorAll('.user-profile .username').forEach((element) => {
      const label = fullName || legajo || 'Usuario'

      if (element.textContent !== label) element.textContent = label
      if (element.getAttribute('title') !== label) element.setAttribute('title', label)
    })

    document.querySelectorAll('.dropdown-content .info-copy').forEach((copy) => {
      copy.querySelector('.fm-user-full-name')?.remove()

      let extraFields = copy.querySelector('.fm-user-extra-fields')
      if (!extraFields) {
        extraFields = document.createElement('div')
        extraFields.className = 'fm-user-extra-fields'
        copy.append(extraFields)
      }

      const nombreElement = ensureProfileField(extraFields, 'nombre', 'Nombre')
      const apellidoElement = ensureProfileField(extraFields, 'apellido', 'Apellido')

      setProfileFieldValue(nombreElement, nombre)
      setProfileFieldValue(apellidoElement, apellido)
    })
  }

  const observer = new MutationObserver(syncUserMenu)
  observer.observe(document.body, { childList: true, subtree: true })

  watch(
    () => [
      authStore.nombre,
      authStore.apellido,
      authStore.legajo,
      authStore.usuario?.nombre,
      authStore.usuario?.apellido,
      authStore.usuario?.legajo
    ],
    syncUserMenu,
    { immediate: true }
  )

  if (authStore.autenticado) {
    void authStore.fetchUserData().finally(syncUserMenu)
  }
}