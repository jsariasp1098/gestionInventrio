package co.edu.uniquindio.gestionInventario.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardDTO {
    private Long totalVentasMes;
    private Double ingresoVentasMes;
    private Long totalComprasMes;
    private Double gastoComprasMes;
    private Long totalProductos;
    private Long totalSucursales;
    private Long trasladosPendientes;
    private List<InventarioDTO> productosStockBajo;
}
