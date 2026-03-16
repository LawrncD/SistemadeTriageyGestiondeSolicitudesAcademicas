package co.edu.uniquindio.poo.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas de autorización por roles (RF-13) con filtros de seguridad habilitados.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("RF-13: Sin autenticación no permite consultar solicitudes")
    void sinAutenticacion_DebeRetornarUnauthorized() throws Exception {
        mockMvc.perform(get("/api/solicitudes"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("RF-13: Estudiante no puede consultar gestión de usuarios")
    void estudiante_NoPuedeConsultarUsuarios() throws Exception {
        mockMvc.perform(get("/api/usuarios")
                        .with(httpBasic("juan.perez@uq.edu.co", "123456")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RF-13: Administrativo sí puede consultar gestión de usuarios")
    void administrativo_PuedeConsultarUsuarios() throws Exception {
        mockMvc.perform(get("/api/usuarios")
                        .with(httpBasic("ana.martinez@uq.edu.co", "admin123")))
                .andExpect(status().isOk());
    }
}
