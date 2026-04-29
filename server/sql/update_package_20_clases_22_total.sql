-- total_classes = 20 (máx. reservaciones); primeras 2 sin descontar classes_remaining.

UPDATE packages
SET
  total_classes = 20,
  price = 3600
WHERE name = 'Paquete de 20 Clases';
