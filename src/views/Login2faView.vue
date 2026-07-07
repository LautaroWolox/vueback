<template>
  <div>
  <main>
    <div id="app">
      <Button icon="pi" label="CONECTAR" style="width: 60%;" class="login-submit-button mt-4 h-2rem" @click="ingresar"/>
    </div>
  </main> 
  <footer>
    <div class="navbar navbar-fixed-bottom text-right footer-fm">
      <!-- Copyright -->
      <div class="footer-copyright py-3">
        © Copyright
        | <a href="#"  class="footer-link" > Telecom Argentina S.A Derechos Reservados. | v. 1.0.0</a>
      </div>
      <!-- Copyright -->
	  </div>
  </footer>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import { onBeforeUnmount,ref } from 'vue'
import { useFetch } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth';


const router = useRouter()
const authStore = useAuthStore();
const screenWidth = window.screen.width;
const screenHeight = window.screen.height;
const width = screenWidth / 1.5;
const height = screenHeight / 1.5;
const left = screenWidth / 6;  
const top = screenHeight / 6; 

let popupWindow = null
let loginTimer = null

const checkLoginStatus = async () => {
  console.log("Entró a checkLoginStatus")
  const { data, error, response } = await useFetch('/pc/userData.html', {
    credentials: 'include',
  }).get().json()
  console.log("Login status = " + response.value?.status)
  if (response.value?.status === 403 || response.value?.status === 401) {
    return false
  }
  if (error.value || !data.value?.autenticado) {
    return false
  }
  console.log("Login status = " + response.value?.status)
  authStore.setPerfil({
    autenticado: data.value.autenticado,
    rutas: data.value.rutas,
    nombre: data.value.nombre,
    email: data.value.email,
    legajo: data.value.legajo,
  })
  console.log("después the llamar a Pinia, antes de abrir main")
  router.push({ name: 'main' })  // no mandar debajo del cierre del popup porque trae problemas
  if (popupWindow) {
    popupWindow.close()
    popupWindow = null
  }
  return true
}

const startLoginPolling = () => {
  console.log("entré a startLoginPolling")
  let attempts = 0
  const maxAttempts = 120
  loginTimer = setInterval(async () => {
    attempts++
    const ok = await checkLoginStatus()
    if (ok || attempts >= maxAttempts) {
      clearInterval(loginTimer)
      loginTimer = null
    }
  }, 1000)    // llama a java para obtener datos de usuario cada un segundo
}

const ingresar = async () => {
  popupWindow = window.open(
    window.location.origin + '/pc/llamado.html',
    'LoginPopup',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  )
  console.log("Antes de empezar polling")
  setTimeout(() => {
    startLoginPolling();
  }, 10000);   // 10 segundos de espera para que java expire cookie e invalide sesión
}


onBeforeUnmount(() => {
  if (loginTimer) {
    clearInterval(loginTimer)
  }
})


</script>

<style scoped>
#app {
  background-image: url(@/assets/images/FM_login.png);
  background-size: 350px; 
  position: absolute;
  margin: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 350px;
  height: 350px;
}
.login-container {
	position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16%;
}
.login-submit-button {
  position: fixed;
  left: 20%;
  top: 40%;
	border-radius: 2px;
  padding: auto;
  background-color: #00b4b5;
}
.login-submit-button:disabled {
  color: black;
}
img {
  padding-top: 7px;
  padding-bottom: 2px;
  margin: 0;
}
#error {
	position: fixed;
  left: 49%;
  top: 35%;
  transform: translate(-50%, -50%);
}

.footer-fm {
  position: fixed;
  bottom: 0;
  width: 100%;
  font-size: 0.9em; 
  padding-right: 15px;
}
.footer-link {
  color:  #00b4b5;
}
</style>