package co.edu.uniquindio.gestionInventario.service;

import co.edu.uniquindio.gestionInventario.model.DetalleVenta;
import co.edu.uniquindio.gestionInventario.model.InventarioSucursal;
import co.edu.uniquindio.gestionInventario.model.MovimientoInventario;
import co.edu.uniquindio.gestionInventario.model.Venta;
import co.edu.uniquindio.gestionInventario.model.enums.TipoMovimiento;
import co.edu.uniquindio.gestionInventario.repository.InventarioSucursalRepository;
import co.edu.uniquindio.gestionInventario.repository.MovimientoInventarioRepository;
import co.edu.uniquindio.gestionInventario.repository.VentaRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final InventarioSucursalRepository inventarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public VentaService(VentaRepository ventaRepository,
                        InventarioSucursalRepository inventarioRepository,
                        MovimientoInventarioRepository movimientoRepository) {
        this.ventaRepository = ventaRepository;
        this.inventarioRepository = inventarioRepository;
        this.movimientoRepository = movimientoRepository;
    }

    public List<Venta> listarVentas() {
        return ventaRepository.findAll();
    }

    public Venta obtenerVenta(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
    }

    @Transactional
    public Venta guardarVenta(Venta venta) {

        double total = 0;

        for (DetalleVenta detalle : venta.getDetalles()) {

            // asociar detalle con venta
            detalle.setVenta(venta);

            // buscar inventario
            InventarioSucursal inventario =
                    inventarioRepository.findByProductoIdProductoAndSucursalIdSucursal(
                            detalle.getProducto().getIdProducto(),
                            venta.getSucursal().getIdSucursal()
                    ).orElseThrow(() ->
                            new RuntimeException("Producto no existe en inventario"));

            // validar stock
            if (inventario.getStockActual() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente"
                        + detalle.getProducto().getNombre());
            }

            int stockInicial = inventario.getStockActual();
            // descontar inventario
            inventario.setStockActual(
                    inventario.getStockActual() - detalle.getCantidad()
            );
            int stockFinal = inventario.getStockActual();
            MovimientoInventario movimiento = MovimientoInventario.builder()
                    .producto(detalle.getProducto())
                    .sucursal(venta.getSucursal())
                    .fecha(LocalDate.now())
                    .cantidad(detalle.getCantidad())
                    .stockInicial(stockInicial)
                    .stockFinal(stockFinal)
                    .descripcion("Salida por venta #" + venta.getIdVenta())
                    .tipo(TipoMovimiento.SALIDA_VENTA)
                    .build();

            movimientoRepository.save(movimiento);
            // sumar total
            total += detalle.getSubtotal();
        }

        venta.setTotal(total);

        return ventaRepository.save(venta);
    }

    public void eliminarVenta(Long id) {
        ventaRepository.deleteById(id);
    }
}
