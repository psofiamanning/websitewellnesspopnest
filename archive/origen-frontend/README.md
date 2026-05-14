# Copia de respaldo del frontend (antes del home nuevo en React)

Esta carpeta **no la importa Vite**; son solo referencias legibles.

| Archivo | Origen | Contenido |
|---------|--------|-----------|
| `Home.clasico.jsx` | Último commit en `main` (`git show HEAD:src/pages/Home.jsx`) | Home anterior (Tailwind, galería horizontal, bloques Horarios / Ubicación / FAQ, etc.). |
| `App.clasico.jsx` | Último commit (`git show HEAD:src/App.jsx`) | Router y layout global tal como estaban antes de ocultar el navbar en `/` y `/home-redesign`. |

## Cómo recuperar algo en el proyecto

- Ver una versión concreta: `git show <commit>:ruta/al/archivo`
- Listar cambios de un archivo: `git log --oneline -- src/pages/Home.jsx`

## Preview del home en iframe (`HomeRedesign` grande)

Esa versión **no llegó a estar en el historial de git** (archivo sin trackear). Si la necesitas otra vez, habría que reconstruirla desde el historial local del editor o volver a generar el `srcDoc` a partir del diseño actual.
