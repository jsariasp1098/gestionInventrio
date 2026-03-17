package co.edu.uniquindio.gestionInventario.controller;

import co.edu.uniquindio.gestionInventario.dto.VentaRequestDTO;
import co.edu.uniquindio.gestionInventario.dto.VentaResponseDTO;
import co.edu.uniquindio.gestionInventario.model.Venta;
import co.edu.uniquindio.gestionInventario.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {
    private final VentaService ventaService;

    // listar todas las ventas
    @GetMapping
    public List<VentaResponseDTO> listarrVentas() {
        return ventaService.listarVentas();
    }

    // obtener venta por id
    @GetMapping("/{id}")
    public VentaResponseDTO obtenerVenta(@PathVariable Long id) {
        Venta venta = ventaService.obtenerVenta(id);
        return ventaService.convertirAVentaDTO(venta);
    }

    // crear venta
    @PostMapping
    public VentaResponseDTO crearVenta(@RequestBody VentaRequestDTO request) {
        return ventaService.crearVenta(request);
    }

    // eliminar venta
    @DeleteMapping("/{id}")
    public void eliminarVenta(@PathVariable Long id) {
        ventaService.eliminarVenta(id);
    }

}
