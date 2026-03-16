package co.edu.uniquindio.poo.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO genérico para respuestas estandarizadas de la API REST.
 * RF-12: Exposición de servicios mediante API REST con respuestas consistentes.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponseDTO<T> {

    private boolean exitoso;
    private String mensaje;
    private T datos;
    private LocalDateTime timestamp;

    /**
     * Crea una respuesta exitosa con datos.
     */
    public static <T> ApiResponseDTO<T> exitoso(String mensaje, T datos) {
        return ApiResponseDTO.<T>builder()
                .exitoso(true)
                .mensaje(mensaje)
                .datos(datos)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Crea una respuesta exitosa sin datos.
     */
    public static <T> ApiResponseDTO<T> exitoso(String mensaje) {
        return ApiResponseDTO.<T>builder()
                .exitoso(true)
                .mensaje(mensaje)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Crea una respuesta de error.
     */
    public static <T> ApiResponseDTO<T> error(String mensaje) {
        return ApiResponseDTO.<T>builder()
                .exitoso(false)
                .mensaje(mensaje)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
