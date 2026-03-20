package co.edu.uniquindio.gestionInventario.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private Long idUsuario;
    private String nombreUsuario;
    private String direccion;
    private String telefono;
    private String email;
    private String tipo;
    private String password;
    private Long idSucursal;
    private String nombreSucursal;
}
