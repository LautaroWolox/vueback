<template>
  <Dialog
    :visible="visible"
    modal
    :closable="false"
    :style="{ width }"
    class="fm-alert-dialog fm-alert-dialog--refined fm-responsive-dialog"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="fm-alert-header">
        <span class="fm-alert-title">{{ title }}</span>
        <button
          type="button"
          class="fm-alert-close-icon"
          aria-label="Cerrar alerta"
          title="Cerrar"
          @click="$emit('update:visible', false)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>
      </div>
    </template>

    <div class="fm-alert-body fm-alert-body--refined">
      <svg
        v-if="type === 'warning'"
        class="fm-alert-warning-icon"
        viewBox="0 0 64 58"
        aria-hidden="true"
      >
        <path d="M32 5 59 53H5L32 5Z" />
        <path d="M32 20v17" />
        <circle cx="32" cy="45" r="2.3" />
      </svg>

      <div class="fm-alert-message">
        <slot>{{ message }}</slot>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="fm-alert-close-action"
        @click="$emit('update:visible', false)"
      >
        {{ closeLabel }}
      </button>
    </template>
  </Dialog>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Alerta' },
  message: { type: String, default: '' },
  closeLabel: { type: String, default: 'CERRAR' },
  width: { type: String, default: '48rem' },
  type: { type: String, default: 'warning' }
})

defineEmits(['update:visible'])
</script>

<style>
.fm-alert-dialog--refined {
  max-width: calc(100vw - 28px) !important;
  overflow: hidden !important;
  border: 1px solid #d7e0e5 !important;
  border-radius: 10px !important;
  background: #fff !important;
  box-shadow: 0 18px 48px rgba(23, 49, 62, .24) !important;
}

.fm-alert-dialog--refined .p-dialog-header {
  min-height: 66px !important;
  padding: 0 !important;
  border-bottom: 1px solid #dce4e8 !important;
  background: #fff !important;
}

.fm-alert-header {
  width: 100%;
  min-height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 22px;
}

.fm-alert-title {
  color: #263746;
  font-size: 27px;
  font-weight: 400;
  line-height: 1;
}

.fm-alert-close-icon {
  width: 38px;
  min-width: 38px;
  height: 38px;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #aab8c0;
  cursor: pointer;
}

.fm-alert-close-icon:hover {
  background: #edf9fa;
  color: #008fa1;
}

.fm-alert-close-icon svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 3.2;
  stroke-linecap: round;
}

.fm-alert-dialog--refined .p-dialog-content {
  padding: 0 !important;
  background: #fff !important;
}

.fm-alert-body--refined {
  min-height: 138px;
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 26px 36px;
  color: #263746;
}

.fm-alert-warning-icon {
  width: 58px;
  min-width: 58px;
  height: 54px;
  fill: none;
  stroke: #e7353f;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 5px 4px rgba(231, 53, 63, .14));
}

.fm-alert-warning-icon circle {
  fill: #e7353f;
  stroke: none;
}

.fm-alert-message {
  color: #263746;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.45;
}

.fm-alert-dialog--refined .p-dialog-footer {
  min-height: 82px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  padding: 14px 22px !important;
  border-top: 1px solid #dce4e8 !important;
  background: #fff !important;
}

.fm-alert-close-action {
  width: 128px;
  min-width: 128px;
  height: 42px;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border: 1px solid #00a9bd;
  border-radius: 22px;
  background: #fff;
  color: #0093a6;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: none;
}

.fm-alert-close-action:hover {
  background: #ebfbfd;
  border-color: #008fa1;
  color: #007f90;
}

@media (max-width: 620px) {
  .fm-alert-title {
    font-size: 22px;
  }

  .fm-alert-body--refined {
    min-height: 120px;
    gap: 20px;
    padding: 22px;
  }

  .fm-alert-warning-icon {
    width: 48px;
    min-width: 48px;
  }

  .fm-alert-message {
    font-size: 16px;
  }
}
</style>
