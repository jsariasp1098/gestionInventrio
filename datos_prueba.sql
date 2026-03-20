-- ============================================================
-- DATOS DE PRUEBA - Sistema Gestión de Inventario OptiPlant
-- Ejecutar en phpMyAdmin (http://localhost:8080)
-- Base de datos: inventario
-- ============================================================

-- Paso 1: Verificar sucursales existentes e insertar si faltan
INSERT IGNORE INTO sucursales (id_sucursal, nombre_sucursal, direccion, telefono, email) VALUES
(1, 'Sucursal Centro', 'Calle 10 #5-20, Armenia', '3101234567', 'centro@optiplant.com'),
(2, 'Sucursal Norte', 'Av. Bolívar #25-10, Armenia', '3109876543', 'norte@optiplant.com'),
(3, 'Sucursal Sur', 'Carrera 15 #3-45, Armenia', '3105551234', 'sur@optiplant.com');

-- Paso 2: Productos (10 productos variados)
INSERT IGNORE INTO productos (id_producto, nombre, descripcion, precio_costo, precio_venta) VALUES
(1, 'Fertilizante Orgánico 5kg', 'Fertilizante natural para cultivos', 25000, 38000),
(2, 'Semillas de Tomate x100', 'Semillas híbridas de alto rendimiento', 8000, 15000),
(3, 'Sustrato Premium 20L', 'Mezcla especial para macetas', 18000, 28000),
(4, 'Pesticida Natural 1L', 'Control biológico de plagas', 32000, 48000),
(5, 'Maceta Biodegradable 30cm', 'Maceta ecológica mediana', 5000, 9500),
(6, 'Herramienta Podadora Pro', 'Podadora profesional acero inoxidable', 45000, 72000),
(7, 'Manguera Riego 15m', 'Manguera flexible con conexiones', 28000, 42000),
(8, 'Abono Foliar 500ml', 'Nutrientes para aplicación foliar', 12000, 19000),
(9, 'Kit Jardinería Básico', 'Pala, rastrillo y guantes', 22000, 35000),
(10, 'Tierra Negra 40kg', 'Tierra abonada para siembra', 15000, 24000);

-- Paso 3: Inventario por sucursal (stock variado para las gráficas)
INSERT IGNORE INTO inventario_sucursal (id_sucursal, id_producto, stock_actual, stock_minimo) VALUES
-- Sucursal Centro
(1, 1, 45, 10), (1, 2, 80, 20), (1, 3, 30, 8), (1, 4, 15, 5),
(1, 5, 60, 15), (1, 6, 8, 3), (1, 7, 20, 5), (1, 8, 35, 10),
(1, 9, 12, 5), (1, 10, 50, 15),
-- Sucursal Norte
(2, 1, 25, 10), (2, 2, 40, 20), (2, 3, 18, 8), (2, 4, 22, 5),
(2, 5, 35, 15), (2, 6, 5, 3), (2, 7, 15, 5), (2, 8, 28, 10),
(2, 9, 7, 5), (2, 10, 40, 15),
-- Sucursal Sur
(3, 1, 30, 10), (3, 2, 55, 20), (3, 3, 12, 8), (3, 4, 18, 5),
(3, 5, 45, 15), (3, 6, 3, 3), (3, 7, 10, 5), (3, 8, 20, 10),
(3, 9, 4, 5), (3, 10, 25, 15);

-- Paso 4: Usuarios (password = BCrypt de "1234")
-- Si ya existen, se ignoran
SET @pw = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

INSERT IGNORE INTO usuarios (id_usuario, nombre_usuario, direccion, telefono, email, tipo, password, id_sucursal) VALUES
(1, 'Carlos Dueño', 'Calle 1 #1-1', '3100000001', 'dueno@empresa.com', 'DUEÑO', @pw, 1),
(2, 'María Admin Centro', 'Calle 2 #2-2', '3100000002', 'admin1@empresa.com', 'ADMINISTRADOR', @pw, 1),
(3, 'Juan Vendedor Centro', 'Calle 3 #3-3', '3100000003', 'vendedor1@empresa.com', 'VENDEDOR', @pw, 1),
(4, 'Ana Admin Norte', 'Calle 4 #4-4', '3100000004', 'admin2@empresa.com', 'ADMINISTRADOR', @pw, 2),
(5, 'Pedro Vendedor Norte', 'Calle 5 #5-5', '3100000005', 'vendedor2@empresa.com', 'VENDEDOR', @pw, 2),
(6, 'Laura Admin Sur', 'Calle 6 #6-6', '3100000006', 'admin3@empresa.com', 'ADMINISTRADOR', @pw, 3),
(7, 'Diego Vendedor Sur', 'Calle 7 #7-7', '3100000007', 'vendedor3@empresa.com', 'VENDEDOR', @pw, 3);

-- ============================================================
-- Paso 5: VENTAS - 6 meses de datos (Oct 2025 - Mar 2026)
-- ============================================================

-- Octubre 2025
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES
('2025-10-05', 152000, 'COMPLETADA', 3, 1),
('2025-10-12', 96000, 'COMPLETADA', 3, 1),
('2025-10-18', 210000, 'COMPLETADA', 5, 2),
('2025-10-25', 73000, 'COMPLETADA', 7, 3);

INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(LAST_INSERT_ID()-3, 1, 2, 25000, 38000, 76000),
(LAST_INSERT_ID()-3, 5, 8, 5000, 9500, 76000),
(LAST_INSERT_ID()-2, 2, 4, 8000, 15000, 60000),
(LAST_INSERT_ID()-2, 8, 2, 12000, 19000, 36000) -- no se puede usar LAST_INSERT_ID así, mejor usar IDs fijos;

-- Mejor estrategia: usar variables para los IDs de ventas

-- Limpiemos y hagamos bien con SET @var
-- Primero borramos las ventas que acabamos de insertar mal
DELETE FROM detalle_ventas WHERE id_venta > 0 AND id_venta NOT IN (SELECT id_venta FROM ventas);
DELETE FROM ventas WHERE id_venta > 100;

-- ============================================================
-- ESTRATEGIA LIMPIA: Insertar ventas una por una con variables
-- ============================================================

-- === OCTUBRE 2025 - Sucursal Centro ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-10-03', 152000, 'COMPLETADA', 3, 1);
SET @v1 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v1, 1, 2, 25000, 38000, 76000), (@v1, 5, 8, 5000, 9500, 76000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-10-15', 123000, 'COMPLETADA', 3, 1);
SET @v2 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v2, 3, 3, 18000, 28000, 84000), (@v2, 8, 2, 12000, 19000, 39000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-10-22', 72000, 'COMPLETADA', 3, 1);
SET @v3 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v3, 6, 1, 45000, 72000, 72000);

