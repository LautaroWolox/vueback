<template>
  <main class="loader-showcase">
    <header class="loader-showcase__header">
      <div>
        <span class="loader-showcase__eyebrow">Telecom / Personal</span>
        <h1>Spinners por pantalla</h1>
        <p>
          Vista local de todas las variantes. Cada una usa el mismo lenguaje visual,
          pero cambia el movimiento y el mensaje según el contexto.
        </p>
      </div>

      <div class="loader-showcase__palette" aria-label="Paleta de colores">
        <span class="loader-showcase__swatch loader-showcase__swatch--cyan"></span>
        <span class="loader-showcase__swatch loader-showcase__swatch--blue"></span>
        <span class="loader-showcase__swatch loader-showcase__swatch--violet"></span>
        <span class="loader-showcase__swatch loader-showcase__swatch--magenta"></span>
      </div>
    </header>

    <section class="loader-showcase__grid">
      <article
        v-for="(item, index) in items"
        :key="item.variant"
        class="loader-showcase__card"
      >
        <div class="loader-showcase__card-title">
          <span>{{ index + 1 }}</span>
          <strong>{{ labelFor(item.variant) }}</strong>
        </div>

        <FmTypingLoader
          inline
          :variant="item.variant"
          :title="item.title"
          :message="item.message"
        />

        <code>{{ item.variant }}</code>
      </article>
    </section>
  </main>
</template>

<script setup>
import FmTypingLoader from './FmTypingLoader.vue'
import { loaderShowcaseItems } from './fmLoaderProfiles.js'

const items = loaderShowcaseItems

const labels = {
  profile: 'Inicio de sesión / Perfil',
  dashboard: 'Inicio / Dashboard',
  grid: 'Grillas y listados',
  detail: 'Detalle / Consulta',
  emulation: 'Emulación',
  report: 'Reportes',
  search: 'Búsquedas',
  materials: 'Gestión de materiales',
  config: 'Parametrizaciones',
  process: 'Procesos / Validaciones',
  iframe: 'Pantallas legacy / iframe'
}

const labelFor = (variant) => labels[variant] || variant
</script>

<style scoped>
.loader-showcase {
  min-height: 100vh;
  padding: 28px;
  background:
    radial-gradient(circle at 15% 0%, rgba(22, 199, 217, .08), transparent 28%),
    radial-gradient(circle at 90% 10%, rgba(227, 38, 142, .06), transparent 24%),
    #f4f7f9;
  color: #173142;
  box-sizing: border-box;
}

.loader-showcase__header {
  max-width: 1500px;
  margin: 0 auto 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.loader-showcase__eyebrow {
  display: inline-block;
  margin-bottom: 4px;
  color: #00a9bd;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.loader-showcase h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.05;
}

.loader-showcase__header p {
  max-width: 780px;
  margin: 8px 0 0;
  color: #617483;
  font-size: 14px;
  line-height: 1.5;
}

.loader-showcase__palette {
  display: flex;
  gap: 9px;
  padding: 10px 14px;
  border: 1px solid #dce5ea;
  border-radius: 999px;
  background: rgba(255, 255, 255, .82);
  box-shadow: 0 8px 22px rgba(42, 68, 83, .07);
}

.loader-showcase__swatch {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.loader-showcase__swatch--cyan { background: #16c7d9; }
.loader-showcase__swatch--blue { background: #198bd8; }
.loader-showcase__swatch--violet { background: #8a43dc; }
.loader-showcase__swatch--magenta { background: #e3268e; }

.loader-showcase__grid {
  max-width: 1500px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(240px, 1fr));
  gap: 16px;
}

.loader-showcase__card {
  min-width: 0;
  padding: 14px;
  border: 1px solid #dce5ea;
  border-radius: 14px;
  background: rgba(255, 255, 255, .92);
  box-shadow: 0 10px 26px rgba(42, 68, 83, .08);
}

.loader-showcase__card-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 8px;
  color: #173142;
  font-size: 13px;
}

.loader-showcase__card-title > span {
  width: 25px;
  height: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #e0f7f8;
  color: #008d9e;
  font-weight: 800;
}

.loader-showcase__card code {
  display: block;
  width: fit-content;
  margin: 8px auto 0;
  padding: 4px 8px;
  border-radius: 6px;
  background: #f1f5f7;
  color: #627482;
  font-size: 11px;
}

.loader-showcase__card :deep(.fm-typing-loader),
.loader-showcase__card :deep(.fm-typing-loader--inline) {
  position: relative !important;
  inset: auto !important;
  width: 100% !important;
  min-height: 225px !important;
  height: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  background: transparent !important;
  backdrop-filter: none !important;
}

.loader-showcase__card :deep(.fm-typing-loader__box) {
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
  min-height: 205px !important;
  padding: 20px 14px !important;
  border: 1px solid #edf1f3 !important;
  border-radius: 12px !important;
  background: #fff !important;
  box-shadow: none !important;
}

.loader-showcase__card :deep(.fm-typing-loader__title) {
  font-size: 16px !important;
  text-align: center;
}

.loader-showcase__card :deep(.fm-typing-loader__message) {
  max-width: 230px;
  margin-inline: auto;
  font-size: 12px !important;
  line-height: 1.35;
  text-align: center;
}

@media (max-width: 1180px) {
  .loader-showcase__grid {
    grid-template-columns: repeat(3, minmax(220px, 1fr));
  }
}

@media (max-width: 820px) {
  .loader-showcase {
    padding: 18px;
  }

  .loader-showcase__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .loader-showcase__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 540px) {
  .loader-showcase__grid {
    grid-template-columns: 1fr;
  }
}
</style>
