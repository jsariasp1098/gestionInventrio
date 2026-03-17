package co.edu.uniquindio.gestionInventario.controller;

import co.edu.uniquindio.gestionInventario.dto.SucursalDTO;
import co.edu.uniquindio.gestionInventario.service.SucursalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {

    private final SucursalService sucursalService;

    public SucursalController(SucursalService sucursalService) {
        this.sucursalService = sucursalService;
    }

    @GetMapping
    public List<SucursalDTO> listarSucursales() {
        return sucursalService.listarSucursales();
    }

    @GetMapping("/{id}")
    public SucursalDTO obtenerSucursal(@PathVariable Long id) {
        return sucursalService.obtenerSucursal(id);
    }

    @PostMapping
    public ResponseEntity<SucursalDTO> crearSucursal(@RequestBody SucursalDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sucursalService.crearSucursal(dto));
    }

    @PutMapping("/{id}")
    public SucursalDTO actualizarSucursal(@PathVariable Long id, @RequestBody SucursalDTO dto) {
        return sucursalService.actualizarSucursal(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSucursal(@PathVariable Long id) {
        sucursalService.eliminarSucursal(id);
        return ResponseEntity.noContent().build();
    }
}
