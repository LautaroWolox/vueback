<template>
  <div class="main-layout">
    <CustomMenu />
    <JobtypeContrato v-if="showJobtypeContrato" />
    <ConfiguraCmoActividad v-else-if="showConfiguraCmoActividad" />
    <RouterView v-else />

    <div v-show="showLogo" class="main-home" aria-label="Field Manager">
      <div class="main-body">
        <div class="fm-logo"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CustomMenu from '@/components/CustomMenu.vue'
import JobtypeContrato from '@/modules/parametrizaciones/jobtypeContrato/JobtypeContrato.vue'
import ConfiguraCmoActividad from '@/modules/parametrizaciones/configuraCmoActividad/ConfiguraCmoActividad.vue'

const route = useRoute()
const showLogo = computed(() => route.name === 'main')
const showJobtypeContrato = computed(() => route.name === 'JOCO')
const showConfiguraCmoActividad = computed(() => route.name === 'CMOA')
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 26%, rgba(0, 169, 189, .08), transparent 28%),
    linear-gradient(180deg, #f6f8f9 0%, #eef3f5 100%);
}

.main-home {
  position: fixed;
  inset: 82px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
}

.main-body {
  --main-logo-size: clamp(220px, 22vw, 380px);
  --main-fm-size: calc(var(--main-logo-size) * .86);
  position: relative;
  width: var(--main-logo-size);
  height: var(--main-logo-size);
  background: url(@/assets/images/FM_semi_circulo.png) center / contain no-repeat;
  opacity: 0;
  animation: fm-main-reveal .9s ease .25s forwards;
}

.fm-logo {
  position: absolute;
  inset: 0;
  width: var(--main-fm-size);
  height: var(--main-fm-size);
  margin: auto;
  background: url(@/assets/images/FM.png) center / contain no-repeat;
  transform-origin: center;
  animation: fm-main-breath 2.8s ease-in-out 1.15s infinite;
}

@keyframes fm-main-reveal {
  from { opacity: 0; transform: scale(.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fm-main-breath {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 rgba(0, 169, 189, 0));
  }
  50% {
    transform: scale(1.045);
    filter: drop-shadow(0 8px 18px rgba(0, 169, 189, .22));
  }
}

@media (max-width: 768px) {
  .main-body { --main-logo-size: clamp(190px, 48vw, 300px); }
}

@media (max-width: 420px) {
  .main-body { --main-logo-size: clamp(170px, 62vw, 250px); }
}
</style>
