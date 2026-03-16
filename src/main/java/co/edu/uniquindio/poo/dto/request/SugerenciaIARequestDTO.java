package co.edu.uniquindio.poo.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO para enviar contexto opcional al motor de asistencia de IA.
 * RF-09 y RF-10.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SugerenciaIARequestDTO {

    @Size(max = 1000, message = "El contexto adicional no puede superar 1000 caracteres")
    private String contextoAdicional;
}
