package co.edu.uniquindio.gestionInventario.repository;

import co.edu.uniquindio.gestionInventario.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimientoInventarioRepository
        extends JpaRepository<MovimientoInventario, Long> {
}
