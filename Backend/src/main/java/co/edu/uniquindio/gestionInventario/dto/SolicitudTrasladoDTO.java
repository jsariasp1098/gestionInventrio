package co.edu.uniquindio.gestionInventario.dto;

import lombok.Data;

@Data
public class SolicitudTrasladoDTO {
    private Long idSolicitud;
    private Long sucursalOrigen;
    private String nombreSucursalOrigen;
    private Long sucursalDestino;
    private String nombreSucursalDestino;
    private Long idProducto;
    private String nombreProducto;
    private Long idUsuarioSolicita;
    private String nombreUsuarioSolicita;
    private Integer cantidadSolicitada;
    private String fechaSolicitud;
    private String estado;
    private String observaciones;
    private Integer cantidadEnviada;
    private Integer cantidadRecibida;
    private String fechaEnvio;
    private String fechaRecepcion;
    private String estadoRecepcion;
    private String observacionesRecepcion;
}
