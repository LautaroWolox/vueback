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
        <rect x="14" y="14" width="102" height="66" rx="7" fill="#e8fbfd" stroke="#00a9bd" stroke-width="4" />
        <rect x="27" y="27" width="76" height="39" rx="3" fill="#173142" />
        <path d="M39 39h23M39 49h37M39 59h17" stroke="#63e3ee" stroke-width="4" stroke-linecap="round" />
        <path d="M65 80v14M44 94h42" stroke="#173142" stroke-width="4" stroke-linecap="round" />
        <circle cx="138" cy="38" r="13" fill="#f5b47e" />
        <path d="M127 35c2-12 23-16 27-1-6-2-10-5-14-8-2 5-6 8-13 9Z" fill="#263746" />
        <path d="M122 61c5-13 28-14 34 0l7 31h-47l6-31Z" fill="#00a9bd" />
        <path d="M125 66 99 82M153 66l-25 17" stroke="#f5b47e" stroke-width="7" stroke-linecap="round" />
        <path d="m97 82 13 5M128 83l-13 4" stroke="#263746" stroke-width="5" stroke-linecap="round" />
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
