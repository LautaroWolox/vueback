<template>
  <div ref="root" class="fm-date-picker ct-date-picker" :class="{ 'ct-date-picker--disabled': disabled }">
    <button
      :id="inputId"
      type="button"
      class="fm-date-button ct-date-button"
      :class="{ active: open }"
      :disabled="disabled"
      @click="toggle"
    >
      <span :class="{ placeholder: !selectedDate }">{{ displayValue }}</span>
      <i class="pi pi-calendar" aria-hidden="true"></i>
    </button>

    <div v-if="open" class="fm-calendar ct-calendar">
      <div class="fm-calendar-head ct-calendar-head">
        <button type="button" class="ct-nav" aria-label="Mes anterior" @click="previousMonth">‹</button>
        <div class="ct-calendar-title">
          <strong>{{ monthNames[viewMonth] }}</strong>
          <select v-model.number="viewYear" aria-label="Año">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        <button type="button" class="ct-nav" aria-label="Mes siguiente" @click="nextMonth">›</button>
      </div>

      <div class="ct-weekdays">
        <span v-for="day in weekdays" :key="day">{{ day }}</span>
      </div>

      <div class="ct-days">
        <button
          v-for="day in calendarDays"
          :key="day.key"
          type="button"
          :class="{
            outside: !day.current,
            selected: isSelected(day.date),
            today: isToday(day.date)
          }"
          @click="selectDay(day.date)"
        >
          {{ day.date.getDate() }}
        </button>
      </div>

      <div class="ct-calendar-actions">
        <button type="button" @click="clear">Borrar</button>
        <button type="button" @click="selectToday">Hoy</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [Date, String, null], default: null },
  placeholder: { type: String, default: 'Seleccionar fecha' },
  inputId: { type: String, default: undefined },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
const root = ref(null)
const open = ref(false)
const now = new Date()
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const weekdays = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA']

const toDate = (value) => {
  if (!value) return null
  const date = value instanceof Date ? new Date(value) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const selectedDate = computed(() => toDate(props.modelValue))
const viewMonth = ref(selectedDate.value?.getMonth() ?? now.getMonth())
const viewYear = ref(selectedDate.value?.getFullYear() ?? now.getFullYear())
const years = computed(() => Array.from({ length: 21 }, (_, index) => now.getFullYear() - 10 + index))
const two = (value) => String(value).padStart(2, '0')
const sameDay = (a, b) => Boolean(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate())

const displayValue = computed(() => selectedDate.value
  ? `${two(selectedDate.value.getDate())}/${two(selectedDate.value.getMonth() + 1)}/${selectedDate.value.getFullYear()}`
  : props.placeholder)

const calendarDays = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      current: date.getMonth() === viewMonth.value
    }
  })
})

const toggle = () => {
  if (!props.disabled) open.value = !open.value
}
const isSelected = (date) => sameDay(date, selectedDate.value)
const isToday = (date) => sameDay(date, now)
const selectDay = (date) => {
  emit('update:modelValue', new Date(date))
  open.value = false
}
const selectToday = () => {
  const today = new Date()
  viewMonth.value = today.getMonth()
  viewYear.value = today.getFullYear()
  selectDay(today)
}
const clear = () => {
  emit('update:modelValue', null)
  open.value = false
}
const previousMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}
const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}
const close = (event) => {
  if (!root.value || root.value.contains(event.target)) return
  open.value = false
}

watch(selectedDate, (value) => {
  if (!value) return
  viewMonth.value = value.getMonth()
  viewYear.value = value.getFullYear()
})
watch(() => props.disabled, (value) => {
  if (value) open.value = false
})

onMounted(() => document.addEventListener('mousedown', close))
onBeforeUnmount(() => document.removeEventListener('mousedown', close))
</script>

<style scoped>
.ct-date-picker {
  position: relative;
  width: 100%;
}

.ct-date-button {
  height: 30px;
  cursor: pointer;
}

.ct-date-button .placeholder {
  color: #7a8b94;
}

.ct-date-button i {
  color: #526b78;
  font-size: 13px;
}

.ct-date-picker--disabled .ct-date-button {
  background: #edf1f3;
  color: #84939c;
  cursor: not-allowed;
}

.ct-calendar {
  position: absolute;
  z-index: 2200;
  top: calc(100% + 4px);
  left: 0;
}

.ct-calendar-head {
  display: grid;
  grid-template-columns: 30px 1fr 30px;
  align-items: center;
  gap: 4px;
}

.ct-nav {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #1f3b4a;
  font-size: 22px;
  cursor: pointer;
}

.ct-nav:hover {
  background: #e4f9fc;
  color: #008fa1;
}

.ct-calendar-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #1f3b4a;
  font-size: 12px;
}

.ct-calendar-title select {
  height: 26px;
  border: 1px solid #c5d1d8;
  border-radius: 3px;
  background: #fff;
  color: #263746;
  font-size: 12px;
}

.ct-weekdays,
.ct-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.ct-weekdays {
  padding: 7px 0 3px;
  color: #657b87;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
}

.ct-days button {
  width: 31px;
  height: 31px;
  justify-self: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #263746;
  font-size: 11px;
  cursor: pointer;
}

.ct-days button:hover {
  background: #e4f9fc;
  color: #006f7d;
}

.ct-days button.outside {
  color: #c3cbd0;
}

.ct-days button.today {
  box-shadow: inset 0 0 0 1px #00a9bd;
}

.ct-days button.selected {
  background: #00a9bd;
  color: #fff;
  box-shadow: none;
}

.ct-calendar-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  padding-top: 7px;
  border-top: 1px solid #e2e8eb;
}

.ct-calendar-actions button {
  min-width: 74px;
  height: 29px;
  border: 1px solid #00a9bd;
  border-radius: 5px;
  background: #fff;
  color: #008fa1;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.ct-calendar-actions button:last-child {
  background: #00a9bd;
  color: #fff;
}
</style>