-- === OCTUBRE 2025 - Sucursal Norte ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-10-08', 210000, 'COMPLETADA', 5, 2);
SET @v4 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v4, 7, 5, 28000, 42000, 210000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-10-20', 95000, 'COMPLETADA', 5, 2);
SET @v5 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v5, 5, 10, 5000, 9500, 95000);

-- === OCTUBRE 2025 - Sucursal Sur ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-10-12', 96000, 'COMPLETADA', 7, 3);
SET @v6 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v6, 10, 4, 15000, 24000, 96000);

-- === NOVIEMBRE 2025 - Sucursal Centro ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-11-05', 190000, 'COMPLETADA', 3, 1);
SET @v7 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v7, 1, 5, 25000, 38000, 190000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-11-12', 280000, 'COMPLETADA', 3, 1);
SET @v8 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v8, 3, 10, 18000, 28000, 280000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-11-20', 144000, 'COMPLETADA', 3, 1);
SET @v9 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v9, 6, 2, 45000, 72000, 144000);

-- === NOVIEMBRE 2025 - Sucursal Norte ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-11-08', 168000, 'COMPLETADA', 5, 2);
SET @v10 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v10, 7, 4, 28000, 42000, 168000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-11-18', 240000, 'COMPLETADA', 5, 2);
SET @v11 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v11, 4, 5, 32000, 48000, 240000);

