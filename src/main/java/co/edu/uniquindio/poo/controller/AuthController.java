package co.edu.uniquindio.poo.controller;

import co.edu.uniquindio.poo.dto.common.ApiResponseDTO;
import co.edu.uniquindio.poo.dto.usuario.UsuarioRequestDTO;
import co.edu.uniquindio.poo.dto.usuario.UsuarioResponseDTO;
import co.edu.uniquindio.poo.model.entity.Usuario;
import co.edu.uniquindio.poo.repository.UsuarioRepository;
import co.edu.uniquindio.poo.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponseDTO<UsuarioResponseDTO>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales invÃ¡lidas"));

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new IllegalArgumentException("Credenciales invÃ¡lidas");
        }

        if (!usuario.getActivo()) {
            throw new IllegalArgumentException("El usuario estÃ¡ inactivo");
        }

        // Generar un token "falso" de Basic Auth para que el frontend lo use en headers
        String basicToken = Base64.getEncoder().encodeToString((email + ":" + password).getBytes());

        UsuarioResponseDTO response = UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .identificacion(usuario.getIdentificacion())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .activo(usuario.getActivo())
                .build();
        
        // Vamos a inyectar el token en un campo (podemos devolverlo en Map, pero por simplicidad el frontend asume Response)
        // El frontend Angular podrÃ¡ derivarlo, pero le enviaremos esto junto con la respuesta de Ã©xito
        return ResponseEntity.ok(ApiResponseDTO.exitoso(basicToken, response));
    }

    @PostMapping("/registro")
    public ResponseEntity<ApiResponseDTO<UsuarioResponseDTO>> registro(@Valid @RequestBody UsuarioRequestDTO request) {
        UsuarioResponseDTO response = usuarioService.registrarUsuario(request);
        return ResponseEntity.status(201).body(ApiResponseDTO.exitoso("Usuario registrado con Ã©xito", response));
    }
}
