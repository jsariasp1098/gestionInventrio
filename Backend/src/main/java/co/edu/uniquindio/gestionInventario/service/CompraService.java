package co.edu.uniquindio.gestionInventario.service;

import co.edu.uniquindio.gestionInventario.dto.CompraRequestDTO;
import co.edu.uniquindio.gestionInventario.dto.CompraResponseDTO;
import co.edu.uniquindio.gestionInventario.dto.DetalleCompraDTO;
import co.edu.uniquindio.gestionInventario.model.*;
import co.edu.uniquindio.gestionInventario.model.enums.EstadoCompra;
import co.edu.uniquindio.gestionInventario.model.enums.TipoMovimiento;
import co.edu.uniquindio.gestionInventario.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final InventarioSucursalRepository inventarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SucursalRepository sucursalRepository;

    public CompraService(CompraRepository compraRepository,
                         InventarioSucursalRepository inventarioRepository,
                         MovimientoInventarioRepository movimientoRepository,
                         ProductoRepository productoRepository,
                         UsuarioRepository usuarioRepository,
                         SucursalRepository sucursalRepository) {
        this.compraRepository = compraRepository;
        this.inventarioRepository = inventarioRepository;
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.sucursalRepository = sucursalRepository;
    }

    public List<CompraResponseDTO> listarCompras() {
        return compraRepository.findAll()
                .stream()
                .map(this::convertirACompraDTO)
                .toList();
    }

    public CompraResponseDTO obtenerCompra(Long id) {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Compra no encontrada"));
        return convertirACompraDTO(compra);
    }

    @Transactional
    public CompraResponseDTO crearCompra(CompraRequestDTO request) {

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Sucursal sucursal = sucursalRepository.findById(request.getIdSucursal())
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada"));

        Compra compra = new Compra();
        compra.setFecha(LocalDate.now());
        compra.setEstado(EstadoCompra.PENDIENTE);
        compra.setUsuario(usuario);
        compra.setSucursal(sucursal);
        compra.setTotal(0.0);

        Compra compraGuardada = compraRepository.save(compra);

        List<DetalleCompra> detalles = new ArrayList<>();
        double total = 0;

        for (DetalleCompraDTO d : request.getDetalles()) {

            Producto producto = productoRepository.findById(d.getIdProducto())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));

            // Calcular subtotal
            double subtotal = d.getPrecioCosto() * d.getCantidad();

            // Crear detalle
            DetalleCompra detalle = new DetalleCompra();
            detalle.setProducto(producto);
            detalle.setCantidad(d.getCantidad());
            detalle.setPrecioCosto(d.getPrecioCosto());
            detalle.setSubtotal(subtotal);
            detalle.setCompra(compra);

            detalles.add(detalle);

            // Buscar inventario y aumentar stock
            InventarioSucursal inventario = inventarioRepository
                    .findByProductoIdProductoAndSucursalIdSucursal(
                            producto.getIdProducto(),
                            sucursal.getIdSucursal()
                    ).orElseThrow(() ->
                            new EntityNotFoundException("Producto no existe en inventario de esta sucursal"));

            int stockInicial = inventario.getStockActual();
            inventario.setStockActual(stockInicial + d.getCantidad());

            // Registrar movimiento de inventario
            MovimientoInventario movimiento = MovimientoInventario.builder()
                    .producto(producto)
                    .sucursal(sucursal)
                    .fecha(LocalDate.now())
                    .cantidad(d.getCantidad())
                    .stockInicial(stockInicial)
                    .stockFinal(inventario.getStockActual())
                    .descripcion("Ingreso por compra # " +compraGuardada.getIdCompra())
                    .tipo(TipoMovimiento.ENTRADA_COMPRA)
                    .build();

            movimientoRepository.save(movimiento);

            total += subtotal;
        }

        compraGuardada.setTotal(total);
        compraGuardada.setDetalles(detalles);
        compraGuardada.setEstado(EstadoCompra.RECIBIDA);

        compraRepository.save(compraGuardada);

        return convertirACompraDTO(compraGuardada);
    }

    public void eliminarCompra(Long id) {
        compraRepository.deleteById(id);
    }

    private CompraResponseDTO convertirACompraDTO(Compra compra) {
        CompraResponseDTO dto = new CompraResponseDTO();
        dto.setIdCompra(compra.getIdCompra());
        dto.setFechaCompra(compra.getFecha());
        dto.setTotal(compra.getTotal());
        dto.setEstado(compra.getEstado().name());
        dto.setUsuario(compra.getUsuario().getNombreUsuario());
        dto.setSucursal(compra.getSucursal().getNombreSucursal());
        return dto;
    }
}
