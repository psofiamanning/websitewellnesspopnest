-- Ejecutar una vez en Supabase → SQL Editor.
-- El nombre debe coincidir con `name` en src/data/packageOffers.js ("Paquete de 20 Clases")
-- para que insertCustomerPackageAfterPayment encuentre la fila al guardar la compra.
--
-- Ajusta columnas si tu tabla `packages` difiere (p. ej. sin `is_active`).

-- Paquete $4,500 MXN; máximo 20 reservaciones (primeras 2 sin descontar saldo del paquete); valor lista referencia 20×$250 = $5,000
INSERT INTO packages (name, total_classes, price, validity_days, is_active)
SELECT 'Paquete de 20 Clases', 20, 4500, 60, true
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Paquete de 20 Clases'
);
