# Acordeones y paneles reutilizables

## Disponible actualmente

```text
FmPanel
```

Las pantallas migradas también utilizan PrimeVue Accordion con las clases globales aprobadas.

## Segunda etapa

La estructura común será:

```text
FmAccordion
├── FmFilterPanel
└── FmResultsPanel
```

`FmFilterPanel` será responsable de:

- título del cajón;
- apertura y cierre;
- zona de filtros mediante slot;
- acciones Buscar y Limpiar;
- estado loading;
- comportamiento responsive.

`FmResultsPanel` será responsable de:

- título de resultados;
- apertura y cierre;
- zona de grilla mediante slot;
- expansión dentro de la pantalla.

## Transición

Los comportamientos globales actuales de acordeón se conservan porque también atienden pantallas legacy e iframes.

Una pantalla nueva deberá controlar el estado con props, emits y `v-model`, sin buscar encabezados ni ejecutar clicks mediante `document.querySelector`.
