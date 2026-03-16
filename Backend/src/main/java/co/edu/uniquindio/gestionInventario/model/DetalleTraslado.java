package co.edu.uniquindio.gestionInventario.model;

import co.edu.uniquindio.gestionInventario.model.enums.EstadoTraslado;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "detalle_traslados")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleTraslado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_traslado")
    private Long idDetalleTraslado;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false, unique = true)
    private SolicitudTraslado solicitud;
    @Column(name = "cantidad_enviada", nullable = false)
    private Integer cantidadEnviada;
    @Column(name = "cantidad_recibida")
    private Integer cantidadRecibida;
    @Column(name = "fecha_envio", nullable = false)
    private LocalDate fechaEnvio;
    @Column(name = "fecha_recepcion")
    private LocalDate fechaRecepcion;
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_recepcion", length = 30)
    private EstadoTraslado estadoRecepcion;
    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
