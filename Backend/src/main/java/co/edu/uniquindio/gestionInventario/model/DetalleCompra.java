package co.edu.uniquindio.gestionInventario.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "detalle_compras")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_compra")
    private Long idDetalleCompra;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_compra", nullable = false)
    @JsonIgnore
    private Compra compra;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;
    @Column(nullable = false)
    private Integer cantidad;
    @Column(name = "precio_costo", nullable = false)
    private Double precioCosto;
    @Column(nullable = false)
    private Double subtotal;
}
