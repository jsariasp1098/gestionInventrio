package co.edu.uniquindio.gestionInventario.service;

import co.edu.uniquindio.gestionInventario.config.JwtUtil;
import co.edu.uniquindio.gestionInventario.dto.LoginRequestDTO;
import co.edu.uniquindio.gestionInventario.dto.LoginResponseDTO;
import co.edu.uniquindio.gestionInventario.model.Usuario;
import co.edu.uniquindio.gestionInventario.repository.UsuarioRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostConstruct
    public void generarHash() {
        System.out.println("Hash de 1234: " + passwordEncoder.encode("1234"));
    }
    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder   = passwordEncoder;
        this.jwtUtil           = jwtUtil;
    }

    public LoginResponseDTO login(LoginRequestDTO request) {

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            System.out.println("Password recibido: " + request.getPassword());
            System.out.println("Hash en BD: " + usuario.getPassword());
            System.out.println("Coincide: " + passwordEncoder.matches(request.getPassword(), usuario.getPassword()));
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtUtil.generarToken(usuario.getEmail(), usuario.getTipo().name());

        return new LoginResponseDTO(
                token,
                usuario.getNombreUsuario(),
                usuario.getEmail(),
                usuario.getTipo().name(),
                usuario.getSucursal().getIdSucursal()
        );
    }
}
