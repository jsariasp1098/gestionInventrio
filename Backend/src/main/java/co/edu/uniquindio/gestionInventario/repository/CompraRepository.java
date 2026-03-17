package co.edu.uniquindio.gestionInventario.repository;

import co.edu.uniquindio.gestionInventario.model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface CompraRepository extends JpaRepository<Compra, Long> {

    @Query("SELECT COUNT(c) FROM Compra c WHERE c.fechaCompra BETWEEN :inicio AND :fin")
    Long contarComprasPorFecha(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);

    @Query("SELECT COALESCE(SUM(c.total), 0) FROM Compra c WHERE c.fechaCompra BETWEEN :inicio AND :fin")
    Double sumarTotalComprasPorFecha(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);
}