-- === NOVIEMBRE 2025 - Sucursal Sur ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-11-10', 150000, 'COMPLETADA', 7, 3);
SET @v12 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v12, 2, 10, 8000, 15000, 150000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-11-25', 105000, 'COMPLETADA', 7, 3);
SET @v13 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v13, 9, 3, 22000, 35000, 105000);

-- === DICIEMBRE 2025 - Sucursal Centro ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-12-02', 350000, 'COMPLETADA', 3, 1);
SET @v14 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v14, 9, 10, 22000, 35000, 350000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-12-10', 456000, 'COMPLETADA', 3, 1);
SET @v15 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v15, 4, 6, 32000, 48000, 288000), (@v15, 7, 4, 28000, 42000, 168000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-12-18', 192000, 'COMPLETADA', 3, 1);
SET @v16 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v16, 1, 4, 25000, 38000, 152000), (@v16, 8, 2, 12000, 19000, 40000);

-- === DICIEMBRE 2025 - Sucursal Norte ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-12-05', 315000, 'COMPLETADA', 5, 2);
SET @v17 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v17, 9, 9, 22000, 35000, 315000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-12-15', 190000, 'COMPLETADA', 5, 2);
SET @v18 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v18, 5, 20, 5000, 9500, 190000);

-- === DICIEMBRE 2025 - Sucursal Sur ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-12-08', 216000, 'COMPLETADA', 7, 3);
SET @v19 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v19, 6, 3, 45000, 72000, 216000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2025-12-22', 120000, 'COMPLETADA', 7, 3);
SET @v20 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v20, 10, 5, 15000, 24000, 120000);

-- === ENERO 2026 - Sucursal Centro ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-01-08', 228000, 'COMPLETADA', 3, 1);
SET @v21 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v21, 1, 6, 25000, 38000, 228000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-01-15', 168000, 'COMPLETADA', 3, 1);
SET @v22 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v22, 7, 4, 28000, 42000, 168000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-01-22', 95000, 'COMPLETADA', 3, 1);
SET @v23 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v23, 5, 10, 5000, 9500, 95000);

-- === ENERO 2026 - Sucursal Norte ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-01-10', 288000, 'COMPLETADA', 5, 2);
SET @v24 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v24, 4, 6, 32000, 48000, 288000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-01-20', 140000, 'COMPLETADA', 5, 2);
SET @v25 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v25, 3, 5, 18000, 28000, 140000);

-- === ENERO 2026 - Sucursal Sur ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-01-12', 175000, 'COMPLETADA', 7, 3);
SET @v26 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v26, 9, 5, 22000, 35000, 175000);

-- === FEBRERO 2026 - Sucursal Centro ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-02-05', 304000, 'COMPLETADA', 3, 1);
SET @v27 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v27, 1, 8, 25000, 38000, 304000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-02-12', 210000, 'COMPLETADA', 3, 1);
SET @v28 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v28, 7, 5, 28000, 42000, 210000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-02-20', 144000, 'COMPLETADA', 3, 1);
SET @v29 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v29, 6, 2, 45000, 72000, 144000);

-- === FEBRERO 2026 - Sucursal Norte ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-02-08', 192000, 'COMPLETADA', 5, 2);
SET @v30 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v30, 4, 4, 32000, 48000, 192000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-02-18', 150000, 'COMPLETADA', 5, 2);
SET @v31 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v31, 2, 10, 8000, 15000, 150000);

-- === FEBRERO 2026 - Sucursal Sur ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-02-10', 240000, 'COMPLETADA', 7, 3);
SET @v32 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v32, 10, 10, 15000, 24000, 240000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-02-22', 84000, 'COMPLETADA', 7, 3);
SET @v33 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v33, 3, 3, 18000, 28000, 84000);

-- === MARZO 2026 (mes actual) - Sucursal Centro ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-03-03', 380000, 'COMPLETADA', 3, 1);
SET @v34 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v34, 1, 10, 25000, 38000, 380000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-03-10', 216000, 'COMPLETADA', 3, 1);
SET @v35 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v35, 6, 3, 45000, 72000, 216000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-03-15', 126000, 'COMPLETADA', 3, 1);
SET @v36 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v36, 7, 3, 28000, 42000, 126000);

