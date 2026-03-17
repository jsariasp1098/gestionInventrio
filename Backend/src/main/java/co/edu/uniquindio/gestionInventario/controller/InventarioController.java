package co.edu.uniquindio.gestionInventario.controller;

import co.edu.uniquindio.gestionInventario.dto.InventarioDTO;
import co.edu.uniquindio.gestionInventario.service.InventarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @GetMapping
    public List<InventarioDTO> listarTodoInventario() {
        return inventarioService.listarTodoInventario();
    }

    @GetMapping("/sucursal/{idSucursal}")
    public List<InventarioDTO> listarPorSucursal(@PathVariable Long idSucursal) {
        return inventarioService.listarInventarioPorSucursal(idSucursal);
    }

    @PostMapping
    public ResponseEntity<InventarioDTO> agregarProducto(@RequestBody InventarioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventarioService.agregarProductoAInventario(dto));
    }

    @PatchMapping("/{id}/stock")
    public InventarioDTO actualizarStock(@PathVariable Long id, @RequestParam Integer nuevoStock) {
        return inventarioService.actualizarStock(id, nuevoStock);
    }
}
