package co.edu.uniquindio.gestionInventario.model;

import co.edu.uniquindio.gestionInventario.model.enums.TipoMovimiento;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "movimientos_inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoInventario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long idMovimiento;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sucursal", nullable = false)
    private Sucursal sucursal;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;
    @Column(nullable = false)
    private LocalDate fecha;
    @Column(nullable = false)
    private Integer cantidad;
    @Column(name = "stock_inicial", nullable = false)
    private Integer stockInicial;
    @Column(name = "stock_final", nullable = false)
    private Integer stockFinal;
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoMovimiento tipo;
}
