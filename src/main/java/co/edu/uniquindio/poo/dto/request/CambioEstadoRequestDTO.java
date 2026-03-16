package co.edu.uniquindio.poo.dto.request;

import co.edu.uniquindio.poo.model.enums.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO para cambiar el estado de una solicitud.
 * RF-04: Gestión del ciclo de vida con validación de transiciones.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CambioEstadoRequestDTO {

    @NotNull(message = "El nuevo estado es obligatorio")
    private EstadoSolicitud nuevoEstado;

    /** Observaciones sobre el cambio de estado */
    private String observaciones;
}
