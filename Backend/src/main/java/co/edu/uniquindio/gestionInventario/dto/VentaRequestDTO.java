package co.edu.uniquindio.gestionInventario.dto;

import lombok.Data;

import java.util.List;

@Data

public class VentaRequestDTO {
    private Long idUsuario;
    private Long idSucursal;
    private List<DetalleVentaDTO> detalles;
}
