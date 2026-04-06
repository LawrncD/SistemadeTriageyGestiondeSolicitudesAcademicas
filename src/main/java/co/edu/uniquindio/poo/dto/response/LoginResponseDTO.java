package co.edu.uniquindio.poo.dto.response;

import co.edu.uniquindio.poo.model.enums.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la respuesta de autenticación JWT.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {

    private String token;
    private String tipo;
    private Long expiresIn;
    private Long usuarioId;
    private String email;
    private String nombreCompleto;
    private Rol rol;
}
