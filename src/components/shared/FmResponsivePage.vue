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
