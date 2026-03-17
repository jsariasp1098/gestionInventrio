package co.edu.uniquindio.gestionInventario.service;

import co.edu.uniquindio.gestionInventario.model.*;
import co.edu.uniquindio.gestionInventario.model.enums.TipoMovimiento;
import co.edu.uniquindio.gestionInventario.repository.CompraRepository;
import co.edu.uniquindio.gestionInventario.repository.InventarioSucursalRepository;
import co.edu.uniquindio.gestionInventario.repository.MovimientoInventarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final InventarioSucursalRepository inventarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public CompraService (CompraRepository compraRepository,
                          InventarioSucursalRepository inventarioRepository,
                          MovimientoInventarioRepository movimientoRepository){
        this.compraRepository = compraRepository;
        this.inventarioRepository = inventarioRepository;
        this.movimientoRepository = movimientoRepository;


    }
    public List<Compra> listarCompraa() {
        return compraRepository.findAll();
    }

    public Compra obtenerCompra (Long id){
        return compraRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Compra no encontrada"));
    }

    @Transactional
    public Compra guardarCompra (Compra compra){
        double total = 0;

        for (DetalleCompra detalle : compra.getDetalles()) {

            // asociar detalle con venta
            detalle.setCompra(compra);

            // buscar inventario
            InventarioSucursal inventario =
                    inventarioRepository.findByProductoIdProductoAndSucursalIdSucursal(
                            detalle.getProducto().getIdProducto(),
                            compra.getSucursal().getIdSucursal()
                    ).orElseThrow(() ->
                            new RuntimeException("Producto no existe en inventario"));

            int stockInicial = inventario.getStockActual();
            // aumentar inventario
            inventario.setStockActual(
                    inventario.getStockActual() + detalle.getCantidad()
            );
            int stockFinal = inventario.getStockActual();
            MovimientoInventario movimiento = MovimientoInventario.builder()
                    .producto(detalle.getProducto())
                    .sucursal(compra.getSucursal())
                    .fecha(LocalDate.now())
                    .cantidad(detalle.getCantidad())
                    .stockInicial(stockInicial)
                    .stockFinal(stockFinal)
                    .descripcion("Ingreso por compra #" + compra.getIdCompra())
                    .tipo(TipoMovimiento.ENTREDA_COMPRA)
                    .build();

            movimientoRepository.save(movimiento);
            // sumar total
            total += detalle.getSubtotal();
        }

        compra.setTotal(total);

        return compraRepository.save(compra);
    }

    public void eliminarCompra(Long id) {
        compraRepository.deleteById(id);
    }
}
