<template>
  <FmTypingLoader
    v-if="loadingUser"
    fullscreen
    title="Cargando perfil"
    :show-message="false"
  />

  <div v-else class="login-page">
    <span class="login-orbit login-orbit--outer" aria-hidden="true"></span>
    <span class="login-orbit login-orbit--inner" aria-hidden="true"></span>

    <main class="login-content" aria-label="Acceso Field Manager">
      <h1 class="login-title">
        <span class="login-title__field">Field</span>
        <span class="login-title__manager">Manager</span>
      </h1>

      <div class="login-secure-label">
        <span class="login-secure-label__line" aria-hidden="true"></span>
        <span>ACCESO SEGURO</span>
        <span class="login-secure-label__line" aria-hidden="true"></span>
      </div>

      <p class="login-description">
        Conectate con tu usuario corporativo<br />
        para ingresar al sistema.
      </p>

      <Button
        icon="pi pi-sign-in"
        label="CONECTAR"
        class="login-submit-button"
        type="button"
        @click="ingresar"
      />

      <p class="login-copyright">PERSONAL ARGENTINA © 2025</p>
    </main>
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()
const loadingUser = ref(false)

const ingresar = () => {
  window.location.href = `${window.location.origin}/pc/llamado.html`
}

onMounted(async () => {
  const loginCallback = new URLSearchParams(window.location.search).get('loginCallback')
  if (loginCallback !== 'true') return

  loadingUser.value = true

  try {
    const user = await authStore.fetchUserData()
    if (user?.autenticado) {
      await router.replace({ name: 'main' })
    }
  } finally {
    loadingUser.value = false
  }
})
</script>

<style scoped>
.login-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 28px;
  background:
    radial-gradient(circle at center, rgba(217, 244, 246, .58) 0, rgba(239, 248, 249, .74) 34%, rgba(246, 249, 250, .96) 67%, #f5f8f9 100%);
  color: #111d22;
  isolation: isolate;
}

.login-page::before {
  content: '';
  position: absolute;
  z-index: -2;
  inset: 0;
  background:
    radial-gradient(circle at 50% 46%, rgba(19, 184, 190, .08), transparent 37%),
    linear-gradient(180deg, rgba(255, 255, 255, .48), rgba(237, 247, 248, .34));
}

.login-orbit {
  position: absolute;
  z-index: -1;
  top: 50%;
  left: 50%;
  border: 1px solid rgba(16, 185, 190, .16);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.login-orbit--outer {
  width: min(82vw, 1110px);
  aspect-ratio: 1;
}

.login-orbit--inner {
  width: min(54vw, 720px);
  aspect-ratio: 1;
  border-color: rgba(16, 185, 190, .09);
}

.login-content {
  position: relative;
  z-index: 1;
  width: min(430px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transform: translateY(-5px);
}

.login-title {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(46px, 4.2vw, 58px);
  line-height: .98;
  font-weight: 700;
  letter-spacing: -.055em;
}

.login-title__field,
.login-title__manager {
  display: block;
}

.login-title__field {
  color: #101d22;
}

.login-title__manager {
  color: #08b5ba;
}

.login-secure-label {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(48px, 82px) auto minmax(48px, 82px);
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  color: #9aa5a9;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .34em;
  white-space: nowrap;
}

.login-secure-label__line {
  width: 100%;
  height: 1px;
  background: rgba(10, 181, 186, .38);
}

.login-description {
  margin: 30px 0 36px;
  color: #7a8589;
  font-size: 17px;
  line-height: 1.55;
  font-weight: 400;
}

.login-submit-button,
:deep(.login-submit-button.p-button) {
  width: 236px !important;
  height: 60px !important;
  min-height: 60px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px !important;
  padding: 0 24px !important;
  border: 0 !important;
  border-radius: 18px !important;
  background: #08b5ba !important;
  color: #fff !important;
  box-shadow: 0 14px 28px rgba(8, 181, 186, .18) !important;
  font-size: 16px !important;
  font-weight: 800 !important;
  letter-spacing: .09em !important;
  transition: transform .16s ease, background-color .16s ease, box-shadow .16s ease !important;
}

.login-submit-button:hover,
:deep(.login-submit-button.p-button:hover) {
  background: #079fa5 !important;
  box-shadow: 0 18px 34px rgba(8, 181, 186, .25) !important;
  transform: translateY(-1px);
}

.login-submit-button:focus-visible,
:deep(.login-submit-button.p-button:focus-visible) {
  outline: 3px solid rgba(8, 181, 186, .22) !important;
  outline-offset: 4px !important;
}

:deep(.login-submit-button .p-button-icon) {
  font-size: 15px !important;
}

.login-copyright {
  margin: 37px 0 0;
  color: #c0c6c8;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .2em;
}

@media (max-width: 760px) {
  .login-page {
    padding: 24px 18px;
  }

  .login-orbit--outer {
    width: 150vw;
  }

  .login-orbit--inner {
    width: 102vw;
  }

  .login-content {
    transform: none;
  }

  .login-title {
    font-size: 45px;
  }

  .login-secure-label {
    grid-template-columns: minmax(30px, 56px) auto minmax(30px, 56px);
    gap: 10px;
    margin-top: 24px;
    font-size: 10px;
    letter-spacing: .24em;
  }

  .login-description {
    margin: 26px 0 30px;
    font-size: 15px;
  }

  .login-submit-button,
  :deep(.login-submit-button.p-button) {
    width: min(236px, 82vw) !important;
    height: 56px !important;
    min-height: 56px !important;
  }

  .login-copyright {
    margin-top: 32px;
    font-size: 10px;
    letter-spacing: .16em;
  }
}

@media (max-height: 700px) and (min-width: 761px) {
  .login-content {
    transform: scale(.88);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-submit-button,
  :deep(.login-submit-button.p-button) {
    transition: none !important;
  }
}
</style>
