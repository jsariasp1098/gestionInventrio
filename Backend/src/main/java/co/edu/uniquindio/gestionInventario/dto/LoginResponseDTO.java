package co.edu.uniquindio.gestionInventario.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private Long idUsuario;
    private String nombre;
    private String email;
    private String rol;
    private Long idSucursal;
    private String nombreSucursal;
}
