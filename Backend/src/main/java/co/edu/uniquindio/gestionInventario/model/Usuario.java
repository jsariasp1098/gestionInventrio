package co.edu.uniquindio.gestionInventario.model;


import co.edu.uniquindio.gestionInventario.model.enums.TipoUsuario;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name="usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name= "id_usuario")
    private Long idUsuario;
    @Column(nullable = false, length = 100)
    private String nombreUsuario;
    @Column(length = 100)
    private String direccion;
    @Column(length = 100)
    private String telefono;
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoUsuario tipo;
    @Column(nullable = false)
    private String password;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sucursal", nullable = false)
    private Sucursal sucursal;
    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Venta> ventas;
    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Compra> compras;
    @OneToMany(mappedBy = "usuarioSolicita", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<SolicitudTraslado> solicitudes;
}
