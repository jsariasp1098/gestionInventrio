package co.edu.uniquindio.gestionInventario.dto;

import lombok.Data;

@Data
public class SucursalDTO {
    private Long idSucursal;
    private String nombreSucursal;
    private String direccion;
    private String telefono;
    private String email;
}
