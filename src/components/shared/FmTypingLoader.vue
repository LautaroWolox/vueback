<template>
  <div
    class="fm-typing-loader"
    :class="loaderClasses"
    role="status"
    aria-live="polite"
    :aria-label="accessibleMessage"
  >
    <div class="fm-typing-loader__box">
      <div
        class="fm-brand-spinner"
        :class="`fm-brand-spinner--${activeVariant}`"
        aria-hidden="true"
      >
        <span class="fm-brand-spinner__ring fm-brand-spinner__ring--outer"></span>
        <span class="fm-brand-spinner__ring fm-brand-spinner__ring--inner"></span>

        <span
          v-for="index in 16"
          :key="index"
          class="fm-brand-spinner__tick"
          :style="tickStyle(index - 1)"
        ></span>

        <span class="fm-brand-spinner__core">
          <i v-if="centerIcon" :class="centerIcon"></i>
          <span v-else-if="activeVariant === 'emulation'" class="fm-brand-spinner__infinity">∞</span>
        </span>
      </div>

      <strong v-if="showTitle && displayTitle" class="fm-typing-loader__title">
        {{ displayTitle }}
      </strong>

      <div v-if="showMessage && displayMessage" class="fm-typing-loader__message">
        {{ displayMessage }}<span class="fm-typing-loader__dots" aria-hidden="true"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getLoaderProfile } from './fmLoaderProfiles.js'

const TICK_COLORS = [
  '#16c7d9', '#00b5ca', '#039fe0', '#198bd8',
  '#3976e0', '#5362e6', '#7051df', '#8a43dc',
  '#a636d0', '#c12ab8', '#d926a0', '#e3268e',
  '#d926a0', '#a636d0', '#7051df', '#3976e0'
]

const props = defineProps({
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  variant: { type: String, default: 'auto' },
  fullscreen: { type: Boolean, default: false },
  overlay: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  showTitle: { type: Boolean, default: true },
  showMessage: { type: Boolean, default: true }
})

const route = useRoute()
const routeProfile = computed(() => getLoaderProfile(route))

const activeVariant = computed(() => {
  const requested = String(props.variant || 'auto').trim().toLowerCase()
  return requested && requested !== 'auto' ? requested : routeProfile.value.variant
})

const displayTitle = computed(() => props.title || routeProfile.value.title || 'Cargando información')
const displayMessage = computed(() => props.message || routeProfile.value.message || 'Aguarde unos instantes')

const centerIcon = computed(() => ({
  dashboard: 'pi pi-chart-line',
  detail: 'pi pi-file',
  report: 'pi pi-chart-bar',
  search: 'pi pi-search',
  materials: 'pi pi-box',
  config: 'pi pi-cog',
  process: 'pi pi-check'
}[activeVariant.value] || ''))

const accessibleMessage = computed(() => (
  `${displayTitle.value}. ${props.showMessage ? displayMessage.value : ''}`.trim()
))

const loaderClasses = computed(() => ({
  'fm-typing-loader--fullscreen': props.fullscreen,
  'fm-typing-loader--overlay': props.overlay,
  'fm-typing-loader--inline': props.inline || (!props.fullscreen && !props.overlay),
  [`fm-typing-loader--${activeVariant.value}`]: Boolean(activeVariant.value)
}))

const tickStyle = (index) => ({
  '--i': index,
  '--tick-color': TICK_COLORS[index % TICK_COLORS.length]
})
</script>

<style scoped>
.fm-brand-spinner {
  --fm-spinner-size: 86px;
  position: relative;
  width: var(--fm-spinner-size);
  height: var(--fm-spinner-size);
  margin: 2px 0 12px;
  flex: 0 0 auto;
}

.fm-brand-spinner__ring,
.fm-brand-spinner__ring::after,
.fm-brand-spinner__core,
.fm-brand-spinner__tick {
  position: absolute;
  box-sizing: border-box;
}

.fm-brand-spinner__ring {
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from -20deg,
    #16c7d9 0deg,
    #00a9bd 70deg,
    #198bd8 142deg,
    #5362e6 215deg,
    #8a43dc 282deg,
    #e3268e 334deg,
    transparent 334deg 360deg
  );
  box-shadow: 0 7px 20px rgba(37, 67, 128, .14);
  animation: fm-spinner-rotate .95s linear infinite;
}

.fm-brand-spinner__ring::after {
  content: '';
  inset: 8px;
  border-radius: 50%;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(31, 62, 89, .05);
}

.fm-brand-spinner__ring--inner {
  display: none;
  inset: 15px;
  background: conic-gradient(
    from 150deg,
    #e3268e 0deg,
    #8a43dc 88deg,
    #5362e6 165deg,
    #198bd8 238deg,
    #16c7d9 310deg,
    transparent 310deg 360deg
  );
  box-shadow: none;
  animation-duration: 1.35s;
  animation-direction: reverse;
}

.fm-brand-spinner__ring--inner::after {
  inset: 6px;
}

.fm-brand-spinner__core {
  z-index: 4;
  inset: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #4263d9;
  font-size: 23px;
}

.fm-brand-spinner__core .pi {
  font-size: inherit;
}

.fm-brand-spinner__tick {
  display: none;
  z-index: 3;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 14px;
  border-radius: 999px;
  background: var(--tick-color);
  transform: translate(-50%, -50%) rotate(calc(var(--i) * 22.5deg)) translateY(-34px);
  transform-origin: center;
}

