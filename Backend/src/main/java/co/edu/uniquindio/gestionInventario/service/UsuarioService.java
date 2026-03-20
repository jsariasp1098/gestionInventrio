package co.edu.uniquindio.gestionInventario.service;

import co.edu.uniquindio.gestionInventario.dto.UsuarioDTO;
import co.edu.uniquindio.gestionInventario.model.Sucursal;
import co.edu.uniquindio.gestionInventario.model.Usuario;
import co.edu.uniquindio.gestionInventario.model.enums.TipoUsuario;
import co.edu.uniquindio.gestionInventario.repository.SucursalRepository;
import co.edu.uniquindio.gestionInventario.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final SucursalRepository sucursalRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          SucursalRepository sucursalRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.sucursalRepository = sucursalRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioDTO> listarUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    public UsuarioDTO obtenerUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
        return convertirADTO(usuario);
    }

    public UsuarioDTO crearUsuario(UsuarioDTO dto) {
        Sucursal sucursal = sucursalRepository.findById(dto.getIdSucursal())
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada"));

        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(dto.getNombreUsuario());
        usuario.setDireccion(dto.getDireccion());
        usuario.setTelefono(dto.getTelefono());
        usuario.setEmail(dto.getEmail());
        usuario.setTipo(TipoUsuario.valueOf(dto.getTipo()));
        usuario.setSucursal(sucursal);
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        Usuario guardado = usuarioRepository.save(usuario);
        return convertirADTO(guardado);
    }

    public UsuarioDTO actualizarUsuario(Long id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));

        Sucursal sucursal = sucursalRepository.findById(dto.getIdSucursal())
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada"));

        usuario.setNombreUsuario(dto.getNombreUsuario());
        usuario.setDireccion(dto.getDireccion());
        usuario.setTelefono(dto.getTelefono());
        usuario.setEmail(dto.getEmail());
        usuario.setTipo(TipoUsuario.valueOf(dto.getTipo()));
        usuario.setSucursal(sucursal);
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        Usuario actualizado = usuarioRepository.save(usuario);
        return convertirADTO(actualizado);
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    private UsuarioDTO convertirADTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setIdUsuario(usuario.getIdUsuario());
        dto.setNombreUsuario(usuario.getNombreUsuario());
        dto.setDireccion(usuario.getDireccion());
        dto.setTelefono(usuario.getTelefono());
        dto.setEmail(usuario.getEmail());
        dto.setTipo(usuario.getTipo().name());
        dto.setIdSucursal(usuario.getSucursal().getIdSucursal());
        dto.setNombreSucursal(usuario.getSucursal().getNombreSucursal());
        return dto;
    }
}
