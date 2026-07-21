<template>
  <div
    class="fm-typing-loader"
    :class="loaderClasses"
    role="status"
    aria-live="polite"
    :aria-label="accessibleMessage"
  >
    <div class="fm-typing-loader__box">
      <svg class="fm-typing-loader__image" viewBox="0 0 180 120" aria-hidden="true">
        <defs>
          <clipPath id="fm-code-screen-clip">
            <rect x="27" y="27" width="76" height="39" rx="3" />
          </clipPath>
        </defs>

        <rect x="14" y="14" width="102" height="66" rx="7" fill="#e8fbfd" stroke="#00a9bd" stroke-width="4" />
        <rect x="27" y="27" width="76" height="39" rx="3" fill="#173142" />

        <g clip-path="url(#fm-code-screen-clip)">
          <g class="fm-code-stream">
            <path class="fm-code-line fm-code-line--1" d="M38 34h25" />
            <path class="fm-code-line fm-code-line--2" d="M38 43h41" />
            <path class="fm-code-line fm-code-line--3" d="M38 52h18" />
            <path class="fm-code-line fm-code-line--4" d="M38 61h34" />
            <path class="fm-code-line fm-code-line--5" d="M38 70h27" />
            <path class="fm-code-line fm-code-line--6" d="M38 79h43" />
          </g>
          <rect class="fm-code-cursor" x="82" y="57" width="3" height="6" rx="1" fill="#ffffff" />
          <rect class="fm-screen-scan" x="27" y="27" width="76" height="8" fill="rgba(99, 227, 238, .13)" />
        </g>

        <path d="M65 80v14M44 94h42" stroke="#173142" stroke-width="4" stroke-linecap="round" />
        <circle cx="138" cy="38" r="13" fill="#f5b47e" />
        <path d="M127 35c2-12 23-16 27-1-6-2-10-5-14-8-2 5-6 8-13 9Z" fill="#263746" />
        <path d="M122 61c5-13 28-14 34 0l7 31h-47l6-31Z" fill="#00a9bd" />

        <g class="fm-typing-arm fm-typing-arm--left">
          <path d="M125 66 99 82" stroke="#f5b47e" stroke-width="7" stroke-linecap="round" />
          <path d="m97 82 13 5" stroke="#263746" stroke-width="5" stroke-linecap="round" />
        </g>

        <g class="fm-typing-arm fm-typing-arm--right">
          <path d="M153 66 128 83" stroke="#f5b47e" stroke-width="7" stroke-linecap="round" />
          <path d="m128 83-13 4" stroke="#263746" stroke-width="5" stroke-linecap="round" />
        </g>

        <g class="fm-keyboard-keys" fill="#00a9bd">
          <rect x="94" y="87" width="5" height="2" rx="1" />
          <rect x="102" y="89" width="5" height="2" rx="1" />
          <rect x="110" y="87" width="5" height="2" rx="1" />
          <rect x="118" y="89" width="5" height="2" rx="1" />
          <rect x="126" y="87" width="5" height="2" rx="1" />
        </g>

        <path d="M126 92v17M151 92v17" stroke="#263746" stroke-width="8" stroke-linecap="round" />
      </svg>

      <strong v-if="showTitle && displayTitle" class="fm-typing-loader__title">{{ displayTitle }}</strong>
      <div v-if="showMessage" class="fm-typing-loader__message">
        {{ message }}<span class="fm-typing-loader__dots" aria-hidden="true"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Cargando' },
  message: { type: String, default: 'Procesando información' },
  variant: { type: String, default: 'inline' },
  fullscreen: { type: Boolean, default: false },
  overlay: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  showTitle: { type: Boolean, default: true },
  showMessage: { type: Boolean, default: true }
})

const displayTitle = computed(() => props.title || props.message)
const accessibleMessage = computed(() => `${displayTitle.value}. ${props.message}`.trim())
const loaderClasses = computed(() => ({
  'fm-typing-loader--fullscreen': props.fullscreen,
  'fm-typing-loader--overlay': props.overlay,
  'fm-typing-loader--inline': props.inline || (!props.fullscreen && !props.overlay),
  [`fm-typing-loader--${props.variant}`]: Boolean(props.variant)
}))
</script>

<style scoped>
.fm-code-line {
  fill: none;
  stroke: #63e3ee;
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: fm-code-write 1.55s ease-in-out infinite;
}

.fm-code-line--2 { animation-delay: .12s; }
.fm-code-line--3 { animation-delay: .24s; }
.fm-code-line--4 { animation-delay: .36s; }
.fm-code-line--5 { animation-delay: .48s; }
.fm-code-line--6 { animation-delay: .60s; }

.fm-code-stream {
  animation: fm-code-scroll 2.2s ease-in-out infinite;
}

.fm-code-cursor {
  animation: fm-cursor-blink .65s steps(2, end) infinite;
}

.fm-screen-scan {
  animation: fm-screen-scan 1.6s linear infinite;
}

.fm-typing-arm {
  transform-box: fill-box;
}

.fm-typing-arm--left {
  transform-origin: 95% 18%;
  animation: fm-type-left .42s ease-in-out infinite alternate;
}

.fm-typing-arm--right {
  transform-origin: 8% 16%;
  animation: fm-type-right .42s ease-in-out .21s infinite alternate;
}

.fm-keyboard-keys rect {
  animation: fm-key-press .84s ease-in-out infinite;
}

.fm-keyboard-keys rect:nth-child(2) { animation-delay: .12s; }
.fm-keyboard-keys rect:nth-child(3) { animation-delay: .24s; }
.fm-keyboard-keys rect:nth-child(4) { animation-delay: .36s; }
.fm-keyboard-keys rect:nth-child(5) { animation-delay: .48s; }

@keyframes fm-code-write {
  0% { stroke-dashoffset: 48; opacity: .30; }
  45%, 78% { stroke-dashoffset: 0; opacity: 1; }
  100% { stroke-dashoffset: -48; opacity: .22; }
}

@keyframes fm-code-scroll {
  0%, 36% { transform: translateY(0); }
  65%, 100% { transform: translateY(-18px); }
}

@keyframes fm-cursor-blink {
  0%, 45% { opacity: 1; }
  46%, 100% { opacity: 0; }
}

@keyframes fm-screen-scan {
  from { transform: translateY(-9px); }
  to { transform: translateY(47px); }
}

@keyframes fm-type-left {
  from { transform: rotate(2deg) translateY(0); }
  to { transform: rotate(-5deg) translateY(2px); }
}

@keyframes fm-type-right {
  from { transform: rotate(-2deg) translateY(1px); }
  to { transform: rotate(5deg) translateY(-1px); }
}

@keyframes fm-key-press {
  0%, 55%, 100% { opacity: .30; transform: translateY(0); }
  20%, 40% { opacity: 1; transform: translateY(1px); }
}

@media (prefers-reduced-motion: reduce) {
  .fm-code-line,
  .fm-code-stream,
  .fm-code-cursor,
  .fm-screen-scan,
  .fm-typing-arm,
  .fm-keyboard-keys rect {
    animation: none !important;
  }

  .fm-code-line {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}
</style>
