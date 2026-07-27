# Auditoría de imágenes

## Uso confirmado

### `src/assets/images/FM_login.png`

La imagen existe en el repositorio y se utiliza en:

```text
src/views/Login2faView.vue
```

La referencia está dentro del fondo del panel de marca:

```css
background: url('@/assets/images/FM_login.png') center / contain no-repeat;
```

No debe eliminarse mientras ese diseño del login continúe activo.

## Elementos visuales que no son archivos de imagen

Los siguientes elementos no dependen de archivos dentro de `src/assets/images`:

- `FmTypingLoader`: utiliza un SVG embebido en el propio componente;
- iconos del menú: utilizan PrimeIcons;
- iconos de las acciones de grilla: utilizan PrimeIcons;
- iconos especiales de Nota e Incluir OT: utilizan SVG embebido;
- icono Limpiar de `FmButton`: utiliza SVG embebido.

Estos recursos no aparecerán como archivos PNG/JPG/SVG independientes en la auditoría de la carpeta de imágenes.

## Auditoría completa local

Ejecutar:

```powershell
npm run audit:images
```

El comando recorre:

```text
src/assets/images
```

y busca referencias en:

```text
src/
public/
```

Resultado esperado por cada archivo:

```text
[USADA] src/assets/images/archivo.png
  - src/ruta/Componente.vue

[SIN REFERENCIAS] src/assets/images/otra-imagen.png
```

## Modo estricto

```powershell
npm run audit:images:strict
```

En modo estricto el comando finaliza con error cuando encuentra imágenes sin referencias. Está pensado para revisión del equipo o CI, no para borrar archivos automáticamente.

## Regla de eliminación

Una imagen solo debe eliminarse después de comprobar:

1. que figura como `SIN REFERENCIAS`;
2. que no es consumida dinámicamente por nombre desde el backend;
3. que no la utiliza una pantalla legacy dentro de un iframe;
4. que el build y la revisión visual continúan correctos.

La auditoría informa; nunca borra archivos.
