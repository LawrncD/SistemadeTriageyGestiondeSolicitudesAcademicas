package co.edu.uniquindio.poo.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO para asignar un responsable a una solicitud.
 * RF-05: Asignación de responsables con registro en historial.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsignacionRequestDTO {

    @NotNull(message = "El ID del responsable es obligatorio")
    private Long responsableId;

    /** Observaciones opcionales sobre la asignación */
    private String observaciones;
}
