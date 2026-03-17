package co.edu.uniquindio.gestionInventario.dto;

import co.edu.uniquindio.gestionInventario.model.Venta;
import lombok.*;

import java.time.LocalDate;

@Data
public class VentaResponseDTO {
    private Long idVenta;
    private LocalDate fechaVenta;
    private Double total;
    private String estado;
    private String usuario;
    private String sucursal;


}
