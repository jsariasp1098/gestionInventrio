package co.edu.uniquindio.gestionInventario.repository;

import co.edu.uniquindio.gestionInventario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
