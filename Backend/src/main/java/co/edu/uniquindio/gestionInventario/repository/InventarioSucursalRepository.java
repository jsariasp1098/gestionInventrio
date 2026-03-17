package co.edu.uniquindio.gestionInventario.repository;

import co.edu.uniquindio.gestionInventario.model.InventarioSucursal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventarioSucursalRepository extends JpaRepository<InventarioSucursal, Long> {

    Optional<InventarioSucursal> findByProductoIdProductoAndSucursalIdSucursal(
            Long productoId, Long sucursalId
    );

    List<InventarioSucursal> findBySucursalIdSucursal(Long sucursalId);
}
