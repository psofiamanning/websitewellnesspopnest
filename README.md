# Estudio Popnest Wellness - Sistema de Reservas

Sistema web para reservar clases en el Estudio Popnest Wellness. Los usuarios pueden hacer clic en un profesor o en una clase para ver las fechas disponibles y seleccionar el día y hora de su preferencia.

## Características

- ✅ Visualización de profesores y clases disponibles
- ✅ Reserva por profesor o por clase
- ✅ Calendario interactivo con fechas disponibles
- ✅ Selección de horarios según disponibilidad configurada
- ✅ Interfaz moderna y responsive
- ✅ Confirmación de reservas

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm run dev
```

3. Abre tu navegador en `http://localhost:5173`

## Configuración de Clases

Puedes editar la configuración de clases, profesores y horarios en `src/data/classes.js`:

- **teachers**: Lista de profesores con su información
- **classTypes**: Tipos de clases disponibles
- **classSchedules**: Horarios disponibles por clase
- **teacherSchedules**: Horarios disponibles por profesor

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Calendar.jsx     # Componente de calendario
│   └── TimeSlotSelector.jsx  # Selector de horarios
├── data/               # Datos de configuración
│   └── classes.js      # Configuración de clases y profesores
├── pages/              # Páginas de la aplicación
│   ├── Home.jsx        # Página principal
│   └── Booking.jsx     # Página de reserva
├── App.jsx             # Componente principal
└── main.jsx            # Punto de entrada
```

## Uso

1. En la página principal, los usuarios pueden:
   - Ver todos los profesores disponibles
   - Ver todas las clases disponibles
   - Hacer clic en cualquier profesor o clase para reservar

2. En la página de reserva:
   - Seleccionar una fecha disponible en el calendario
   - Elegir un horario disponible
   - Confirmar la reserva

## Tecnologías

- React 18
- React Router DOM
- Tailwind CSS
- date-fns (para manejo de fechas)
- Vite (build tool)

## Próximos Pasos

- Conectar con backend para guardar reservas
- Sistema de autenticación de usuarios
- Panel de administración para gestionar clases
- Notificaciones por email
- Cancelación de reservas
