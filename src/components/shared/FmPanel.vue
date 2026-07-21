<template>
  <section class="fm-ui-section fm-card">
    <header v-if="title || $slots.header" class="fm-ui-section-header fm-card__header">
      <slot name="header">
        <span>{{ title }}</span>
      </slot>
      <slot name="headerActions" />
    </header>
    <div class="fm-ui-section-body fm-card__body" :class="{ 'fm-ui-section-body--accent fm-card__body--accent': accent }">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  accent: { type: Boolean, default: false }
})
</script>
