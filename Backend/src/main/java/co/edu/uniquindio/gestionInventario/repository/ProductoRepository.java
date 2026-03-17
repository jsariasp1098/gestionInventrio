package co.edu.uniquindio.gestionInventario.repository;

import co.edu.uniquindio.gestionInventario.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
