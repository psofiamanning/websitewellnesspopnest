-- Evita que una compra de paquete se registre dos veces por el mismo pago cuando
-- la confirmación del navegador y el respaldo del webhook de Stripe llegan casi al
-- mismo tiempo (insertCustomerPackageAfterPayment hacía SELECT-antes-de-INSERT en
-- código, sin nada en la base que impidiera que ambos "ganaran" la carrera).
--
-- NULL no choca consigo mismo en Postgres, así que los paquetes otorgados por
-- administración (sin stripe_payment_intent_id) no se ven afectados.
--
-- (Caso real ya resuelto 2026-08-21: pi_3U5d3YA0gqRxLoT31Aexu7ku — paz barrera de
-- la mora, paquete "Descubre Popnest" duplicado en customer_packages id 22 y 23 por
-- esta misma carrera. Se fusionó en la fila 22 [6 clases totales, 4 disponibles,
-- dejándole la clase de más como cortesía] y se re-apuntó su reserva 107; la fila 23
-- se borró. Este ALTER TABLE ya debería poder correr sin chocar.)
--
-- Si en el futuro vuelve a haber un duplicado antes de correr esto, revisar con:
--
--   SELECT stripe_payment_intent_id, count(*), array_agg(id) AS ids
--   FROM public.customer_packages
--   WHERE stripe_payment_intent_id IS NOT NULL
--   GROUP BY stripe_payment_intent_id
--   HAVING count(*) > 1;
--
-- Ejecutar UNA VEZ en Supabase → SQL Editor, después de resolver los duplicados de arriba.

ALTER TABLE public.customer_packages
ADD CONSTRAINT customer_packages_stripe_pi_unique UNIQUE (stripe_payment_intent_id);
