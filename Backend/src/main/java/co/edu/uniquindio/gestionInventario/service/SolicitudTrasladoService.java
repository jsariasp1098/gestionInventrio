package co.edu.uniquindio.gestionInventario.service;

import co.edu.uniquindio.gestionInventario.dto.SolicitudTrasladoDTO;
import co.edu.uniquindio.gestionInventario.model.*;
import co.edu.uniquindio.gestionInventario.model.enums.EstadoTraslado;
import co.edu.uniquindio.gestionInventario.model.enums.TipoMovimiento;
import co.edu.uniquindio.gestionInventario.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SolicitudTrasladoService {

    private final SolicitudTrasladoRepository solicitudRepository;
    private final DetalleTrasladoRepository detalleTrasladoRepository;
    private final SucursalRepository sucursalRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioSucursalRepository inventarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public SolicitudTrasladoService(SolicitudTrasladoRepository solicitudRepository,
                                    DetalleTrasladoRepository detalleTrasladoRepository,
                                    SucursalRepository sucursalRepository,
                                    ProductoRepository productoRepository,
                                    UsuarioRepository usuarioRepository,
                                    InventarioSucursalRepository inventarioRepository,
                                    MovimientoInventarioRepository movimientoRepository) {
        this.solicitudRepository = solicitudRepository;
        this.detalleTrasladoRepository = detalleTrasladoRepository;
        this.sucursalRepository = sucursalRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.inventarioRepository = inventarioRepository;
        this.movimientoRepository = movimientoRepository;
    }

    // ── 1. LISTAR TODAS LAS SOLICITUDES ──
    public List<SolicitudTrasladoDTO> listarSolicitudes() {
        return solicitudRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    // ── 2. OBTENER SOLICITUD POR ID ──
    public SolicitudTrasladoDTO obtenerSolicitud(Long id) {
        SolicitudTraslado solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitud no encontrada"));
        return convertirADTO(solicitud);
    }

    // ── 3. CREAR SOLICITUD (estado = PENDIENTE) ──
    // La sucursal destino es quien NECESITA el producto y lo pide a la sucursal origen
    @Transactional
    public SolicitudTrasladoDTO crearSolicitud(SolicitudTrasladoDTO dto) {
        Sucursal origen = sucursalRepository.findById(dto.getSucursalOrigen())
                .orElseThrow(() -> new EntityNotFoundException("Sucursal origen no encontrada"));
        Sucursal destino = sucursalRepository.findById(dto.getSucursalDestino())
                .orElseThrow(() -> new EntityNotFoundException("Sucursal destino no encontrada"));
        Producto producto = productoRepository.findById(dto.getIdProducto())
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuarioSolicita())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        // Verificar que la sucursal origen tenga stock suficiente
        InventarioSucursal invOrigen = inventarioRepository
                .findByProductoIdProductoAndSucursalIdSucursal(producto.getIdProducto(), origen.getIdSucursal())
                .orElseThrow(() -> new EntityNotFoundException("Producto no existe en inventario de sucursal origen"));

        if (invOrigen.getStockActual() < dto.getCantidadSolicitada()) {
            throw new RuntimeException("Stock insuficiente en sucursal origen. Disponible: " + invOrigen.getStockActual());
        }

        SolicitudTraslado solicitud = SolicitudTraslado.builder()
                .sucursalOrigen(origen)
                .sucursalDestino(destino)
                .producto(producto)
                .usuarioSolicita(usuario)
                .cantidadSolicitada(dto.getCantidadSolicitada())
                .fechaSolicitud(LocalDate.now())
                .estado(EstadoTraslado.PENDIENTE)
                .observaciones(dto.getObservaciones())
                .build();

        return convertirADTO(solicitudRepository.save(solicitud));
    }

    // ── 4. ENVIAR TRASLADO (estado = EN_TRANSITO) ──
    // La sucursal origen aprueba y envía. Se descuenta stock de origen.
    @Transactional
    public SolicitudTrasladoDTO enviarTraslado(Long idSolicitud, Integer cantidadEnviada) {
        SolicitudTraslado solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new EntityNotFoundException("Solicitud no encontrada"));

        if (solicitud.getEstado() != EstadoTraslado.PENDIENTE) {
            throw new RuntimeException("Solo se pueden enviar solicitudes en estado PENDIENTE");
        }

        // Descontar stock de sucursal origen
        InventarioSucursal invOrigen = inventarioRepository
                .findByProductoIdProductoAndSucursalIdSucursal(
                        solicitud.getProducto().getIdProducto(),
                        solicitud.getSucursalOrigen().getIdSucursal())
                .orElseThrow(() -> new EntityNotFoundException("Inventario origen no encontrado"));

        if (invOrigen.getStockActual() < cantidadEnviada) {
            throw new RuntimeException("Stock insuficiente para enviar. Disponible: " + invOrigen.getStockActual());
        }

        int stockInicialOrigen = invOrigen.getStockActual();
        invOrigen.setStockActual(stockInicialOrigen - cantidadEnviada);
        inventarioRepository.save(invOrigen);

        // Registrar movimiento de salida en origen
        MovimientoInventario movSalida = MovimientoInventario.builder()
                .producto(solicitud.getProducto())
                .sucursal(solicitud.getSucursalOrigen())
                .fecha(LocalDate.now())
                .cantidad(cantidadEnviada)
                .stockInicial(stockInicialOrigen)
                .stockFinal(invOrigen.getStockActual())
                .descripcion("Salida por traslado #" + idSolicitud + " hacia " + solicitud.getSucursalDestino().getNombreSucursal())
                .tipo(TipoMovimiento.SALIDA_TRASLADO)
                .build();
        movimientoRepository.save(movSalida);

        // Crear detalle de traslado
        DetalleTraslado detalle = DetalleTraslado.builder()
                .solicitud(solicitud)
                .cantidadEnviada(cantidadEnviada)
                .fechaEnvio(LocalDate.now())
                .build();
        detalleTrasladoRepository.save(detalle);

        // Actualizar estado
        solicitud.setEstado(EstadoTraslado.EN_TRANSITO);
        solicitud.setDetalleTraslado(detalle);

        return convertirADTO(solicitudRepository.save(solicitud));
    }

    // ── 5. CONFIRMAR RECEPCIÓN ──
    // La sucursal destino confirma cuántas unidades recibió
    @Transactional
    public SolicitudTrasladoDTO confirmarRecepcion(Long idSolicitud, Integer cantidadRecibida, String observaciones) {
        SolicitudTraslado solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new EntityNotFoundException("Solicitud no encontrada"));

        if (solicitud.getEstado() != EstadoTraslado.EN_TRANSITO) {
            throw new RuntimeException("Solo se pueden confirmar solicitudes EN_TRANSITO");
        }

        DetalleTraslado detalle = solicitud.getDetalleTraslado();
        if (detalle == null) {
            throw new RuntimeException("No existe detalle de traslado para esta solicitud");
        }

        // Determinar estado según la cantidad recibida vs enviada
        EstadoTraslado estadoRecepcion;
        if (cantidadRecibida.equals(detalle.getCantidadEnviada())) {
            estadoRecepcion = EstadoTraslado.RECIBIDO_COMPLETO;
        } else {
            estadoRecepcion = EstadoTraslado.RECIBIDO_CON_FALTANTE;
        }

        // Agregar stock a sucursal destino
        InventarioSucursal invDestino = inventarioRepository
                .findByProductoIdProductoAndSucursalIdSucursal(
                        solicitud.getProducto().getIdProducto(),
                        solicitud.getSucursalDestino().getIdSucursal())
                .orElseGet(() -> {
                    // Si el producto no existía en inventario destino, crear registro
                    InventarioSucursal nuevo = InventarioSucursal.builder()
                            .sucursal(solicitud.getSucursalDestino())
                            .producto(solicitud.getProducto())
                            .stockActual(0)
                            .stockMinimo(5)
                            .build();
                    return inventarioRepository.save(nuevo);
                });

        int stockInicialDestino = invDestino.getStockActual();
        invDestino.setStockActual(stockInicialDestino + cantidadRecibida);
        inventarioRepository.save(invDestino);

        // Registrar movimiento de entrada en destino
        MovimientoInventario movEntrada = MovimientoInventario.builder()
                .producto(solicitud.getProducto())
                .sucursal(solicitud.getSucursalDestino())
                .fecha(LocalDate.now())
                .cantidad(cantidadRecibida)
                .stockInicial(stockInicialDestino)
                .stockFinal(invDestino.getStockActual())
                .descripcion("Entrada por traslado #" + idSolicitud + " desde " + solicitud.getSucursalOrigen().getNombreSucursal())
                .tipo(TipoMovimiento.ENTRADA_TRASLADO)
                .build();
        movimientoRepository.save(movEntrada);

        // Actualizar detalle
        detalle.setCantidadRecibida(cantidadRecibida);
        detalle.setFechaRecepcion(LocalDate.now());
        detalle.setEstadoRecepcion(estadoRecepcion);
        detalle.setObservaciones(observaciones);
        detalleTrasladoRepository.save(detalle);

        // Actualizar solicitud
        solicitud.setEstado(estadoRecepcion);

        return convertirADTO(solicitudRepository.save(solicitud));
    }

    // ── 6. CANCELAR SOLICITUD ──
    @Transactional
    public SolicitudTrasladoDTO cancelarSolicitud(Long idSolicitud) {
        SolicitudTraslado solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new EntityNotFoundException("Solicitud no encontrada"));

        if (solicitud.getEstado() != EstadoTraslado.PENDIENTE) {
            throw new RuntimeException("Solo se pueden cancelar solicitudes en estado PENDIENTE");
        }

        solicitud.setEstado(EstadoTraslado.CANCELADO);
        return convertirADTO(solicitudRepository.save(solicitud));
    }

    // ── CONVERSIÓN A DTO ──
    private SolicitudTrasladoDTO convertirADTO(SolicitudTraslado s) {
        SolicitudTrasladoDTO dto = new SolicitudTrasladoDTO();
        dto.setIdSolicitud(s.getIdSolicitud());
        dto.setSucursalOrigen(s.getSucursalOrigen().getIdSucursal());
        dto.setNombreSucursalOrigen(s.getSucursalOrigen().getNombreSucursal());
        dto.setSucursalDestino(s.getSucursalDestino().getIdSucursal());
        dto.setNombreSucursalDestino(s.getSucursalDestino().getNombreSucursal());
        dto.setIdProducto(s.getProducto().getIdProducto());
        dto.setNombreProducto(s.getProducto().getNombre());
        dto.setIdUsuarioSolicita(s.getUsuarioSolicita().getIdUsuario());
        dto.setNombreUsuarioSolicita(s.getUsuarioSolicita().getNombreUsuario());
        dto.setCantidadSolicitada(s.getCantidadSolicitada());
        dto.setFechaSolicitud(s.getFechaSolicitud().toString());
        dto.setEstado(s.getEstado().name());
        dto.setObservaciones(s.getObservaciones());

        if (s.getDetalleTraslado() != null) {
            DetalleTraslado det = s.getDetalleTraslado();
            dto.setCantidadEnviada(det.getCantidadEnviada());
            dto.setCantidadRecibida(det.getCantidadRecibida());
            dto.setFechaEnvio(det.getFechaEnvio() != null ? det.getFechaEnvio().toString() : null);
            dto.setFechaRecepcion(det.getFechaRecepcion() != null ? det.getFechaRecepcion().toString() : null);
            dto.setEstadoRecepcion(det.getEstadoRecepcion() != null ? det.getEstadoRecepcion().name() : null);
            dto.setObservacionesRecepcion(det.getObservaciones());
        }

        return dto;
    }
}
