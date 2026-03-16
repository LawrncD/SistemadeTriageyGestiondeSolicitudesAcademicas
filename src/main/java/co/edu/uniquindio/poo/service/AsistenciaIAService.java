package co.edu.uniquindio.poo.service;

import co.edu.uniquindio.poo.dto.request.SugerenciaIARequestDTO;
import co.edu.uniquindio.poo.dto.response.SolicitudResponseDTO;
import co.edu.uniquindio.poo.dto.response.SugerenciaIAResponseDTO;
import co.edu.uniquindio.poo.model.enums.Prioridad;
import co.edu.uniquindio.poo.model.enums.TipoSolicitud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Servicio de asistencia inteligente para sugerencias de respuesta y clasificación.
 *
 * Esta implementación usa heurísticas locales como base para RF-09/RF-10 y deja
 * preparado el contrato para conectar un LLM real en una fase posterior.
 */
@Service
@RequiredArgsConstructor
public class AsistenciaIAService {

    private static final String MODELO = "heuristico-local-v1";

    private final SolicitudService solicitudService;

    public SugerenciaIAResponseDTO obtenerSugerencia(Long solicitudId, SugerenciaIARequestDTO request) {
        SolicitudResponseDTO solicitud = solicitudService.obtenerPorId(solicitudId);

        TipoSolicitud tipoSugerido = determinarTipoSugerido(solicitud.getDescripcion(), solicitud.getTipoSolicitud());
        Prioridad prioridadSugerida = determinarPrioridadSugerida(
                solicitud.getDescripcion(), solicitud.getFechaLimite(), solicitud.getPrioridad());

        String contextoAdicional = request != null ? request.getContextoAdicional() : null;
        String justificacion = construirJustificacion(solicitud.getDescripcion(), solicitud.getFechaLimite(), contextoAdicional);
        String borrador = construirBorradorRespuesta(tipoSugerido, prioridadSugerida, contextoAdicional);

        return SugerenciaIAResponseDTO.builder()
                .solicitudId(solicitud.getId())
                .sugerenciaRespuesta(borrador)
                .tipoSolicitudSugerido(tipoSugerido)
                .prioridadSugerida(prioridadSugerida)
                .justificacionIA(justificacion)
                .modeloUtilizado(MODELO)
                .generadoEn(LocalDateTime.now())
                .build();
    }

    public SugerenciaIAResponseDTO obtenerClasificacionSugerida(Long solicitudId) {
        SolicitudResponseDTO solicitud = solicitudService.obtenerPorId(solicitudId);

        TipoSolicitud tipoSugerido = determinarTipoSugerido(solicitud.getDescripcion(), solicitud.getTipoSolicitud());
        Prioridad prioridadSugerida = determinarPrioridadSugerida(
                solicitud.getDescripcion(), solicitud.getFechaLimite(), solicitud.getPrioridad());

        return SugerenciaIAResponseDTO.builder()
                .solicitudId(solicitud.getId())
                .tipoSolicitudSugerido(tipoSugerido)
                .prioridadSugerida(prioridadSugerida)
                .justificacionIA(construirJustificacion(solicitud.getDescripcion(), solicitud.getFechaLimite(), null))
                .modeloUtilizado(MODELO)
                .generadoEn(LocalDateTime.now())
                .build();
    }

    private TipoSolicitud determinarTipoSugerido(String descripcion, TipoSolicitud tipoActual) {
        if (tipoActual != null) {
            return tipoActual;
        }

        String texto = normalizar(descripcion);
        if (texto.contains("homolog")) {
            return TipoSolicitud.HOMOLOGACION;
        }
        if (texto.contains("cancel") || texto.contains("retiro")) {
            return TipoSolicitud.CANCELACION_ASIGNATURAS;
        }
        if (texto.contains("cupo") || texto.contains("sobrecupo")) {
            return TipoSolicitud.SOLICITUD_CUPOS;
        }
        if (texto.contains("registro") || texto.contains("matricula")) {
            return TipoSolicitud.REGISTRO_ASIGNATURAS;
        }
        return TipoSolicitud.CONSULTA_ACADEMICA;
    }

    private Prioridad determinarPrioridadSugerida(String descripcion, LocalDate fechaLimite, Prioridad prioridadActual) {
        if (prioridadActual != null) {
            return prioridadActual;
        }

        String texto = normalizar(descripcion);
        if (fechaLimite != null) {
            long dias = ChronoUnit.DAYS.between(LocalDate.now(), fechaLimite);
            if (dias <= 2) {
                return Prioridad.CRITICA;
            }
            if (dias <= 5) {
                return Prioridad.ALTA;
            }
        }

        if (texto.contains("urgente") || texto.contains("inminente") || texto.contains("hoy")) {
            return Prioridad.ALTA;
        }
        if (texto.contains("matricula") || texto.contains("cierre")) {
            return Prioridad.MEDIA;
        }
        return Prioridad.BAJA;
    }

    private String construirJustificacion(String descripcion, LocalDate fechaLimite, String contextoAdicional) {
        StringBuilder justificacion = new StringBuilder("Sugerencia generada por análisis semántico de la descripción");

        if (fechaLimite != null) {
            long dias = ChronoUnit.DAYS.between(LocalDate.now(), fechaLimite);
            justificacion.append(" y cercanía de fecha límite (").append(dias).append(" días)");
        }

        if (contextoAdicional != null && !contextoAdicional.isBlank()) {
            justificacion.append(". Se incorporó contexto adicional proporcionado por el actor");
        }

        justificacion.append(".");
        return justificacion.toString();
    }

    private String construirBorradorRespuesta(TipoSolicitud tipo, Prioridad prioridad, String contextoAdicional) {
        StringBuilder borrador = new StringBuilder("Estimado(a) estudiante, su solicitud ha sido analizada preliminarmente. ");
        borrador.append("Tipo sugerido: ").append(tipo.getDescripcion()).append(". ");
        borrador.append("Prioridad sugerida: ").append(prioridad.getDescripcion()).append(". ");
        borrador.append("Un responsable revisará el caso y le notificará los siguientes pasos.");

        if (contextoAdicional != null && !contextoAdicional.isBlank()) {
            borrador.append(" Se tuvo en cuenta el contexto adicional informado para orientar esta sugerencia.");
        }

        return borrador.toString();
    }

    private String normalizar(String texto) {
        return texto == null ? "" : texto.toLowerCase();
    }
}
