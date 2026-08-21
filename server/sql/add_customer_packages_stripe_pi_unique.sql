-- Evita que una compra de paquete se registre dos veces por el mismo pago cuando
-- la confirmación del navegador y el respaldo del webhook de Stripe llegan casi al
-- mismo tiempo (insertCustomerPackageAfterPayment hacía SELECT-antes-de-INSERT en
-- código, sin nada en la base que impidiera que ambos "ganaran" la carrera).
--
-- NULL no choca consigo mismo en Postgres, así que los paquetes otorgados por
-- administración (sin stripe_payment_intent_id) no se ven afectados.
--
-- ⚠️ YA EXISTE UN CASO REAL DUPLICADO (encontrado 2026-08-21, antes de este fix):
-- pi_3U5d3YA0gqRxLoT31Aexu7ku — paz barrera de la mora (pbarrera@gamaimpresores.com),
-- paquete "Descubre Popnest", filas customer_packages id 22 y 23, creadas con 65ms de
-- diferencia. Le quedaron 4 clases disponibles (2+2) en vez de las 3 que pagó una vez
-- ($550 MXN). Este ALTER TABLE fallará hasta que se resuelva ese duplicado — decide
-- primero cómo ajustar el saldo de esa clienta (¿le dejas la clase de más como cortesía,
-- le restas las 2 clases de más, o contactas para aclarar?) y borra o fusiona la fila
-- sobrante manualmente. Para volver a encontrar duplicados:
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
