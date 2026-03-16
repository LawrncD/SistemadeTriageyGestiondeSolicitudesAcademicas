package co.edu.uniquindio.poo.dto.response;

import lombok.*;

import java.util.List;

/**
 * DTO estándar para respuestas paginadas.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponseDTO<T> {

    private List<T> contenido;
    private int numeroPagina;
    private int tamanoPagina;
    private long totalElementos;
    private int totalPaginas;
    private boolean ultimaPagina;
}
