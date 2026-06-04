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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth';


const urlBase = import.meta.env.VITE_FM_MV_URL;
const router = useRouter()
const authStore = useAuthStore();
const popupWindow = ref(null)
const screenWidth = window.screen.width;
const screenHeight = window.screen.height;
const width = screenWidth / 1.5;
const height = screenHeight / 1.5;
const left = screenWidth / 6;  
const top = screenHeight / 6; 


const handleMessage = (event) => {
  const origins = new Set([import.meta.env.VITE_ORIGIN]);
  let autenticado = false;
  let usrObj = {};
  if (!origins.has(event.origin)) return
  let jsonStr = event.data.usr
  if(jsonStr !== undefined) {
    console.log("recibido: " + jsonStr)
    usrObj = JSON.parse(jsonStr)
    autenticado = usrObj.autenticado
  }
  if (usrObj && autenticado) {
    authStore.setPerfil({
        autenticado,
        rutas: usrObj.rutas,
        nombre: usrObj.nombre,
        email: usrObj.email,
        legajo: usrObj.legajo
      })
    router.push({ name: 'main'})
    window.removeEventListener('message', handleMessage)
    if (popupWindow.value) {
      popupWindow.value.close()
      popupWindow.value = null
    }
  }
  
}

const ingresar = () => {
  popupWindow.value = window.open(window.location.origin + '/pc/llamado.html','LoginPopup',`width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`)
}

onMounted(() => {
  window.removeEventListener('message', handleMessage)
  window.addEventListener('message', handleMessage)
})
onBeforeUnmount(() => window.removeEventListener('message', handleMessage))
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