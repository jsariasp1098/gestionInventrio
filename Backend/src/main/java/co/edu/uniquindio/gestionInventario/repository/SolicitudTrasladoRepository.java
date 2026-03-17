package co.edu.uniquindio.gestionInventario.repository;

import co.edu.uniquindio.gestionInventario.model.SolicitudTraslado;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolicitudTrasladoRepository
                            extends JpaRepository<SolicitudTraslado, Long> {
}
