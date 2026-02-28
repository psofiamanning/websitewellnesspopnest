## Marketing assets (solo equipo interno)

Este directorio está pensado como un espacio **no público** para guardar imágenes y otros archivos que se usarán más adelante en campañas de marketing (por ejemplo, para correos promocionales).

- Ruta en el servidor: `server/marketing-assets/`
- No hay ningún endpoint ni ruta pública que sirva archivos directamente desde aquí.
- Las imágenes se pueden referenciar desde scripts internos o herramientas de envío de correo, pero no se exponen en la web de forma directa.

### Buenas prácticas

- Usa subcarpetas por campaña, por ejemplo:
  - `newsletter-2026-03/`
  - `lanzamiento-paquetes-verano/`
- Nombra los archivos de forma descriptiva, por ejemplo:
  - `banner-newsletter-marzo.png`
  - `header-paquetes-yoga-verano.jpg`
- Evita subir archivos extremadamente pesados; optimiza las imágenes para correo (ancho entre 600 y 1200px suele ser suficiente).

> Nota: si quieres que estos archivos **no se suban al repositorio**, puedes mantener solo este `README.md` versionado y añadir una regla en `.gitignore` para ignorar las demás imágenes.

