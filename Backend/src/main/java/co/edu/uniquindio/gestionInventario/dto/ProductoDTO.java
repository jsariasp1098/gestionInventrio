package co.edu.uniquindio.gestionInventario.dto;

import lombok.Data;

@Data
public class ProductoDTO {
    private Long idProducto;
    private String nombre;
    private String descripcion;
    private Double precioCosto;
    private Double precioVenta;
}
