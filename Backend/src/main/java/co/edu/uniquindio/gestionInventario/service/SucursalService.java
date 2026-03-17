package co.edu.uniquindio.gestionInventario.service;

import co.edu.uniquindio.gestionInventario.dto.SucursalDTO;
import co.edu.uniquindio.gestionInventario.model.Sucursal;
import co.edu.uniquindio.gestionInventario.repository.SucursalRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SucursalService {

    private final SucursalRepository sucursalRepository;

    public SucursalService(SucursalRepository sucursalRepository) {
        this.sucursalRepository = sucursalRepository;
    }

    public List<SucursalDTO> listarSucursales() {
        return sucursalRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    public SucursalDTO obtenerSucursal(Long id) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con id: " + id));
        return convertirADTO(sucursal);
    }

    public SucursalDTO crearSucursal(SucursalDTO dto) {
        Sucursal sucursal = new Sucursal();
        sucursal.setNombreSucursal(dto.getNombreSucursal());
        sucursal.setDireccion(dto.getDireccion());
        sucursal.setTelefono(dto.getTelefono());
        sucursal.setEmail(dto.getEmail());

        Sucursal guardada = sucursalRepository.save(sucursal);
        return convertirADTO(guardada);
    }

    public SucursalDTO actualizarSucursal(Long id, SucursalDTO dto) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con id: " + id));

        sucursal.setNombreSucursal(dto.getNombreSucursal());
        sucursal.setDireccion(dto.getDireccion());
        sucursal.setTelefono(dto.getTelefono());
        sucursal.setEmail(dto.getEmail());

        Sucursal actualizada = sucursalRepository.save(sucursal);
        return convertirADTO(actualizada);
    }

    public void eliminarSucursal(Long id) {
        sucursalRepository.deleteById(id);
    }

    private SucursalDTO convertirADTO(Sucursal sucursal) {
        SucursalDTO dto = new SucursalDTO();
        dto.setIdSucursal(sucursal.getIdSucursal());
        dto.setNombreSucursal(sucursal.getNombreSucursal());
        dto.setDireccion(sucursal.getDireccion());
        dto.setTelefono(sucursal.getTelefono());
        dto.setEmail(sucursal.getEmail());
        return dto;
    }
}
