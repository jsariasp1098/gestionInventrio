package co.edu.uniquindio.gestionInventario.model;

import co.edu.uniquindio.gestionInventario.model.enums.EstadoTraslado;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "solicitudes_traslado")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudTraslado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sucursal_origen", nullable = false)
    private Sucursal sucursalOrigen;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sucursal_destino", nullable = false)
    private Sucursal sucursalDestino;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_solicita", nullable = false)
    private Usuario usuarioSolicita;
    @Column(name = "cantidad_solicitada", nullable = false)
    private Integer cantidadSolicitada;
    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDate fechaSolicitud;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoTraslado estado;
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    @OneToOne(mappedBy = "solicitud", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private DetalleTraslado detalleTraslado;
}
