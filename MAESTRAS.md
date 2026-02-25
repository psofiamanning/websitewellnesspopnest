# Acceso para profesores

Los profesores e instructores pueden ver las **reservas de sus próximas clases** en un panel propio (solo ven las clases que imparten).

## Cómo acceder

1. **URL de acceso:** `/profesores/login`  
   Ejemplo: `https://tudominio.com/profesores/login`
2. Iniciar sesión con el **correo y contraseña** que les haya dado el estudio.
3. Tras el login se muestra el panel **Mis próximas clases** con las reservas confirmadas agrupadas por fecha y por clase/hora, con nombre y correo de cada alumno.

## Credenciales por defecto (primera vez)

Si no existe el archivo `server/teachers.json`, el servidor lo crea con estas cuentas. **Cambia las contraseñas en producción** editando `server/teachers.json` en el servidor.

| Profesor/a               | Correo                      | Contraseña por defecto |
|--------------------------|-----------------------------|-------------------------|
| Blanca Bear              | blanca@estudiopopnest.com   | Blanca2026              |
| Brenda Granados Segovia  | brenda@estudiopopnest.com   | Brenda2026              |
| Madeline Rojas Givaudan  | maderogiv@gmail.com         | Madeline2026            |

El **nombre** en cada cuenta debe coincidir exactamente con el que aparece en las reservas (según `src/data/classes.js`). Si cambias el nombre de un profesor en la web, actualiza también su entrada en `server/teachers.json`.

## Cambiar contraseña o correo de un profesor

Edita el archivo `server/teachers.json` en el servidor. La estructura de cada cuenta es:

```json
{
  "id": "teacher-1",
  "email": "blanca@estudiopopnest.com",
  "password": "Blanca2026",
  "name": "Blanca Bear",
  "teacherId": 1
}
```

- **name:** debe ser exactamente el mismo que en la reserva (`teacherName`), para que se filtren sus clases.
- **teacherId:** debe coincidir con el `id` del profesor en `src/data/classes.js` (1, 2, 3).

No hace falta reiniciar el servidor al guardar cambios en `teachers.json`.

## Qué ven los profesores

- Solo reservas con **estado confirmado**.
- Solo clases cuyo **profesor** coincide con su nombre en el sistema.
- Solo fechas **hoy o futuras** (no reservas pasadas).
- Para cada clase: fecha, hora, nombre de la clase, lista de alumnos (nombre completo y correo).

No pueden ver ingresos, otros profesores ni el panel de administración.
