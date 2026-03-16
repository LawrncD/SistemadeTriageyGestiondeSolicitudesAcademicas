package co.edu.uniquindio.poo.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas de autorización por roles (RF-13) con filtros de seguridad habilitados.
 * Verifica que cada rol solo puede acceder a los endpoints autorizados.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    // Credenciales de usuarios cargados por DataInitConfig
    private static final String ESTUDIANTE_EMAIL = "juan.perez@uq.edu.co";
    private static final String ESTUDIANTE_PASS = "123456";
    private static final String ADMIN_EMAIL = "ana.martinez@uq.edu.co";
    private static final String ADMIN_PASS = "admin123";
    private static final String RESPONSABLE_EMAIL = "carlos.lopez@uq.edu.co";
    private static final String RESPONSABLE_PASS = "123456";
    private static final String DOCENTE_EMAIL = "pedro.ramirez@uq.edu.co";
    private static final String DOCENTE_PASS = "123456";

    // ==================== Sin autenticación ====================

    @Test
    @DisplayName("RF-13: Sin autenticación no permite consultar solicitudes")
    void sinAutenticacion_DebeRetornarUnauthorized() throws Exception {
        mockMvc.perform(get("/api/solicitudes"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("RF-13: Sin autenticación no permite consultar usuarios")
    void sinAutenticacion_NoPuedeConsultarUsuarios() throws Exception {
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isUnauthorized());
    }

    // ==================== Rol ESTUDIANTE ====================

    @Test
    @DisplayName("RF-13: Estudiante puede consultar solicitudes")
    void estudiante_PuedeConsultarSolicitudes() throws Exception {
        mockMvc.perform(get("/api/solicitudes")
                        .with(httpBasic(ESTUDIANTE_EMAIL, ESTUDIANTE_PASS))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true));
    }

    @Test
    @DisplayName("RF-13: Estudiante NO puede consultar gestión de usuarios")
    void estudiante_NoPuedeConsultarUsuarios() throws Exception {
        mockMvc.perform(get("/api/usuarios")
                        .with(httpBasic(ESTUDIANTE_EMAIL, ESTUDIANTE_PASS)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RF-13: Estudiante NO puede clasificar solicitudes (PUT)")
    void estudiante_NoPuedeClasificarSolicitudes() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .with(httpBasic(ESTUDIANTE_EMAIL, ESTUDIANTE_PASS))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    // ==================== Rol ADMINISTRATIVO ====================

    @Test
    @DisplayName("RF-13: Administrativo SÍ puede consultar gestión de usuarios")
    void administrativo_PuedeConsultarUsuarios() throws Exception {
        mockMvc.perform(get("/api/usuarios")
                        .with(httpBasic(ADMIN_EMAIL, ADMIN_PASS)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("RF-13: Administrativo puede consultar solicitudes")
    void administrativo_PuedeConsultarSolicitudes() throws Exception {
        mockMvc.perform(get("/api/solicitudes")
                        .with(httpBasic(ADMIN_EMAIL, ADMIN_PASS))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true));
    }

    // ==================== Rol RESPONSABLE ====================

    @Test
    @DisplayName("RF-13: Responsable puede consultar solicitudes")
    void responsable_PuedeConsultarSolicitudes() throws Exception {
        mockMvc.perform(get("/api/solicitudes")
                        .with(httpBasic(RESPONSABLE_EMAIL, RESPONSABLE_PASS))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    // ==================== Rol DOCENTE ====================

    @Test
    @DisplayName("RF-13: Docente puede consultar solicitudes")
    void docente_PuedeConsultarSolicitudes() throws Exception {
        mockMvc.perform(get("/api/solicitudes")
                        .with(httpBasic(DOCENTE_EMAIL, DOCENTE_PASS))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("RF-13: Docente NO puede crear usuarios")
    void docente_NoPuedeCrearUsuarios() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .with(httpBasic(DOCENTE_EMAIL, DOCENTE_PASS))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }
}
