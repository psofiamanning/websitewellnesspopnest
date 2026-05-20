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

## Obligatorio para funciones nuevas del frontend

- **`add_discount_code_redemptions.sql`** — reservas con código gratis (`BIENVENIDA`, `POPNEST`, etc.).
- **`add_booking_package_credit_deducted.sql`** — recomendado si usas paquetes y cancelaciones.

## Verificación rápida

```sql
select exists (
  select 1 from information_schema.tables
  where table_schema = 'public' and table_name = 'discount_code_redemptions'
) as tiene_descuentos;

select column_name from information_schema.columns
where table_name = 'bookings_new' and column_name = 'package_credit_deducted';
```
