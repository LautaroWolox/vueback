<template>
  <div
    class="fm-loader"
    :class="loaderClasses"
    role="status"
    aria-live="polite"
    :aria-label="accessibleMessage"
  >
    <div class="fm-loader__card">
      <div class="fm-loader__spinner" aria-hidden="true">
        <span class="fm-loader__ring fm-loader__ring--outer"></span>
        <span class="fm-loader__ring fm-loader__ring--middle"></span>
        <span class="fm-loader__ring fm-loader__ring--inner"></span>
        <span class="fm-loader__core"></span>
      </div>

      <strong v-if="showTitle && displayTitle" class="fm-loader__title">
        {{ displayTitle }}
      </strong>

      <div v-if="effectiveShowMessage && displayMessage" class="fm-loader__message">
        {{ displayMessage }}<span class="fm-loader__dots" aria-hidden="true"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  GENERIC_LOADER_MESSAGES,
  getLoaderProfile,
} from './fmLoaderProfiles'

const props = defineProps({
  title: { type: String, default: 'Cargando Información' },
  contextTitle: { type: String, default: '' },
  message: { type: String, default: 'Preparando Grilla' },
  variant: { type: String, default: 'default' },
  fullscreen: { type: Boolean, default: false },
  overlay: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  showTitle: { type: Boolean, default: true },
  showMessage: { type: Boolean, default: true },
})

const route = useRoute()
const routeProfile = computed(() => getLoaderProfile(route.name))

const hasCustomMessage = computed(() => {
  const value = String(props.message ?? '').trim()
  return Boolean(value) && !GENERIC_LOADER_MESSAGES.includes(value)
})

const displayTitle = computed(() => (
  String(props.contextTitle ?? '').trim() || 'Cargando Información'
))

const displayMessage = computed(() => (
  hasCustomMessage.value ? props.message : routeProfile.value.message
))

const effectiveVariant = computed(() => (
  routeProfile.value.variant || props.variant || 'default'
))

const effectiveShowMessage = computed(() => (
  routeProfile.value.forceMessage || props.showMessage
))

const accessibleMessage = computed(() => (
  `${displayTitle.value}. ${effectiveShowMessage.value ? displayMessage.value : ''}`.trim()
))

const loaderClasses = computed(() => ({
  'fm-loader--fullscreen': props.fullscreen,
  'fm-loader--overlay': props.overlay,
  'fm-loader--inline': props.inline || (!props.fullscreen && !props.overlay),
  [`fm-loader--${effectiveVariant.value}`]: Boolean(effectiveVariant.value),
}))
</script>

<style scoped>
.fm-loader {
  --fm-loader-cyan: #00a9bd;
  --fm-loader-blue: #246bfd;
  --fm-loader-violet: #8b38d1;
  --fm-loader-magenta: #d9208f;
  --fm-loader-ink: #173142;
  --fm-loader-muted: #607887;

  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  color: var(--fm-loader-ink);
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.fm-loader--fullscreen {
  position: fixed;
  z-index: 5000;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  padding: 24px;
  background: rgba(239, 250, 252, .96);
  backdrop-filter: blur(2px);
}

.fm-loader--overlay {
  position: absolute;
  z-index: 900;
  inset: 0;
  min-width: 100%;
  min-height: 100%;
  padding: 18px;
  background: rgba(245, 251, 252, .90);
  backdrop-filter: blur(1px);
}

.fm-loader--inline {
  width: 100%;
  min-height: 170px;
  padding: 18px;
}

.fm-loader__card {
  width: min(286px, calc(100vw - 32px));
  min-height: 188px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 22px 24px 20px;
  border: 1px solid #d3e2e7;
  border-radius: 14px;
  background: rgba(255, 255, 255, .98);
  box-shadow: 0 16px 38px rgba(24, 68, 82, .13);
  box-sizing: border-box;
  text-align: center;
}

.fm-loader__spinner {
  position: relative;
  width: 86px;
  height: 86px;
  flex: 0 0 86px;
  margin-bottom: 14px;
}

.fm-loader__ring,
.fm-loader__core {
  position: absolute;
  border-radius: 50%;
  box-sizing: border-box;
}

.fm-loader__ring--outer {
  inset: 0;
  background:
    conic-gradient(
      from 18deg,
      var(--fm-loader-blue) 0 24%,
      transparent 24% 29%,
      var(--fm-loader-violet) 29% 48%,
      transparent 48% 54%,
      var(--fm-loader-magenta) 54% 72%,
      transparent 72% 78%,
      var(--fm-loader-cyan) 78% 100%
    );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 0);
  mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 0);
  animation: fm-loader-spin 1.15s linear infinite;
}

