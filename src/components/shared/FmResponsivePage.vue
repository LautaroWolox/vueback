<template>
  <component
    :is="as"
    class="fm-screen fm-responsive-page"
    :class="{
      'fm-screen--pad': padded,
      'fm-responsive-page--scroll': scroll,
      'fm-responsive-page--dense': dense
    }"
  >
    <slot />
  </component>
</template>

<script setup>
defineProps({
  as: { type: String, default: 'main' },
  padded: { type: Boolean, default: true },
  scroll: { type: Boolean, default: false },
  dense: { type: Boolean, default: false }
})
</script>

<style scoped>
.fm-responsive-page {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.fm-responsive-page--scroll {
  height: 100%;
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.fm-responsive-page--dense {
  --fm-section-gap: 6px;
  --fm-page-padding: 4px;
}
</style>
