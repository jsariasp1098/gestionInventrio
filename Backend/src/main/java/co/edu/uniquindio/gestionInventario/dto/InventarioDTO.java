package co.edu.uniquindio.gestionInventario.dto;

import lombok.Data;

@Data
public class InventarioDTO {
    private Long idInventarioSucursal;
    private Long idSucursal;
    private String sucursal;
    private Long idProducto;
    private String producto;
    private Double precioCosto;
    private Double precioVenta;
    private Integer stockActual;
    private Integer stockMinimo;
}
