package co.edu.uniquindio.gestionInventario.controller;

import co.edu.uniquindio.gestionInventario.dto.DashboardDTO;
import co.edu.uniquindio.gestionInventario.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardDTO obtenerResumen() {
        return dashboardService.obtenerResumen();
    }
}
