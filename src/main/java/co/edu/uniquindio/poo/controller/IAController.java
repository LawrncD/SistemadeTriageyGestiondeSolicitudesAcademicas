package co.edu.uniquindio.poo.controller;

import co.edu.uniquindio.poo.dto.request.SugerenciaIARequestDTO;
import co.edu.uniquindio.poo.dto.response.ApiResponseDTO;
import co.edu.uniquindio.poo.dto.response.SugerenciaIAResponseDTO;
import co.edu.uniquindio.poo.service.AsistenciaIAService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para asistencia de IA.
 * RF-09: Sugerencia de respuesta.
 * RF-10: Clasificación/prioridad sugerida.
 */
@RestController
@RequestMapping("/api/ia/solicitudes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IAController {

    private final AsistenciaIAService asistenciaIAService;

    @PostMapping("/{id}/sugerencia")
    public ResponseEntity<ApiResponseDTO<SugerenciaIAResponseDTO>> obtenerSugerenciaIA(
            @PathVariable Long id,
            @RequestBody(required = false) SugerenciaIARequestDTO request) {

        SugerenciaIAResponseDTO response = asistenciaIAService.obtenerSugerencia(id, request);
        return ResponseEntity.ok(ApiResponseDTO.exitoso("Sugerencia de IA generada exitosamente", response));
    }

    @GetMapping("/{id}/clasificacion-sugerida")
    public ResponseEntity<ApiResponseDTO<SugerenciaIAResponseDTO>> obtenerClasificacionSugerida(
            @PathVariable Long id) {

        SugerenciaIAResponseDTO response = asistenciaIAService.obtenerClasificacionSugerida(id);
        return ResponseEntity.ok(ApiResponseDTO.exitoso("Clasificación sugerida por IA obtenida exitosamente", response));
    }
}