.fm-brand-spinner__infinity {
  display: inline-block;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
  color: transparent;
  background: linear-gradient(90deg, #16c7d9, #3976e0 45%, #8a43dc 68%, #e3268e);
  -webkit-background-clip: text;
  background-clip: text;
}

.fm-brand-spinner--profile {
  --fm-spinner-size: 90px;
}

.fm-brand-spinner--profile .fm-brand-spinner__ring--inner {
  display: block;
}

.fm-brand-spinner--profile .fm-brand-spinner__core {
  inset: 31px;
  background: radial-gradient(circle, rgba(22, 199, 217, .10), transparent 70%);
}

.fm-brand-spinner--dashboard .fm-brand-spinner__ring--outer {
  background: conic-gradient(
    #16c7d9 0 55deg,
    transparent 55deg 78deg,
    #198bd8 78deg 145deg,
    transparent 145deg 170deg,
    #7051df 170deg 238deg,
    transparent 238deg 265deg,
    #e3268e 265deg 330deg,
    transparent 330deg 360deg
  );
  animation-duration: 1.15s;
}

.fm-brand-spinner--grid {
  animation: fm-spinner-rotate 1.1s linear infinite;
}

.fm-brand-spinner--grid .fm-brand-spinner__ring,
.fm-brand-spinner--grid .fm-brand-spinner__core {
  display: none;
}

.fm-brand-spinner--grid .fm-brand-spinner__tick {
  display: block;
  width: 7px;
  height: 13px;
}

.fm-brand-spinner--detail .fm-brand-spinner__ring--outer {
  background: conic-gradient(
    from 15deg,
    #16c7d9,
    #198bd8 35%,
    transparent 46% 57%,
    #8a43dc 72%,
    #e3268e 88%,
    #16c7d9
  );
  animation-duration: 1.2s;
}

.fm-brand-spinner--detail .fm-brand-spinner__core {
  color: #2e6fda;
}

.fm-brand-spinner--emulation {
  animation: fm-spinner-rotate 1.4s linear infinite;
}

.fm-brand-spinner--emulation .fm-brand-spinner__ring {
  display: none;
}

.fm-brand-spinner--emulation .fm-brand-spinner__tick {
  display: block;
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%) rotate(calc(var(--i) * 22.5deg)) translateY(-35px);
}

.fm-brand-spinner--emulation .fm-brand-spinner__core {
  inset: 18px;
  animation: fm-spinner-counter 1.4s linear infinite;
}

.fm-brand-spinner--report {
  animation: fm-spinner-rotate 1.5s linear infinite;
}

.fm-brand-spinner--report .fm-brand-spinner__ring {
  display: none;
}

.fm-brand-spinner--report .fm-brand-spinner__tick {
  display: block;
  width: 3px;
  height: 18px;
  transform: translate(-50%, -50%) rotate(calc(var(--i) * 22.5deg)) translateY(-33px);
}

.fm-brand-spinner--report .fm-brand-spinner__core {
  color: #5064da;
  font-size: 21px;
}

.fm-brand-spinner--search .fm-brand-spinner__ring--outer {
  background: conic-gradient(
    from 35deg,
    #16c7d9 0 88deg,
    #198bd8 120deg,
    transparent 142deg 205deg,
    #8a43dc 225deg,
    #e3268e 310deg,
    transparent 334deg 360deg
  );
  animation-duration: 1.05s;
}

.fm-brand-spinner--search .fm-brand-spinner__core {
  color: #0baec3;
}

.fm-brand-spinner--materials .fm-brand-spinner__ring--outer {
  animation-duration: 1.25s;
}

.fm-brand-spinner--materials .fm-brand-spinner__core {
  inset: 22px;
  border: 2px solid rgba(83, 98, 230, .12);
  color: #6d50dc;
  font-size: 24px;
}

.fm-brand-spinner--config .fm-brand-spinner__ring--outer {
  background: conic-gradient(
    #16c7d9 0 52deg,
    transparent 52deg 72deg,
    #198bd8 72deg 132deg,
    transparent 132deg 154deg,
    #5362e6 154deg 218deg,
    transparent 218deg 240deg,
    #8a43dc 240deg 295deg,
    transparent 295deg 315deg,
    #e3268e 315deg 350deg,
    transparent 350deg 360deg
  );
  animation-duration: 1.25s;
}

.fm-brand-spinner--config .fm-brand-spinner__core {
  color: #654edb;
  animation: fm-spinner-counter 1.75s linear infinite;
}

.fm-brand-spinner--process .fm-brand-spinner__ring--inner {
  display: block;
  inset: 19px;
  opacity: .55;
}

.fm-brand-spinner--process .fm-brand-spinner__core {
  inset: 26px;
  color: #09aebd;
  font-size: 25px;
}

.fm-brand-spinner--iframe {
  animation: fm-spinner-rotate 1.15s linear infinite;
}

.fm-brand-spinner--iframe .fm-brand-spinner__ring {
  display: none;
}

.fm-brand-spinner--iframe .fm-brand-spinner__tick {
  display: block;
  width: 7px;
  height: 7px;
  opacity: calc(.30 + (var(--i) * .035));
  transform: translate(-50%, -50%) rotate(calc(var(--i) * 22.5deg)) translateY(-34px);
}

.fm-brand-spinner--iframe .fm-brand-spinner__core {
  inset: 31px;
  background: radial-gradient(circle, rgba(22, 199, 217, .20), rgba(83, 98, 230, .08) 55%, transparent 72%);
}

.fm-typing-loader__title {
  color: #173142;
  font-weight: 700;
}

.fm-typing-loader__message {
  color: #607482;
}

@keyframes fm-spinner-rotate {
  to { transform: rotate(360deg); }
}

@keyframes fm-spinner-counter {
  to { transform: rotate(-360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .fm-brand-spinner,
  .fm-brand-spinner__ring,
  .fm-brand-spinner__core {
    animation-duration: 2.8s !important;
  }
}
</style>
