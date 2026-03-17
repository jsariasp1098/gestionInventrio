package co.edu.uniquindio.gestionInventario.service;

import co.edu.uniquindio.gestionInventario.dto.DashboardDTO;
import co.edu.uniquindio.gestionInventario.dto.InventarioDTO;
import co.edu.uniquindio.gestionInventario.model.enums.EstadoTraslado;
import co.edu.uniquindio.gestionInventario.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final VentaRepository ventaRepository;
    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;
    private final SucursalRepository sucursalRepository;
    private final SolicitudTrasladoRepository solicitudTrasladoRepository;
    private final InventarioSucursalRepository inventarioRepository;

    public DashboardService(VentaRepository ventaRepository,
                            CompraRepository compraRepository,
                            ProductoRepository productoRepository,
                            SucursalRepository sucursalRepository,
                            SolicitudTrasladoRepository solicitudTrasladoRepository,
                            InventarioSucursalRepository inventarioRepository) {
        this.ventaRepository = ventaRepository;
        this.compraRepository = compraRepository;
        this.productoRepository = productoRepository;
        this.sucursalRepository = sucursalRepository;
        this.solicitudTrasladoRepository = solicitudTrasladoRepository;
        this.inventarioRepository = inventarioRepository;
    }

    public DashboardDTO obtenerResumen() {
        LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);
        LocalDate finMes = LocalDate.now();

        DashboardDTO dto = new DashboardDTO();

        // Ventas del mes actual
        dto.setTotalVentasMes(ventaRepository.contarVentasPorFecha(inicioMes, finMes));
        dto.setIngresoVentasMes(ventaRepository.sumarTotalVentasPorFecha(inicioMes, finMes));

        // Compras del mes actual
        dto.setTotalComprasMes(compraRepository.contarComprasPorFecha(inicioMes, finMes));
        dto.setGastoComprasMes(compraRepository.sumarTotalComprasPorFecha(inicioMes, finMes));

        // Totales generales
        dto.setTotalProductos(productoRepository.count());
        dto.setTotalSucursales(sucursalRepository.count());

        // Traslados pendientes
        long pendientes = solicitudTrasladoRepository.findAll().stream()
                .filter(s -> s.getEstado() == EstadoTraslado.PENDIENTE
                          || s.getEstado() == EstadoTraslado.EN_TRANSITO)
                .count();
        dto.setTrasladosPendientes(pendientes);

        // Productos con stock bajo (stock <= 5 unidades)
        List<InventarioDTO> stockBajo = inventarioRepository.findByStockActualLessThanEqual(5)
                .stream()
                .map(inv -> {
                    InventarioDTO invDTO = new InventarioDTO();
                    invDTO.setIdInventario(inv.getIdInventario());
                    invDTO.setSucursal(inv.getSucursal().getNombreSucursal());
                    invDTO.setProducto(inv.getProducto().getNombre());
                    invDTO.setStockActual(inv.getStockActual());
                    invDTO.setStockMinimo(inv.getStockMinimo());
                    return invDTO;
                })
                .toList();
        dto.setProductosStockBajo(stockBajo);

        return dto;
    }
}
