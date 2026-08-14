<template>
  <section
    class="fm-grid-shell fm-ui-grid-shell fm-responsive-grid-shell"
    :class="{
      'fm-grid-shell--loading': loading,
      'fm-ui-grid-shell--loading': loading
    }"
  >
    <header v-if="title || $slots.title || $slots.actions" class="fm-grid-title fm-ui-grid-title">
      <slot name="title">
        <span>{{ title }}</span>
      </slot>
      <slot name="actions" />
    </header>

    <slot />

    <FmTypingLoader
      v-if="loading"
      overlay
      :variant="loadingVariant"
      :title="loadingTitle"
      :message="loadingMessage"
    />
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  loadingVariant: { type: String, default: 'auto' },
  loadingTitle: { type: String, default: '' },
  loadingMessage: { type: String, default: '' }
})
</script>
