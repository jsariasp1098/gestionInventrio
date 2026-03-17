package co.edu.uniquindio.gestionInventario.controller;

import co.edu.uniquindio.gestionInventario.model.Compra;
import co.edu.uniquindio.gestionInventario.service.CompraService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compra")
public class CompraController {
    private final CompraService compraService;

    public CompraController (CompraService compraService){
        this.compraService = compraService;
    }

    //Listar todas las compras
    @GetMapping
    public List<Compra> listaCompras(){
        return compraService.listarCompraa();
    }

    // obtener compras por id
    @GetMapping("/{id}")
    public Compra obtenerCompra(@PathVariable Long id) {
        return compraService.obtenerCompra(id);
    }

    // crear compra
    @PostMapping
    public Compra crearCompra(@RequestBody Compra compra) {
        return compraService.guardarCompra(compra);
    }

    // eliminar compra
    @DeleteMapping("/{id}")
    public void eliminarCompra(@PathVariable Long id) {
        compraService.eliminarCompra(id);
    }
}
