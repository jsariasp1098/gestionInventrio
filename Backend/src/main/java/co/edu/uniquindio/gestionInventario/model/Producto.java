package co.edu.uniquindio.gestionInventario.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;
    @Column(nullable = false, length = 150)
    private String nombre;
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    @Column(name = "precio_costo", nullable = false)
    private Double precioCosto;
    @Column(name = "precio_venta", nullable = false)
    private Double precioVenta;
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<InventarioSucursal> inventarios;
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DetalleVenta> detallesVenta;
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DetalleCompra> detallesCompra;
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<SolicitudTraslado> solicitudesTraslado;
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<MovimientoInventario> movimientos;
}