.fm-loader__ring--middle {
  inset: 12px;
  border: 6px solid rgba(0, 169, 189, .13);
  border-top-color: var(--fm-loader-cyan);
  border-right-color: var(--fm-loader-blue);
  animation: fm-loader-spin-reverse 1.55s linear infinite;
}

.fm-loader__ring--inner {
  inset: 26px;
  border: 5px solid rgba(139, 56, 209, .10);
  border-bottom-color: var(--fm-loader-magenta);
  border-left-color: var(--fm-loader-violet);
  animation: fm-loader-spin .95s ease-in-out infinite;
}

.fm-loader__core {
  inset: 35px;
  background: radial-gradient(circle, #fff 0 24%, #dff9fb 42%, #8be7ee 100%);
  box-shadow: 0 0 0 4px rgba(0, 169, 189, .08);
  animation: fm-loader-pulse 1.35s ease-in-out infinite;
}

.fm-loader__title {
  display: block;
  max-width: 100%;
  color: var(--fm-loader-ink);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.fm-loader__message {
  max-width: 100%;
  margin-top: 7px;
  color: var(--fm-loader-muted);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.fm-loader__dots::after {
  content: '';
  display: inline-block;
  width: 1.1em;
  text-align: left;
  animation: fm-loader-dots 1.25s steps(4, end) infinite;
}

.fm-loader--profile .fm-loader__ring--outer { animation-duration: 1.35s; }
.fm-loader--profile .fm-loader__ring--middle { animation-duration: 1.9s; }
.fm-loader--grid .fm-loader__ring--outer { animation-duration: .95s; }
.fm-loader--grid .fm-loader__ring--inner { animation-duration: .72s; }
.fm-loader--report .fm-loader__ring--middle { animation-duration: 1.15s; }
.fm-loader--report .fm-loader__core { animation-duration: 1.05s; }
.fm-loader--emulation .fm-loader__ring--outer { animation-duration: 1.65s; }
.fm-loader--emulation .fm-loader__ring--inner { animation-duration: 1.15s; }
.fm-loader--detail .fm-loader__ring--middle,
.fm-loader--search .fm-loader__ring--middle { animation-duration: 1.05s; }
.fm-loader--config .fm-loader__ring--outer { animation-duration: 1.75s; }
.fm-loader--process .fm-loader__ring--outer { animation-duration: .82s; }
.fm-loader--iframe .fm-loader__ring--outer { animation-duration: 1.25s; }

@keyframes fm-loader-spin {
  to { transform: rotate(360deg); }
}

@keyframes fm-loader-spin-reverse {
  to { transform: rotate(-360deg); }
}

@keyframes fm-loader-pulse {
  0%, 100% { transform: scale(.88); opacity: .62; }
  50% { transform: scale(1); opacity: 1; }
}

@keyframes fm-loader-dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75%, 100% { content: '...'; }
}

@media (max-width: 600px) {
  .fm-loader__card {
    width: min(268px, calc(100vw - 24px));
    min-height: 176px;
    padding: 19px 18px 17px;
  }

  .fm-loader__spinner {
    width: 76px;
    height: 76px;
    flex-basis: 76px;
  }

  .fm-loader__ring--middle { inset: 11px; }
  .fm-loader__ring--inner { inset: 23px; }
  .fm-loader__core { inset: 31px; }
}

@media (prefers-reduced-motion: reduce) {
  .fm-loader__ring,
  .fm-loader__core,
  .fm-loader__dots::after {
    animation: none !important;
  }
}
</style>
