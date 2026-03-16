package co.edu.uniquindio.gestionInventario.model;


import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "sucursales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sucursal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sucursal")
    private Long idSucursal;
    @Column(name = "nombre_sucursal", nullable = false, length = 100)
    private String nombreSucursal;
    @Column(length = 200)
    private String direccion;
    @Column(length = 20)
    private String telefono;
    @Column(length = 100)
    private String email;
    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<Usuario> usuarios;
    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<InventarioSucursal> inventarios;
    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<Venta> ventas;
    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<Compra> compras;
    @OneToMany(mappedBy = "sucursalOrigen", fetch = FetchType.LAZY)
    private List<SolicitudTraslado> trasladosOrigen;
    @OneToMany(mappedBy = "sucursalDestino", fetch = FetchType.LAZY)
    private List<SolicitudTraslado> trasladosDestino;
    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<MovimientoInventario> movimientos;
}