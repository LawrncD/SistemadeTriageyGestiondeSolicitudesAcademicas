package co.edu.uniquindio.poo.dto.request;

import co.edu.uniquindio.poo.model.enums.Prioridad;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO para asignar prioridad a una solicitud.
 * RF-03: Priorización con justificación obligatoria.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriorizacionRequestDTO {

    @NotNull(message = "La prioridad es obligatoria")
    private Prioridad prioridad;

    @NotBlank(message = "La justificación de la prioridad es obligatoria")
    private String justificacion;
}
