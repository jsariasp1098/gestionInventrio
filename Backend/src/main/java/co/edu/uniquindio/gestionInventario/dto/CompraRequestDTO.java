package co.edu.uniquindio.gestionInventario.dto;

import lombok.Data;
import java.util.List;

@Data
public class CompraRequestDTO {
    private Long idUsuario;
    private Long idSucursal;
    private List<DetalleCompraDTO> detalles;
}
