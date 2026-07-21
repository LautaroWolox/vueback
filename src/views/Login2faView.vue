<template>
  <div v-if="loadingUser" class="login-loading">
    <h1>Tu turno Lautaro</h1>
  </div>
  <div v-else>
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
    </div>
</template>

<script setup>
import Button from 'primevue/button'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'


const router = useRouter()
const authStore = useAuthStore();
const loadingUser = ref(false)

const ingresar = () => {
  window.location.href = `${window.location.origin}/pc/llamado.html`

}

onMounted(async() => {
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
.login-loading{
  position: fixed;
  left: 50%;
  top: 50%;
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