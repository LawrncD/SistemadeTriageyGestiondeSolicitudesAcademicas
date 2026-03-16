package co.edu.uniquindio.poo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO para cerrar una solicitud.
 * RF-08: Cierre con observación obligatoria.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CierreRequestDTO {

    @NotBlank(message = "La observación de cierre es obligatoria")
    private String observacionCierre;
}
