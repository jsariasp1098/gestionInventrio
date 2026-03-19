package co.edu.uniquindio.gestionInventario.controller;

import co.edu.uniquindio.gestionInventario.dto.LoginRequestDTO;
import co.edu.uniquindio.gestionInventario.dto.LoginResponseDTO;
import co.edu.uniquindio.gestionInventario.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
