<template>
  <FmTypingLoader
    v-if="loadingUser"
    fullscreen
    title="Cargando perfil"
    :show-message="false"
  />

  <div v-else class="login-page">
    <main class="login-main">
      <section class="login-shell" aria-label="Acceso Field Manager">
        <div class="login-brand-panel">
          <div class="login-logo" aria-hidden="true">
            <span>FM</span>
          </div>

          <h1>Field Manager</h1>
          <span class="login-eyebrow">Personal Argentina</span>
        </div>

        <div class="login-card">
          <span class="login-chip">
            <i class="pi pi-shield"></i>
            Acceso seguro
          </span>

          <div class="login-card-title">
            <h2>Bienvenido</h2>
            <p>Conectate con tu usuario corporativo para ingresar al sistema.</p>
          </div>

          <Button
            icon="pi pi-sign-in"
            label="CONECTAR"
            class="login-submit-button"
            type="button"
            @click="ingresar"
          />
        </div>
      </section>
    </main>

    <footer class="footer-fm">
      <div class="footer-copyright">
        © Copyright | <a href="#" class="footer-link">Personal Argentina | v. 1.0.0</a>
      </div>
    </footer>
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
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 18%, rgba(0, 180, 181, .16), transparent 28%),
    radial-gradient(circle at 82% 24%, rgba(2, 77, 161, .10), transparent 30%),
    linear-gradient(135deg, #f5f8fa 0%, #eef3f6 100%);
  color: #1d3444;
}

.login-page::before {
  content: '';
  position: absolute;
  right: -12%;
  bottom: -34%;
  width: 560px;
  height: 560px;
  border-radius: 50%;
  background: rgba(0, 169, 189, .10);
}

.login-main {
  min-height: calc(100vh - 42px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44px 22px 58px;
}

.login-shell {
  position: relative;
  z-index: 1;
  width: min(920px, 100%);
  min-height: 430px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, .95fr);
  overflow: hidden;
  border: 1px solid rgba(224, 234, 239, .92);
  border-radius: 28px;
  background: rgba(255, 255, 255, .86);
  box-shadow: 0 24px 70px rgba(26, 48, 66, .16);
  backdrop-filter: blur(10px);
}

.login-brand-panel {
  position: relative;
  min-height: 430px;
  overflow: hidden;
  padding: 34px;
  background: linear-gradient(135deg, rgba(0, 169, 189, .96), rgba(0, 139, 140, .94));
}

.login-brand-panel::before {
  content: '';
  position: absolute;
  top: -84px;
  left: -30px;
  width: 430px;
  height: 430px;
  background: url('@/assets/images/FM_login.png') center / contain no-repeat;
  opacity: .20;
  filter: brightness(0) invert(1);
}

.login-brand-panel::after {
  content: '';
  position: absolute;
  right: -90px;
  bottom: -110px;
  width: 280px;
  height: 280px;
  border: 42px solid rgba(255, 255, 255, .13);
  border-radius: 50%;
}

.login-logo {
  position: absolute;
  z-index: 2;
  top: 14px;
  left: 20px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5px solid rgba(255, 255, 255, .92);
  border-radius: 50%;
  color: #1d3444;
  font-size: 18px;
  font-weight: 900;
  box-shadow: 0 12px 28px rgba(0, 0, 0, .13);
}

.login-brand-panel h1 {
  position: absolute;
  z-index: 2;
  top: 202px;
  right: 24px;
  left: 24px;
  margin: 0;
  color: #fff;
  font-size: clamp(31px, 4vw, 44px);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -.02em;
  text-align: center;
}

.login-eyebrow {
  position: absolute;
  z-index: 2;
  right: 10px;
  bottom: 7px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .17);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.login-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 46px 42px;
  background: rgba(255, 255, 255, .95);
}

.login-chip {
  align-self: flex-start;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 11px;
  border: 1px solid rgba(0, 169, 189, .16);
  border-radius: 999px;
  background: #e9fbfd;
  color: #008fa1;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}

.login-card-title {
  margin: 28px 0;
}

.login-card-title h2 {
  margin: 0 0 8px;
  color: #1d3444;
  font-size: 30px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -.03em;
}

.login-card-title p {
  margin: 0;
  color: #61727f;
  font-size: 14px;
  line-height: 1.55;
}

.login-submit-button,
:deep(.login-submit-button.p-button) {
  width: 100% !important;
  height: 42px !important;
  min-height: 42px !important;
  border: 0 !important;
  border-radius: 8px !important;
  background: linear-gradient(135deg, #00a9bd, #008fa1) !important;
  color: #fff !important;
  box-shadow: 0 10px 24px rgba(0, 169, 189, .26) !important;
  font-size: 13px !important;
  font-weight: 800 !important;
}

.login-submit-button:hover,
:deep(.login-submit-button.p-button:hover) {
  background: linear-gradient(135deg, #00b7ca, #008c9d) !important;
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(0, 169, 189, .30) !important;
}

.footer-fm {
  position: fixed;
  z-index: 2;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 0 18px 12px;
  color: #5f727e;
  font-size: 11px;
  text-align: right;
}

.footer-link {
  color: #008fa1;
  text-decoration: none;
}

@media (max-width: 760px) {
  .login-main {
    padding: 18px 14px 52px;
  }

  .login-shell {
    grid-template-columns: 1fr;
    min-height: auto;
    border-radius: 20px;
  }

  .login-brand-panel {
    min-height: 210px;
  }

  .login-brand-panel h1 {
    top: 112px;
    font-size: 34px;
  }

  .login-brand-panel::before {
    width: 280px;
    height: 280px;
  }

  .login-card {
    padding: 32px 24px 36px;
  }
}
</style>
