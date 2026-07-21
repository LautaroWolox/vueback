<template>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />

      <template #fallback>
        <FmTypingLoader fullscreen title="Cargando" message="Cargando pantalla" />
      </template>
    </Suspense>
  </RouterView>
</template>

<script setup>
</script>
