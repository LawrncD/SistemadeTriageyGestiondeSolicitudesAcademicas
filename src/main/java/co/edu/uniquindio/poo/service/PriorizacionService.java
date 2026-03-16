package co.edu.uniquindio.poo.service;

import co.edu.uniquindio.poo.model.entity.Solicitud;
import co.edu.uniquindio.poo.model.enums.Prioridad;
import co.edu.uniquindio.poo.model.enums.TipoSolicitud;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Servicio encargado de calcular la prioridad de una solicitud basándose en reglas de negocio.
 * RF-03: Priorización basada en tipo de solicitud, impacto académico y fecha límite.
 *
 * Motor de reglas:
 * 1. Tipo de solicitud: Registro/Cancelación de asignaturas → mayor urgencia.
 * 2. Fecha límite: Mientras más cercana, mayor prioridad.
 * 3. Impacto académico: Solicitudes que afectan matrícula tienen mayor peso.
 */
@Service
public class PriorizacionService {

    /**
     * Calcula automáticamente la prioridad de una solicitud y genera la justificación.
     * Retorna un arreglo: [0] = Prioridad, [1] = Justificación (String).
     */
    public Object[] calcularPrioridad(Solicitud solicitud) {
        int puntaje = 0;
        StringBuilder justificacion = new StringBuilder();

        // Regla 1: Prioridad por tipo de solicitud
        puntaje += calcularPuntajePorTipo(solicitud.getTipoSolicitud(), justificacion);

        // Regla 2: Prioridad por fecha límite
        puntaje += calcularPuntajePorFechaLimite(solicitud.getFechaLimite(), justificacion);

        // Regla 3: Señales semánticas de urgencia en la descripción
        puntaje += calcularPuntajePorDescripcion(solicitud.getDescripcion(), justificacion);

        // Determinar prioridad según puntaje total
        Prioridad prioridad = determinarPrioridad(puntaje);
        justificacion.insert(0, String.format("Puntaje total: %d. ", puntaje));

        return new Object[]{prioridad, justificacion.toString()};
    }

    /**
     * Calcula el puntaje basado en el tipo de solicitud.
     */
    private int calcularPuntajePorTipo(TipoSolicitud tipo, StringBuilder justificacion) {
        if (tipo == null) {
            justificacion.append("Sin tipo de solicitud asignado. ");
            return 0;
        }

        return switch (tipo) {
            case REGISTRO_ASIGNATURAS -> {
                justificacion.append("Registro de asignaturas: impacto alto en matrícula (+4). ");
                yield 4;
            }
            case CANCELACION_ASIGNATURAS -> {
                justificacion.append("Cancelación de asignaturas: impacto alto en matrícula (+4). ");
                yield 4;
            }
            case HOMOLOGACION -> {
                justificacion.append("Homologación: impacto medio en plan de estudios (+3). ");
                yield 3;
            }
            case SOLICITUD_CUPOS -> {
                justificacion.append("Solicitud de cupos: impacto medio en matrícula (+2). ");
                yield 2;
            }
            case CONSULTA_ACADEMICA -> {
                justificacion.append("Consulta académica: bajo impacto operativo (+1). ");
                yield 1;
            }
        };
    }

    /**
     * Calcula el puntaje basado en la cercanía de la fecha límite.
     */
    private int calcularPuntajePorFechaLimite(LocalDate fechaLimite, StringBuilder justificacion) {
        if (fechaLimite == null) {
            justificacion.append("Sin fecha límite definida (+0). ");
            return 0;
        }

        long diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), fechaLimite);

        if (diasRestantes < 0) {
            justificacion.append("Fecha límite vencida (+5). ");
            return 5;
        } else if (diasRestantes <= 2) {
            justificacion.append("Fecha límite en menos de 2 días (+4). ");
            return 4;
        } else if (diasRestantes <= 5) {
            justificacion.append("Fecha límite en menos de 5 días (+3). ");
            return 3;
        } else if (diasRestantes <= 10) {
            justificacion.append("Fecha límite en menos de 10 días (+2). ");
            return 2;
        } else {
            justificacion.append("Fecha límite lejana (+1). ");
            return 1;
        }
    }

    /**
     * Calcula puntaje adicional por señales de urgencia presentes en la descripción.
     */
    private int calcularPuntajePorDescripcion(String descripcion, StringBuilder justificacion) {
        if (descripcion == null || descripcion.isBlank()) {
            justificacion.append("Descripción sin señales de urgencia (+0). ");
            return 0;
        }

        String texto = descripcion.toLowerCase();
        int puntaje = 0;

        if (texto.contains("urgente") || texto.contains("inminente")) {
            puntaje += 2;
        }

        if (texto.contains("matricula") || texto.contains("cierre")) {
            puntaje += 1;
        }

        if (puntaje > 0) {
            justificacion.append("Descripción con señales de urgencia (+").append(puntaje).append("). ");
        } else {
            justificacion.append("Descripción sin señales de urgencia (+0). ");
        }

        return puntaje;
    }

    /**
     * Determina la prioridad final según el puntaje acumulado.
     */
    private Prioridad determinarPrioridad(int puntaje) {
        if (puntaje >= 7) return Prioridad.CRITICA;
        if (puntaje >= 5) return Prioridad.ALTA;
        if (puntaje >= 3) return Prioridad.MEDIA;
        return Prioridad.BAJA;
    }
}
