<template>
  <Dialog
    :visible="visible"
    modal
    header="Reproceso"
    class="fm-dialog otf-reprocess-dialog"
    :style="{ width: '38rem' }"
    @update:visible="cerrar"
  >
    <div class="fm-dialog-body otf-reprocess-body">
      <div class="otf-reprocess-icon">
        <i class="pi pi-refresh"></i>
      </div>

      <div class="otf-reprocess-message">
        <h3>Reproceso de órdenes</h3>

        <p>
          Se enviaron {{ count }}
          OT{{ count === 1 ? '' : 's' }} al proceso de reproceso.
        </p>
      </div>
    </div>

    <template #footer>
      <FmButton
        label="CERRAR"
        variant="outline"
        @click="cerrar"
      />
    </template>
  </Dialog>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:visible'])

const cerrar = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.otf-reprocess-body {
  min-height: 110px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.otf-reprocess-icon {
  width: 54px;
  min-width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e4f9fc;
  color: #008fa1;
}

.otf-reprocess-icon i {
  font-size: 24px;
}

.otf-reprocess-message {
  min-width: 0;
}

.otf-reprocess-message h3 {
  margin: 0 0 7px;
  color: #203947;
  font-size: 17px;
  font-weight: 500;
}

.otf-reprocess-message p {
  margin: 0;
  color: #607887;
  font-size: 13px;
  line-height: 1.5;
}

:global(.otf-reprocess-dialog .p-dialog-footer) {
  display: flex !important;
  justify-content: flex-end !important;
  padding: 12px 18px !important;
}
</style>