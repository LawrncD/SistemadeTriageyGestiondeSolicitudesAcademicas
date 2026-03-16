package co.edu.uniquindio.poo.controller;

import co.edu.uniquindio.poo.dto.request.*;
import co.edu.uniquindio.poo.dto.response.ApiResponseDTO;
import co.edu.uniquindio.poo.dto.response.PageResponseDTO;
import co.edu.uniquindio.poo.dto.response.SolicitudResponseDTO;
import co.edu.uniquindio.poo.model.enums.EstadoSolicitud;
import co.edu.uniquindio.poo.model.enums.Prioridad;
import co.edu.uniquindio.poo.model.enums.TipoSolicitud;
import co.edu.uniquindio.poo.service.SolicitudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de solicitudes académicas.
 * RF-12: Exposición de funcionalidades principales como API REST.
 * 
 * Endpoints:
 * POST   /api/solicitudes              → RF-01: Registrar solicitud
 * PUT    /api/solicitudes/{id}/clasificar → RF-02: Clasificar solicitud
 * PUT    /api/solicitudes/{id}/priorizar  → RF-03: Priorizar solicitud
 * PUT    /api/solicitudes/{id}/estado     → RF-04: Cambiar estado
 * PUT    /api/solicitudes/{id}/asignar    → RF-05: Asignar responsable
 * PUT    /api/solicitudes/{id}/cerrar     → RF-08: Cerrar solicitud
 * GET    /api/solicitudes/{id}            → Obtener solicitud + historial (RF-06)
 * GET    /api/solicitudes                 → RF-07: Consultar con filtros
 * GET    /api/solicitudes/estado/{estado} → RF-07: Consultar por estado
 * GET    /api/solicitudes/solicitante/{id}→ Consultar por solicitante
 * GET    /api/solicitudes/responsable/{id}→ Consultar por responsable
 */
@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permitir acceso desde Angular (Hito 3)
public class SolicitudController {

    private final SolicitudService solicitudService;

    // ==================== RF-01: REGISTRO ====================

    /**
     * Registra una nueva solicitud académica.
     * RF-01: Canal de origen, descripción, solicitante, fecha automática.
     */
    @PostMapping
    public ResponseEntity<ApiResponseDTO<SolicitudResponseDTO>> registrarSolicitud(
            @Valid @RequestBody SolicitudRequestDTO request) {
        SolicitudResponseDTO response = solicitudService.registrarSolicitud(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.exitoso("Solicitud registrada exitosamente", response));
    }

    // ==================== RF-02: CLASIFICACIÓN ====================

    /**
     * Clasifica una solicitud según su tipo.
     * RF-02: Asigna tipo y cambia estado a CLASIFICADA.
     * RF-03: Calcula prioridad automáticamente.
     */
    @PutMapping("/{id}/clasificar")
    public ResponseEntity<ApiResponseDTO<SolicitudResponseDTO>> clasificarSolicitud(
            @PathVariable Long id,
            @Valid @RequestBody ClasificacionRequestDTO request) {
        SolicitudResponseDTO response = solicitudService.clasificarSolicitud(id, request);
        return ResponseEntity.ok(ApiResponseDTO.exitoso("Solicitud clasificada exitosamente", response));
    }

    // ==================== RF-03: PRIORIZACIÓN MANUAL ====================

    /**
     * Ajusta manualmente la prioridad de una solicitud.
     * RF-03: Priorización con justificación obligatoria.
     */
    @PutMapping("/{id}/priorizar")
    public ResponseEntity<ApiResponseDTO<SolicitudResponseDTO>> priorizarSolicitud(
            @PathVariable Long id,
            @Valid @RequestBody PriorizacionRequestDTO request) {
        SolicitudResponseDTO response = solicitudService.priorizarSolicitud(id, request);
        return ResponseEntity.ok(ApiResponseDTO.exitoso("Prioridad actualizada exitosamente", response));
    }

    // ==================== RF-04: CAMBIO DE ESTADO ====================

    /**
     * Cambia el estado de una solicitud validando la transición.
     * RF-04: Transiciones válidas del ciclo de vida.
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<ApiResponseDTO<SolicitudResponseDTO>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambioEstadoRequestDTO request) {
        SolicitudResponseDTO response = solicitudService.cambiarEstado(id, request);
        return ResponseEntity.ok(ApiResponseDTO.exitoso("Estado actualizado exitosamente", response));
    }

    // ==================== RF-05: ASIGNACIÓN ====================

    /**
     * Asigna un responsable a la solicitud.
     * RF-05: Responsable activo, registro en historial.
     */
    @PutMapping("/{id}/asignar")
    public ResponseEntity<ApiResponseDTO<SolicitudResponseDTO>> asignarResponsable(
            @PathVariable Long id,
            @Valid @RequestBody AsignacionRequestDTO request) {
        SolicitudResponseDTO response = solicitudService.asignarResponsable(id, request);
        return ResponseEntity.ok(ApiResponseDTO.exitoso("Responsable asignado exitosamente", response));
    }

