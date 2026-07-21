<template>
  <main class="unauthorized-page">
    <section class="unauthorized-card">
      <div class="unauthorized-icon">
        <i class="pi pi-lock"></i>
      </div>
      <span class="unauthorized-code">401</span>
      <h1>Acceso no autorizado</h1>
      <p>No tenés permisos para ingresar a esta pantalla de Field Manager.</p>
      <FmButton label="VOLVER AL INICIO" icon="pi-home" @click="goHome" />
    </section>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => router.push({ name: 'login2fa' })
</script>

<style scoped>
.unauthorized-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at 20% 18%, rgba(0, 169, 189, .13), transparent 30%),
    linear-gradient(135deg, #f5f8fa, #edf3f5);
}

.unauthorized-card {
  width: min(470px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 42px 36px;
  border: 1px solid #dae5e9;
  border-radius: 20px;
  background: rgba(255, 255, 255, .96);
  box-shadow: 0 24px 60px rgba(31, 63, 75, .15);
  text-align: center;
}

.unauthorized-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e4f9fc;
  color: #008fa1;
}

.unauthorized-icon i {
  font-size: 30px;
}

.unauthorized-code {
  margin-top: 18px;
  color: #00a9bd;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .14em;
}

h1 {
  margin: 8px 0;
  color: #203947;
  font-size: 27px;
}

p {
  margin: 0 0 28px;
  color: #607887;
  line-height: 1.55;
}
</style>
