<template>
  <div
    class="fm-typing-loader"
    :class="loaderClasses"
    role="status"
    aria-live="polite"
    :aria-label="accessibleMessage"
  >
    <div class="fm-typing-loader__box">
      <div class="fm-brand-spinner" aria-hidden="true">
        <span class="fm-brand-spinner__core"></span>
      </div>

      <strong v-if="showTitle && displayTitle" class="fm-typing-loader__title">{{ displayTitle }}</strong>
      <div v-if="showMessage" class="fm-typing-loader__message">
        {{ displayMessage }}<span class="fm-typing-loader__dots" aria-hidden="true"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const GLOBAL_TITLE = 'Cargando información'
const GLOBAL_MESSAGE = 'Aguarde unos instantes'

const props = defineProps({
  title: { type: String, default: GLOBAL_TITLE },
  message: { type: String, default: GLOBAL_MESSAGE },
  variant: { type: String, default: 'inline' },
  fullscreen: { type: Boolean, default: false },
  overlay: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  showTitle: { type: Boolean, default: true },
  showMessage: { type: Boolean, default: true }
})

const route = useRoute()
const isLoginRoute = computed(() => {
  const routeName = String(route.name ?? '').toLowerCase()
  const routePath = String(route.path ?? '').toLowerCase()

  return routeName.includes('login') || routePath.includes('login') || routePath === '/'
})

const displayTitle = computed(() => (
  isLoginRoute.value ? (props.title || props.message) : GLOBAL_TITLE
))
const displayMessage = computed(() => (
  isLoginRoute.value ? props.message : GLOBAL_MESSAGE
))
const accessibleMessage = computed(() => (
  `${displayTitle.value}. ${props.showMessage ? displayMessage.value : ''}`.trim()
))
const loaderClasses = computed(() => ({
  'fm-typing-loader--fullscreen': props.fullscreen,
  'fm-typing-loader--overlay': props.overlay,
  'fm-typing-loader--inline': props.inline || (!props.fullscreen && !props.overlay),
  [`fm-typing-loader--${props.variant}`]: Boolean(props.variant)
}))
</script>

<style scoped>
.fm-brand-spinner {
  position: relative;
  width: 82px;
  height: 82px;
  margin: 2px 0 8px;
  border-radius: 50%;
  background: conic-gradient(
    from -18deg,
    #16c7d9 0deg,
    #00a9bd 72deg,
    #1689d8 145deg,
    #4657d9 218deg,
    #7b3ed8 286deg,
    #e3268e 332deg,
    transparent 332deg 360deg
  );
  box-shadow:
    0 0 0 7px rgba(0, 169, 189, .07),
    0 8px 22px rgba(37, 67, 128, .16);
  animation: fm-brand-spinner-rotate .92s linear infinite;
}

.fm-brand-spinner::before {
  content: '';
  position: absolute;
  inset: 9px;
  border-radius: 50%;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(31, 62, 89, .06);
}

.fm-brand-spinner__core {
  position: absolute;
  inset: 24px;
  z-index: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    rgba(22, 199, 217, .22),
    rgba(70, 87, 217, .10) 52%,
    rgba(227, 38, 142, .08) 72%,
    transparent 73%
  );
}

@keyframes fm-brand-spinner-rotate {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .fm-brand-spinner {
    animation-duration: 2.4s;
  }
}
</style>
