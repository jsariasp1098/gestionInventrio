package co.edu.uniquindio.gestionInventario.service;

import co.edu.uniquindio.gestionInventario.dto.DetalleVentaDTO;
import co.edu.uniquindio.gestionInventario.dto.VentaRequestDTO;
import co.edu.uniquindio.gestionInventario.dto.VentaResponseDTO;
import co.edu.uniquindio.gestionInventario.model.*;
import co.edu.uniquindio.gestionInventario.model.enums.EstadoVenta;
import co.edu.uniquindio.gestionInventario.model.enums.TipoMovimiento;
import co.edu.uniquindio.gestionInventario.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final InventarioSucursalRepository inventarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SucursalRepository sucursalRepository;

    public VentaService(VentaRepository ventaRepository,
                        InventarioSucursalRepository inventarioRepository,
                        MovimientoInventarioRepository movimientoRepository,
                        ProductoRepository productoRepository,
                        UsuarioRepository usuarioRepository,
                        SucursalRepository sucursalRepository) {
        this.ventaRepository = ventaRepository;
        this.inventarioRepository = inventarioRepository;
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.sucursalRepository = sucursalRepository;
    }

    public List<VentaResponseDTO> listarVentas() {
        return ventaRepository.findAll()
                .stream()
                .map(this::convertirAVentaDTO)
                .toList();
    }

    public Venta obtenerVenta(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venta no encontrada"));
    }

    @Transactional
    public VentaResponseDTO crearVenta(VentaRequestDTO request) {

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Sucursal sucursal = sucursalRepository.findById(request.getIdSucursal())
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada"));

        Venta venta = new Venta();
        venta.setFechaVenta(LocalDate.now());
        venta.setEstado(EstadoVenta.PENDIENTE);
        venta.setUsuario(usuario);
        venta.setSucursal(sucursal);
        venta.setTotal(0.0);

        Venta ventaGuardada = ventaRepository.save(venta);

        List<DetalleVenta> detalles = new ArrayList<>();
        double total = 0;

        for (DetalleVentaDTO d : request.getDetalles()) {

            Producto producto = productoRepository.findById(d.getIdProducto())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));

            InventarioSucursal inventario = inventarioRepository
                    .findByProductoIdProductoAndSucursalIdSucursal(
                            producto.getIdProducto(),
                            sucursal.getIdSucursal()
                    )
                    .orElseThrow(() -> new EntityNotFoundException("Inventario no encontrado"));

            // ✅ Validar stock
            if (inventario.getStockActual() < d.getCantidad()) {
                throw new EntityNotFoundException("Stock insuficiente para " + producto.getNombre());
            }

            // ✅ Calcular subtotal
            double subtotal = producto.getPrecioVenta() * d.getCantidad();

            // ✅ Crear detalle
            DetalleVenta detalle = new DetalleVenta();
            detalle.setProducto(producto);
            detalle.setCantidad(d.getCantidad());
            detalle.setPrecioVenta(producto.getPrecioVenta());
            detalle.setPrecioCosto(producto.getPrecioCosto());
            detalle.setSubtotal(subtotal);
            detalle.setVenta(venta);

            detalles.add(detalle);

            // ✅ Actualizar inventario
            int stockInicial = inventario.getStockActual();
            inventario.setStockActual(stockInicial - d.getCantidad());

            // ✅ Movimiento de inventario
            MovimientoInventario mov = MovimientoInventario.builder().
                    sucursal(sucursal).
                    producto(producto).
                    fecha(LocalDate.now()).
                    cantidad(d.getCantidad()).
                    stockInicial(stockInicial).
                    stockFinal(inventario.getStockActual()).
                    descripcion("Salida por venta # " + ventaGuardada.getIdVenta()).
                    tipo(TipoMovimiento.SALIDA_VENTA).
                    build();

            movimientoRepository.save(mov);

            total += subtotal;
        }
        ventaGuardada.setTotal(total);
        ventaGuardada.setDetalles(detalles);
        ventaGuardada.setEstado(EstadoVenta.COMPLETADA);
        ventaRepository.save(ventaGuardada);

        return convertirAVentaDTO(ventaGuardada);
    }

    public void eliminarVenta(Long id) {
        ventaRepository.deleteById(id);
    }

    // ✅ Mejor como private
    public VentaResponseDTO convertirAVentaDTO(Venta venta) {

        VentaResponseDTO dto = new VentaResponseDTO();

        dto.setIdVenta(venta.getIdVenta());
        dto.setFechaVenta(venta.getFechaVenta());
        dto.setTotal(venta.getTotal());
        dto.setEstado(venta.getEstado().name());
        dto.setUsuario(venta.getUsuario().getNombreUsuario());
        dto.setSucursal(venta.getSucursal().getNombreSucursal());

        return dto;
    }
}
