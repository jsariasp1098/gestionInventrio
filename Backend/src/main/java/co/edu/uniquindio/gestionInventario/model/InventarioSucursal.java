package co.edu.uniquindio.gestionInventario.model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "inventario_sucursal",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_inventario_sucursal_producto",
                columnNames = {"id_sucursal", "id_producto"}
        )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventarioSucursal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inventario_sucursal")
    private Long idInventarioSucursal;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sucursal", nullable = false)
    private Sucursal sucursal;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;
    @Column(name = "stock_actual", nullable = false)
    private Integer stockActual;
    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo;
}
