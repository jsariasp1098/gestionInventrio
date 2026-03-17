package co.edu.uniquindio.gestionInventario.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CompraResponseDTO {
    private Long idCompra;
    private LocalDate fechaCompra;
    private Double total;
    private String estado;
    private String usuario;
    private String sucursal;
}
