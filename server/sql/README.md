# Migraciones SQL (Supabase)

Ejecutar en **Supabase → SQL Editor**, en orden. Si un script ya se aplicó, Supabase suele ignorar `IF NOT EXISTS` / duplicados; revisa el mensaje de error antes de continuar.

| Orden | Archivo | Para qué |
|------|---------|----------|
| 1 | `add_schedules_valid_from_until.sql` | Vigencia de horarios en `schedules` |
| 2 | `add_package_20_clases.sql` | Catálogo paquete 20 clases |
| 3 | `update_package_20_clases_22_total.sql` | 22 clases totales en paquete 20 |
| 4 | `update_package_prices_250mxn.sql` | Precios MXN en catálogo |
| 5 | `add_booking_package_credit_deducted.sql` | Columna cancelaciones con paquete |
| 6 | `add_discount_code_redemptions.sql` | **Requerido** para códigos de descuento |
| 7 | `add_meditacion_sabado_09.sql` | Horario meditación sábado |
| 8 | `remove_meditacion_lunes_08.sql` | Quitar horario obsoleto |
| 9 | `remove_hatha_yoga_1030.sql` | Quitar horario obsoleto |
| 10 | `update_sound_healing_0830_dom_mie_20h.sql` | Sound healing dom/mié |

Scripts **solo datos/horarios**: 7–10. Ajusta según lo que ya tengas en producción.

## Reemplazo de horario completo — agosto 2026

`update_horario_2026_agosto.sql` — **una sola corrida**. Reemplaza el horario
semanal completo por el nuevo (clases, días, horas y coaches), agrega las
clases **Belly Dance**, **Stretching** y **Meditación y Sound Healing**, da de
alta a la coach **Nadia Navarrete** y archiva **Yoga Vinyasa** (Hayde Ortiz).

- Es transaccional (`BEGIN/COMMIT`) e idempotente; se puede volver a correr.
- **No borra nada**: los slots viejos se retiran con `valid_until = ayer` o
  `status='inactive'`, conservando historial y reservas.
- Requiere `add_schedules_valid_from_until.sql` aplicado antes.
- Antes de correr, verifica que `public.teachers.full_name` coincida (acentos)
  y que `public.classes` / `public.teachers` no tengan columnas NOT NULL extra
  sin default (ver comentarios del script).
- **Run Club** NO va en la base: es gratis, sin reservación (sección
  informativa aparte).

## Permitir varios paquetes del mismo tipo por cliente

Si al comprar un **segundo** “Paquete de 10 Clases” falla con `customer_packages_customer_id_package_id_key` o `customer_packages_unique_active`, ejecutar **una vez**:

`drop_customer_packages_one_per_catalog.sql` (elimina **ambas** restricciones)

Sin este script, el panel **Otorgar paquete** y las compras repetidas del mismo catálogo fallan con error de clave duplicada.

| — | `add_customer_packages_admin_granted.sql` | Créditos **«Clases otorgadas — Administración»** (sin Stripe; el cliente elige fecha al reservar) |

## Obligatorio para funciones nuevas del frontend

- **`add_discount_code_redemptions.sql`** — reservas con código gratis (`BIENVENIDA`, `POPNEST`, etc.).
- **`add_booking_package_credit_deducted.sql`** — recomendado si usas paquetes y cancelaciones.
- **`add_booking_referred_by.sql`** — guarda el nombre de quien refirió en reservas de clase/coach.
- **`add_package_referred_by.sql`** — guarda el nombre de quien refirió en compras de paquete.

> Sin estos dos últimos, las reservas/compras siguen funcionando: el backend detecta la
> columna faltante y la omite (el nombre de referido simplemente no se guarda hasta correr el SQL).

## Consultas de clientes (solo lectura)

| Archivo | Para qué |
|---------|----------|
| `query_todos_los_clientes.sql` | Listado de todos los perfiles, foco en Georginas, paquetes y duplicados por email/nombre |
| `query_paquetes_por_cliente.sql` | Buscar paquetes por nombre (Emma, Georgina Navarrete, etc.) |
| `query_paquetes_emma_sandy_georgina.sql` | Emma, Sandy y Georgina Navarrete por email |
| `query_paquetes_activos.sql` | Paquetes activos de todo el estudio |

## Verificación rápida

```sql
select exists (
  select 1 from information_schema.tables
  where table_schema = 'public' and table_name = 'discount_code_redemptions'
) as tiene_descuentos;

select column_name from information_schema.columns
where table_name = 'bookings_new' and column_name = 'package_credit_deducted';
```
