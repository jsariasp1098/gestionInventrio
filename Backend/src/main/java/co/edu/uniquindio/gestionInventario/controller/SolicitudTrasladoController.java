package co.edu.uniquindio.gestionInventario.controller;

import co.edu.uniquindio.gestionInventario.dto.SolicitudTrasladoDTO;
import co.edu.uniquindio.gestionInventario.service.SolicitudTrasladoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/traslados")
public class SolicitudTrasladoController {

    private final SolicitudTrasladoService trasladoService;

    public SolicitudTrasladoController(SolicitudTrasladoService trasladoService) {
        this.trasladoService = trasladoService;
    }

    @GetMapping
    public List<SolicitudTrasladoDTO> listarSolicitudes() {
        return trasladoService.listarSolicitudes();
    }

    @GetMapping("/{id}")
    public SolicitudTrasladoDTO obtenerSolicitud(@PathVariable Long id) {
        return trasladoService.obtenerSolicitud(id);
    }

    @PostMapping
    public ResponseEntity<SolicitudTrasladoDTO> crearSolicitud(@RequestBody SolicitudTrasladoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trasladoService.crearSolicitud(dto));
    }

    @PutMapping("/{id}/enviar")
    public SolicitudTrasladoDTO enviarTraslado(@PathVariable Long id,
                                               @RequestParam Integer cantidadEnviada) {
        return trasladoService.enviarTraslado(id, cantidadEnviada);
    }

    @PutMapping("/{id}/confirmar")
    public SolicitudTrasladoDTO confirmarRecepcion(@PathVariable Long id,
                                                    @RequestParam Integer cantidadRecibida,
                                                    @RequestParam(required = false) String observaciones) {
        return trasladoService.confirmarRecepcion(id, cantidadRecibida, observaciones);
    }

    @PutMapping("/{id}/cancelar")
    public SolicitudTrasladoDTO cancelarSolicitud(@PathVariable Long id) {
        return trasladoService.cancelarSolicitud(id);
    }
}
