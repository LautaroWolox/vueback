<template>
  <div>
    <custom-menu />
    <router-view />
    <div v-show="showLogo()" class='main-body zoomin animation-duration-3000'>
      <div  v-show="showLogo()" class='fm-logo'></div>
    </div>
  </div>
</template>

<script setup>
import CustomMenu from '@/components/CustomMenu.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const showLogo = () => {
  if (route.name === 'main') return true;
  else return false;
}

</script>

<style scoped>
.fm-logo  {
	background-image: url(@/assets/images/FM.png);
	background-size: 300px;

  animation: fadeIn 2s linear;
  animation-delay: 3s;
  animation-fill-mode: forwards;
  visibility: hidden;

	position: absolute;
  margin: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 300px;
  height: 300px;
}

@keyframes fadeIn {
  0% {
    visibility: hidden;
    opacity:0;
  }
  100% {
    visibility: visible;
    opacity:1;
  }
}

.main-body  {
	background-image: url(@/assets/images/FM_semi_circulo.png);
	background-size: 350px;
	overflow-y: hidden;
	position: absolute;
	margin: auto;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	width: 350px;
	height: 350px;
}


</style>