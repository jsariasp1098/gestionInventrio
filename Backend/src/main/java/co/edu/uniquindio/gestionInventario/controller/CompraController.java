package co.edu.uniquindio.gestionInventario.controller;

import co.edu.uniquindio.gestionInventario.dto.CompraRequestDTO;
import co.edu.uniquindio.gestionInventario.dto.CompraResponseDTO;
import co.edu.uniquindio.gestionInventario.service.CompraService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    //Listar todas las compras
    @GetMapping
    public List<CompraResponseDTO> listarCompras() {
        return compraService.listarCompras();
    }

    // obtener compras por id
    @GetMapping("/{id}")
    public CompraResponseDTO obtenerCompra(@PathVariable Long id) {
        return compraService.obtenerCompra(id);
    }

    // crear compra
    @PostMapping
    public ResponseEntity<CompraResponseDTO> crearCompra(@RequestBody CompraRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(compraService.crearCompra(request));
    }

    // eliminar compra
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCompra(@PathVariable Long id) {
        compraService.eliminarCompra(id);
        return ResponseEntity.noContent().build();
    }
}
