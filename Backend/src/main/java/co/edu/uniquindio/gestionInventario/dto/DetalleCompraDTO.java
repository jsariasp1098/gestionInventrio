package co.edu.uniquindio.gestionInventario.dto;

import lombok.Data;

@Data
public class DetalleCompraDTO {
    private Long idProducto;
    private Integer cantidad;
    private Double precioCosto;
}
