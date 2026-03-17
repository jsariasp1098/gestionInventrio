package co.edu.uniquindio.gestionInventario.service;

import co.edu.uniquindio.gestionInventario.dto.InventarioDTO;
import co.edu.uniquindio.gestionInventario.model.InventarioSucursal;
import co.edu.uniquindio.gestionInventario.model.Producto;
import co.edu.uniquindio.gestionInventario.model.Sucursal;
import co.edu.uniquindio.gestionInventario.repository.InventarioSucursalRepository;
import co.edu.uniquindio.gestionInventario.repository.ProductoRepository;
import co.edu.uniquindio.gestionInventario.repository.SucursalRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventarioService {

    private final InventarioSucursalRepository inventarioRepository;
    private final SucursalRepository sucursalRepository;
    private final ProductoRepository productoRepository;

    public InventarioService(InventarioSucursalRepository inventarioRepository,
                             SucursalRepository sucursalRepository,
                             ProductoRepository productoRepository) {
        this.inventarioRepository = inventarioRepository;
        this.sucursalRepository = sucursalRepository;
        this.productoRepository = productoRepository;
    }

    public List<InventarioDTO> listarTodoInventario() {
        return inventarioRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    public List<InventarioDTO> listarInventarioPorSucursal(Long idSucursal) {
        return inventarioRepository.findBySucursalIdSucursal(idSucursal)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    public InventarioDTO agregarProductoAInventario(InventarioDTO dto) {
        Sucursal sucursal = sucursalRepository.findById(dto.getIdSucursal())
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada"));
        Producto producto = productoRepository.findById(dto.getIdProducto())
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));

        // Verificar si ya existe el registro de inventario para ese producto en esa sucursal
        inventarioRepository.findByProductoIdProductoAndSucursalIdSucursal(
                producto.getIdProducto(), sucursal.getIdSucursal()
        ).ifPresent(inv -> {
            throw new RuntimeException("El producto ya existe en el inventario de esta sucursal");
        });

        InventarioSucursal inventario = InventarioSucursal.builder()
                .sucursal(sucursal)
                .producto(producto)
                .stockActual(dto.getStockActual() != null ? dto.getStockActual() : 0)
                .stockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : 5)
                .build();

        InventarioSucursal guardado = inventarioRepository.save(inventario);
        return convertirADTO(guardado);
    }

    public InventarioDTO actualizarStock(Long id, Integer nuevoStock) {
        InventarioSucursal inventario = inventarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Registro de inventario no encontrado"));
        inventario.setStockActual(nuevoStock);
        return convertirADTO(inventarioRepository.save(inventario));
    }

    private InventarioDTO convertirADTO(InventarioSucursal inv) {
        InventarioDTO dto = new InventarioDTO();
        dto.setIdInventarioSucursal(inv.getIdInventarioSucursal());
        dto.setIdSucursal(inv.getSucursal().getIdSucursal());
        dto.setSucursal(inv.getSucursal().getNombreSucursal());
        dto.setIdProducto(inv.getProducto().getIdProducto());
        dto.setProducto(inv.getProducto().getNombre());
        dto.setPrecioCosto(inv.getProducto().getPrecioCosto());
        dto.setPrecioVenta(inv.getProducto().getPrecioVenta());
        dto.setStockActual(inv.getStockActual());
        dto.setStockMinimo(inv.getStockMinimo());
        return dto;
    }
}
