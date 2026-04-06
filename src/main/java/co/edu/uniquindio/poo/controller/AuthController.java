package co.edu.uniquindio.poo.controller;

import co.edu.uniquindio.poo.dto.request.LoginRequestDTO;
import co.edu.uniquindio.poo.dto.response.ApiResponseDTO;
import co.edu.uniquindio.poo.dto.response.LoginResponseDTO;
import co.edu.uniquindio.poo.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para autenticación.
 * Gestiona el login y la generación de tokens JWT.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Autenticación", description = "API para autenticación y gestión de tokens JWT")
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint de login que retorna un token JWT.
     */
    @Operation(summary = "Iniciar sesión", description = "Autentica al usuario y retorna un token JWT")
    @PostMapping("/login")
    public ResponseEntity<ApiResponseDTO<LoginResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request) {
        LoginResponseDTO response = authService.login(request);
        return ResponseEntity.ok(ApiResponseDTO.exitoso("Autenticación exitosa", response));
    }

    /**
     * Endpoint para verificar si el token es válido.
     * Solo retorna éxito si el token en el header es válido.
     */
    @Operation(summary = "Verificar token", description = "Verifica si el token JWT actual es válido")
    @GetMapping("/verificar")
    public ResponseEntity<ApiResponseDTO<String>> verificarToken() {
        return ResponseEntity.ok(ApiResponseDTO.exitoso("Token válido", "Autenticado correctamente"));
    }
}