    // ==================== RF-08: CIERRE ====================

    /**
     * Cierra una solicitud con observación obligatoria.
     * RF-08: Solo desde estado ATENDIDA, con observación, inmutable después.
     */
    @PutMapping("/{id}/cerrar")
    public ResponseEntity<ApiResponseDTO<SolicitudResponseDTO>> cerrarSolicitud(
            @PathVariable Long id,
            @Valid @RequestBody CierreRequestDTO request) {
        SolicitudResponseDTO response = solicitudService.cerrarSolicitud(id, request);
        return ResponseEntity.ok(ApiResponseDTO.exitoso("Solicitud cerrada exitosamente", response));
    }

    // ==================== RF-06 & RF-07: CONSULTAS ====================

    /**
     * Obtiene una solicitud con su historial completo.
     * RF-06: Historial auditable visible.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<SolicitudResponseDTO>> obtenerSolicitud(@PathVariable Long id) {
        SolicitudResponseDTO response = solicitudService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponseDTO.exitoso("Solicitud encontrada", response));
    }

    /**
     * Consulta solicitudes con filtros opcionales.
     * RF-07: Filtro por estado, tipo, prioridad, responsable.
     */
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<SolicitudResponseDTO>>> consultarSolicitudes(
            @RequestParam(name = "estado", required = false) EstadoSolicitud estado,
            @RequestParam(name = "tipo", required = false) TipoSolicitud tipo,
            @RequestParam(name = "prioridad", required = false) Prioridad prioridad,
            @RequestParam(name = "responsableId", required = false) Long responsableId) {

        List<SolicitudResponseDTO> response;

        // Si no hay filtros, retornar todas
        if (estado == null && tipo == null && prioridad == null && responsableId == null) {
            response = solicitudService.obtenerTodas();
        } else {
            response = solicitudService.consultarConFiltros(estado, tipo, prioridad, responsableId);
        }

        return ResponseEntity.ok(ApiResponseDTO.exitoso(
                "Se encontraron " + response.size() + " solicitudes", response));
    }

    /**
     * Consulta solicitudes de forma paginada con filtros opcionales.
     */
    @GetMapping("/paginado")
    public ResponseEntity<ApiResponseDTO<PageResponseDTO<SolicitudResponseDTO>>> consultarSolicitudesPaginado(
            @RequestParam(name = "estado", required = false) EstadoSolicitud estado,
            @RequestParam(name = "tipo", required = false) TipoSolicitud tipo,
            @RequestParam(name = "prioridad", required = false) Prioridad prioridad,
            @RequestParam(name = "responsableId", required = false) Long responsableId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "fechaRegistro") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction) {

        PageResponseDTO<SolicitudResponseDTO> response = solicitudService.consultarConFiltrosPaginado(
                estado, tipo, prioridad, responsableId, page, size, sortBy, direction
        );

        return ResponseEntity.ok(ApiResponseDTO.exitoso("Consulta paginada de solicitudes", response));
    }

    /**
     * Consulta solicitudes por estado específico.
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponseDTO<List<SolicitudResponseDTO>>> consultarPorEstado(
            @PathVariable EstadoSolicitud estado) {
        List<SolicitudResponseDTO> response = solicitudService.consultarPorEstado(estado);
        return ResponseEntity.ok(ApiResponseDTO.exitoso(
                "Solicitudes en estado " + estado.getDescripcion(), response));
    }

    /**
     * Consulta solicitudes de un solicitante.
     */
    @GetMapping("/solicitante/{solicitanteId}")
    public ResponseEntity<ApiResponseDTO<List<SolicitudResponseDTO>>> consultarPorSolicitante(
            @PathVariable Long solicitanteId) {
        List<SolicitudResponseDTO> response = solicitudService.consultarPorSolicitante(solicitanteId);
        return ResponseEntity.ok(ApiResponseDTO.exitoso(
                "Solicitudes del solicitante", response));
    }

    /**
     * Consulta solicitudes asignadas a un responsable.
     */
    @GetMapping("/responsable/{responsableId}")
    public ResponseEntity<ApiResponseDTO<List<SolicitudResponseDTO>>> consultarPorResponsable(
            @PathVariable Long responsableId) {
        List<SolicitudResponseDTO> response = solicitudService.consultarPorResponsable(responsableId);
        return ResponseEntity.ok(ApiResponseDTO.exitoso(
                "Solicitudes del responsable", response));
    }
}
