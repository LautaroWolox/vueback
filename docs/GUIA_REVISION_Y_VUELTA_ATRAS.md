# Guía de revisión y vuelta atrás

Esta guía permite revisar `CajonesDeFiltros` con el equipo sin poner en riesgo `main`.

## Punto de respaldo

Antes de comenzar la reorganización de reutilizables se creó esta rama remota:

```text
respaldo-CajonesDeFiltros-antes-reutilizables
```

Apunta al commit:

```text
8862466181ba89a8bd776eb8548d1a54f5e6b9d9
```

Ese punto conserva el estado anterior a:

- la carpeta `src/reutilizables`;
- la eliminación de `FmActionButton`;
- las auditorías automáticas;
- la documentación de rollback.

## Probar la reorganización

```powershell
git fetch origin
git switch CajonesDeFiltros
git pull --ff-only origin CajonesDeFiltros

Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

npm install
npm run audit:ui
npm run type-check
npm run build
npm run dev
```

Después, recargar el navegador con `Ctrl + F5`.

## Volver a main sin borrar nada

Esta es la opción normal cuando termina la revisión:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
```

`main` no recibe ningún cambio mientras no se haga merge o fast-forward desde `CajonesDeFiltros`.

## Ver el estado exacto anterior

Para abrir el respaldo en una rama local independiente:

```powershell
git fetch origin
git switch -c revision-antes-reutilizables origin/respaldo-CajonesDeFiltros-antes-reutilizables
```

Esto permite ejecutar el aplicativo anterior y compararlo con la reorganización sin modificar ninguna rama remota.

Para volver después a la reorganización:

```powershell
git switch CajonesDeFiltros
git pull --ff-only origin CajonesDeFiltros
```

## Descartar cambios locales no confirmados

Primero revisar:

```powershell
git status
```

Para descartar modificaciones de archivos versionados:

```powershell
git restore --staged .
git restore .
```

Para borrar además archivos y carpetas locales no versionados:

```powershell
git clean -fd
```

`git clean -fd` elimina archivos no versionados. Debe ejecutarse solamente después de revisar `git status`.

## Recuperar el trabajo desde el respaldo sin reescribir historial

La alternativa más segura es crear otra rama desde el respaldo:

```powershell
git fetch origin
git switch -c CajonesDeFiltros-recuperada origin/respaldo-CajonesDeFiltros-antes-reutilizables
git push -u origin CajonesDeFiltros-recuperada
```

Así se conserva:

- la rama reorganizada para analizar qué ocurrió;
- la rama anterior para continuar trabajando;
- todo el historial de Git.

## Revertir la reorganización dentro de la misma rama

Solo después de acordarlo con el equipo:

```powershell
git fetch origin
git switch CajonesDeFiltros
git pull --ff-only origin CajonesDeFiltros

git revert --no-commit 8862466181ba89a8bd776eb8548d1a54f5e6b9d9..HEAD
git commit -m "Revertir reorganización de reutilizables"
git push origin CajonesDeFiltros
```

Este método crea un commit de reversión y conserva el historial. Si Git informa conflictos, no se debe continuar automáticamente: hay que resolverlos y repetir las pruebas antes del push.

## Regla para main

No usar en `main`:

```text
git push --force
git reset --hard <otro-commit> seguido de push forzado
```

La integración a `main` debe hacerse únicamente después de:

1. auditorías locales;
2. `type-check`;
3. `build`;
4. revisión visual de las pantallas;
5. aprobación del equipo.
