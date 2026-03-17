package co.edu.uniquindio.gestionInventario.controller;

import co.edu.uniquindio.gestionInventario.dto.VentaRequestDTO;
import co.edu.uniquindio.gestionInventario.dto.VentaResponseDTO;
import co.edu.uniquindio.gestionInventario.service.VentaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public List<VentaResponseDTO> listarVentas() {
        return ventaService.listarVentas();
    }

    // obtener venta por id
    @GetMapping("/{id}")
    public VentaResponseDTO obtenerVenta(@PathVariable Long id) {
        return ventaService.convertirAVentaDTO(ventaService.obtenerVenta(id));
    }

    // crear venta
    @PostMapping
    public ResponseEntity<VentaResponseDTO> crearVenta(@RequestBody VentaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaService.crearVenta(request));
    }

    // eliminar venta
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVenta(@PathVariable Long id) {
        ventaService.eliminarVenta(id);
        return ResponseEntity.noContent().build();
    }
}
