<template>
  <svg
    class="failed-ots-icon"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      class="failed-ots-icon__triangle"
      d="M12 3.2L22 20.5H2L12 3.2Z"
    />
    <path
      class="failed-ots-icon__line"
      d="M12 9V14.2"
    />
    <circle
      class="failed-ots-icon__dot"
      cx="12"
      cy="17.3"
      r="1"
    />
  </svg>
</template>

<style scoped>
.failed-ots-icon {
  width: 18px;
  height: 18px;
  display: block;
  overflow: visible;
}

.failed-ots-icon__triangle {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.failed-ots-icon__line {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.failed-ots-icon__dot {
  fill: currentColor;
}
</style>
