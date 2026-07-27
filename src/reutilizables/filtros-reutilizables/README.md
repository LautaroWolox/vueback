# Filtros reutilizables

Esta carpeta es la entrada oficial de los controles que forman los cajones de búsqueda.

## Disponible actualmente

```text
FmCompactSelect
```

## Segunda etapa

Después de validar la estructura con el equipo se agregarán wrappers, sin cambiar el aspecto actual:

```text
FmField
FmFilterGrid
FmInputText
FmTextarea
FmSelect
FmMultiSelect
FmDatePicker
FmCheckbox
```

## Responsabilidad de una pantalla nueva

La pantalla define:

- `v-model`;
- opciones;
- validaciones;
- valores iniciales;
- reglas de habilitación;
- Buscar y Limpiar.

Los componentes reutilizables definen:

- altura;
- borde;
- tipografía;
- label;
- estados focus y disabled;
- distribución responsive.

No se debe copiar el CSS de un filtro desde otra pantalla.
