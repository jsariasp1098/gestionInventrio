package co.edu.uniquindio.gestionInventario.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "detalle_ventas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleVenta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_venta")
    private Long idDetalleVenta;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta", nullable = false)
    @JsonIgnore
    private Venta venta;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;
    @Column(nullable = false)
    private Integer cantidad;
    @Column(name = "precio_costo", nullable = false)
    private Double precioCosto;
    @Column(name = "precio_venta", nullable = false)
    private Double precioVenta;
    @Column(nullable = false)
    private Double subtotal;
}
