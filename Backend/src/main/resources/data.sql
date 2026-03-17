-- =============================================
-- DATOS INICIALES DE PRUEBA
-- Se ejecuta cada vez que la app arranca
-- Usa INSERT IGNORE para no duplicar registros
-- =============================================

-- SUCURSALES
INSERT IGNORE INTO sucursales (id_sucursal, nombre_sucursal, direccion, telefono, email) VALUES
(1, 'Sucursal Centro', 'Calle 10 #5-20, Armenia', '3101234567', 'centro@optiplant.com'),
(2, 'Sucursal Norte', 'Av. Bolívar #25-30, Armenia', '3109876543', 'norte@optiplant.com'),
(3, 'Sucursal Sur', 'Carrera 19 #40-15, Armenia', '3105551234', 'sur@optiplant.com');

-- USUARIOS (tipos: VENDEDOR, ADMINISTRADOR, DUEÑO)
INSERT IGNORE INTO usuarios (id_usuario, nombre_usuario, direccion, telefono, email, tipo, id_sucursal) VALUES
(1, 'Carlos Admin', 'Calle 15 #8-10', '3001112233', 'carlos@optiplant.com', 'ADMINISTRADOR', 1),
(2, 'María Vendedora', 'Carrera 20 #12-5', '3004445566', 'maria@optiplant.com', 'VENDEDOR', 1),
(3, 'Juan Dueño', 'Av. 19 #30-40', '3007778899', 'juan@optiplant.com', 'DUEÑO', 2),
(4, 'Ana Vendedora', 'Calle 25 #15-8', '3002223344', 'ana@optiplant.com', 'VENDEDOR', 2),
(5, 'Pedro Vendedor', 'Carrera 10 #5-20', '3006667788', 'pedro@optiplant.com', 'VENDEDOR', 3);

-- PRODUCTOS
INSERT IGNORE INTO productos (id_producto, nombre, descripcion, precio_venta, precio_costo) VALUES
(1, 'Fertilizante NPK 15-15-15', 'Fertilizante balanceado para cultivos generales', 45000.00, 30000.00),
(2, 'Herbicida Glifosato', 'Control de malezas de hoja ancha', 35000.00, 22000.00),
(3, 'Insecticida Cipermetrina', 'Control de plagas en cultivos', 28000.00, 18000.00),
(4, 'Fungicida Mancozeb', 'Prevención de hongos en plantas', 32000.00, 20000.00),
(5, 'Semillas de Café Variedad Castillo', 'Semillas certificadas resistentes a roya', 120000.00, 80000.00),
(6, 'Abono Orgánico Compost', 'Abono natural para mejorar suelos', 25000.00, 15000.00),
(7, 'Regadera Manual 10L', 'Regadera plástica capacidad 10 litros', 18000.00, 10000.00),
(8, 'Tijeras de Poda Profesional', 'Tijeras de acero inoxidable para poda', 55000.00, 35000.00),
(9, 'Manguera de Riego 50m', 'Manguera flexible para riego', 85000.00, 55000.00),
(10, 'Sustrato para Germinación', 'Mezcla especial para semilleros', 22000.00, 14000.00);

-- INVENTARIO POR SUCURSAL
INSERT IGNORE INTO inventario_sucursal (id_inventario, id_producto, id_sucursal, stock_actual, stock_minimo) VALUES
-- Sucursal Centro
(1, 1, 1, 50, 10),
(2, 2, 1, 30, 5),
(3, 3, 1, 25, 5),
(4, 4, 1, 20, 5),
(5, 5, 1, 15, 3),
(6, 6, 1, 40, 10),
(7, 7, 1, 10, 3),
(8, 8, 1, 8, 2),
(9, 9, 1, 5, 2),
(10, 10, 1, 35, 8),
-- Sucursal Norte
(11, 1, 2, 30, 10),
(12, 2, 2, 20, 5),
(13, 3, 2, 15, 5),
(14, 4, 2, 3, 5),
(15, 5, 2, 10, 3),
(16, 6, 2, 25, 10),
(17, 7, 2, 2, 3),
(18, 8, 2, 12, 2),
(19, 9, 2, 7, 2),
(20, 10, 2, 18, 8),
-- Sucursal Sur
(21, 1, 3, 20, 10),
(22, 2, 3, 4, 5),
(23, 3, 3, 10, 5),
(24, 4, 3, 18, 5),
(25, 5, 3, 5, 3),
(26, 6, 3, 15, 10),
(27, 7, 3, 6, 3),
(28, 8, 3, 3, 2),
(29, 9, 3, 1, 2),
(30, 10, 3, 12, 8);
