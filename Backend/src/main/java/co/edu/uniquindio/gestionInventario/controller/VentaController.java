package co.edu.uniquindio.gestionInventario.controller;

import co.edu.uniquindio.gestionInventario.model.Venta;
import co.edu.uniquindio.gestionInventario.service.VentaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {
    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    // listar todas las ventas
    @GetMapping
    public List<Venta> listarVentas() {
        return ventaService.listarVentas();
    }

    // obtener venta por id
    @GetMapping("/{id}")
    public Venta obtenerVenta(@PathVariable Long id) {
        return ventaService.obtenerVenta(id);
    }

    // crear venta
    @PostMapping
    public Venta crearVenta(@RequestBody Venta venta) {
        return ventaService.guardarVenta(venta);
    }

    // eliminar venta
    @DeleteMapping("/{id}")
    public void eliminarVenta(@PathVariable Long id) {
        ventaService.eliminarVenta(id);
    }

}
