package co.edu.uniquindio.gestionInventario.dto;

import java.util.List;

public class CompraRequestDTO {
    private Long idUsuario;
    private Long idSucursal;
    private List<DetalleCompraDTO> detalles;
}
