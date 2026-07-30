<template>
  <svg
    class="filter-failed-icon"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      class="filter-failed-icon__funnel"
      d="M3 4H21L14 12V17L10 20V12L3 4Z"
    />

    <circle
      class="filter-failed-icon__badge"
      cx="18"
      cy="18"
      r="5"
    />
    <path
      class="filter-failed-icon__alert-line"
      d="M18 15.2V18.2"
    />
    <circle
      class="filter-failed-icon__alert-dot"
      cx="18"
      cy="20.2"
      r="0.7"
    />
  </svg>
</template>

<style scoped>
.filter-failed-icon {
  width: 18px;
  height: 18px;
  display: block;
  overflow: visible;
}

.filter-failed-icon__funnel {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.filter-failed-icon__badge {
  fill: currentColor;
}

.filter-failed-icon__alert-line {
  fill: none;
  stroke: #ffffff;
  stroke-width: 1.7;
  stroke-linecap: round;
}

.filter-failed-icon__alert-dot {
  fill: #ffffff;
}
</style>