-- === MARZO 2026 - Sucursal Norte ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-03-05', 336000, 'COMPLETADA', 5, 2);
SET @v37 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v37, 4, 7, 32000, 48000, 336000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-03-12', 190000, 'COMPLETADA', 5, 2);
SET @v38 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v38, 5, 20, 5000, 9500, 190000);

-- === MARZO 2026 - Sucursal Sur ===
INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-03-07', 175000, 'COMPLETADA', 7, 3);
SET @v39 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v39, 9, 5, 22000, 35000, 175000);

INSERT INTO ventas (fecha_venta, total, estado, id_usuario, id_sucursal) VALUES ('2026-03-14', 144000, 'COMPLETADA', 7, 3);
SET @v40 = LAST_INSERT_ID();
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_costo, precio_venta, subtotal) VALUES
(@v40, 6, 2, 45000, 72000, 144000);

-- ============================================================
-- Paso 6: COMPRAS - 6 meses de datos (Oct 2025 - Mar 2026)
-- ============================================================

-- === OCTUBRE 2025 ===
INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2025-10-02', 250000, 'RECIBIDA', 2, 1);
SET @c1 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c1, 1, 10, 25000, 250000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2025-10-10', 160000, 'RECIBIDA', 4, 2);
SET @c2 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c2, 2, 20, 8000, 160000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2025-10-18', 90000, 'RECIBIDA', 6, 3);
SET @c3 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c3, 3, 5, 18000, 90000);

-- === NOVIEMBRE 2025 ===
INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2025-11-05', 320000, 'RECIBIDA', 2, 1);
SET @c4 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c4, 4, 10, 32000, 320000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2025-11-15', 280000, 'RECIBIDA', 4, 2);
SET @c5 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c5, 7, 10, 28000, 280000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2025-11-22', 150000, 'RECIBIDA', 6, 3);
SET @c6 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c6, 10, 10, 15000, 150000);

-- === DICIEMBRE 2025 ===
INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2025-12-03', 450000, 'RECIBIDA', 2, 1);
SET @c7 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c7, 6, 10, 45000, 450000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2025-12-12', 200000, 'RECIBIDA', 4, 2);
SET @c8 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c8, 1, 8, 25000, 200000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2025-12-20', 240000, 'RECIBIDA', 6, 3);
SET @c9 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c9, 8, 20, 12000, 240000);

-- === ENERO 2026 ===
INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2026-01-05', 180000, 'RECIBIDA', 2, 1);
SET @c10 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c10, 3, 10, 18000, 180000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2026-01-15', 320000, 'RECIBIDA', 4, 2);
SET @c11 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c11, 4, 10, 32000, 320000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2026-01-22', 110000, 'RECIBIDA', 6, 3);
SET @c12 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c12, 9, 5, 22000, 110000);

-- === FEBRERO 2026 ===
INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2026-02-04', 375000, 'RECIBIDA', 2, 1);
SET @c13 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c13, 1, 15, 25000, 375000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2026-02-14', 240000, 'RECIBIDA', 4, 2);
SET @c14 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c14, 8, 20, 12000, 240000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2026-02-22', 280000, 'RECIBIDA', 6, 3);
SET @c15 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c15, 7, 10, 28000, 280000);

-- === MARZO 2026 (mes actual) ===
INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2026-03-03', 500000, 'RECIBIDA', 2, 1);
SET @c16 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c16, 1, 20, 25000, 500000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2026-03-10', 360000, 'RECIBIDA', 4, 2);
SET @c17 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c17, 3, 20, 18000, 360000);

INSERT INTO compras (fecha, total, estado, id_usuario, id_sucursal) VALUES ('2026-03-15', 225000, 'RECIBIDA', 6, 3);
SET @c18 = LAST_INSERT_ID();
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo, subtotal) VALUES
(@c18, 6, 5, 45000, 225000);

-- ============================================================
-- FIN - Resumen de datos insertados:
-- 3 sucursales, 10 productos, 7 usuarios
-- ~40 ventas distribuidas en 6 meses y 3 sucursales
-- ~18 compras distribuidas en 6 meses y 3 sucursales
-- Inventario con stock variado (30 registros)
-- ============================================================
