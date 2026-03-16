package co.edu.uniquindio.poo.controller;

import co.edu.uniquindio.poo.dto.request.*;
import co.edu.uniquindio.poo.model.enums.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de integración para la API REST de solicitudes.
 * Verifica el flujo completo del ciclo de vida de una solicitud.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SolicitudControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    // ==================== RF-01: REGISTRO ====================

    @Test
    @Order(1)
    @DisplayName("RF-01: Registrar solicitud exitosamente")
    void registrarSolicitud_DebeRetornarCreated() throws Exception {
        SolicitudRequestDTO request = SolicitudRequestDTO.builder()
                .descripcion("Necesito registrar la asignatura Programación Avanzada para este semestre")
                .canalOrigen(CanalOrigen.CSU)
                .solicitanteId(1L)
                .build();

        mockMvc.perform(post("/api/solicitudes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exitoso").value(true))
                .andExpect(jsonPath("$.datos.estado").value("REGISTRADA"))
                .andExpect(jsonPath("$.datos.canalOrigen").value("CSU"))
                .andExpect(jsonPath("$.datos.historial").isArray());
    }

    @Test
    @Order(2)
    @DisplayName("RF-01: Registrar solicitud sin descripción debe fallar")
    void registrarSolicitudSinDescripcion_DebeRetornarBadRequest() throws Exception {
        SolicitudRequestDTO request = SolicitudRequestDTO.builder()
                .canalOrigen(CanalOrigen.CORREO)
                .solicitanteId(1L)
                .build();

        mockMvc.perform(post("/api/solicitudes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ==================== RF-02: CLASIFICACIÓN ====================

    @Test
    @Order(3)
    @DisplayName("RF-02 + RF-03: Clasificar solicitud asigna tipo y calcula prioridad")
    void clasificarSolicitud_DebeAsignarTipoYPrioridad() throws Exception {
        // Primero crear solicitud
        SolicitudRequestDTO createRequest = SolicitudRequestDTO.builder()
                .descripcion("Solicitud de homologación de materias del programa anterior")
                .canalOrigen(CanalOrigen.CORREO)
                .solicitanteId(1L)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/solicitudes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long solicitudId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("datos").get("id").asLong();

        // Clasificar
        ClasificacionRequestDTO clasificacionRequest = ClasificacionRequestDTO.builder()
                .tipoSolicitud(TipoSolicitud.HOMOLOGACION)
                .observaciones("Clasificada como homologación")
                .build();

        mockMvc.perform(put("/api/solicitudes/" + solicitudId + "/clasificar")
                        .sessionAttr("usuarioId", 3L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clasificacionRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.estado").value("CLASIFICADA"))
                .andExpect(jsonPath("$.datos.tipoSolicitud").value("HOMOLOGACION"))
                .andExpect(jsonPath("$.datos.prioridad").exists());
    }

    // ==================== RF-04: TRANSICIÓN INVÁLIDA ====================

    @Test
    @Order(4)
    @DisplayName("RF-04: Transición inválida debe ser rechazada")
    void transicionInvalida_DebeRetornarBadRequest() throws Exception {
        // Crear solicitud
        SolicitudRequestDTO createRequest = SolicitudRequestDTO.builder()
                .descripcion("Consulta sobre plan de estudios")
                .canalOrigen(CanalOrigen.TELEFONICO)
                .solicitanteId(1L)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/solicitudes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long solicitudId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("datos").get("id").asLong();

        // Intentar saltar de REGISTRADA a EN_ATENCION
        CambioEstadoRequestDTO cambioEstado = CambioEstadoRequestDTO.builder()
                .nuevoEstado(EstadoSolicitud.EN_ATENCION)
                .observaciones("Intentando saltar estado")
                .build();

        mockMvc.perform(put("/api/solicitudes/" + solicitudId + "/estado")
                        .sessionAttr("usuarioId", 3L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambioEstado)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exitoso").value(false));
    }

    // ==================== RF-07: CONSULTAS ====================

    @Test
    @Order(5)
    @DisplayName("RF-07: Consultar todas las solicitudes")
    void consultarTodas_DebeRetornarLista() throws Exception {
        mockMvc.perform(get("/api/solicitudes")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true))
                .andExpect(jsonPath("$.datos").isArray());
    }

    @Test
    @Order(6)
    @DisplayName("RF-07: Consultar solicitudes por estado")
    void consultarPorEstado_DebeRetornarFiltradas() throws Exception {
        mockMvc.perform(get("/api/solicitudes/estado/REGISTRADA")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true))
                .andExpect(jsonPath("$.datos").isArray());
    }

    @Test
    @Order(7)
    @DisplayName("RF-07: Consultar con filtro de estado")
    void consultarConFiltros_DebeRetornarFiltradas() throws Exception {
        mockMvc.perform(get("/api/solicitudes")
                        .param("estado", "REGISTRADA")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true));
    }

    // ==================== USUARIOS ====================

    @Test
    @Order(8)
    @DisplayName("Obtener todos los usuarios cargados por DataInit")
    void obtenerUsuarios_DebeRetornarListaCargada() throws Exception {
        mockMvc.perform(get("/api/usuarios")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true))
                .andExpect(jsonPath("$.datos").isArray());
    }

    @Test
    @Order(9)
    @DisplayName("RF-05: Obtener responsables activos para asignación")
    void obtenerResponsablesActivos_DebeRetornarLista() throws Exception {
        mockMvc.perform(get("/api/usuarios/responsables-activos")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true));
    }

        @Test
        @Order(10)
        @DisplayName("RF-01: Registrar solicitud con fecha límite pasada debe fallar")
        void registrarSolicitudConFechaLimitePasada_DebeRetornarBadRequest() throws Exception {
                SolicitudRequestDTO request = SolicitudRequestDTO.builder()
                                .descripcion("Solicitud con fecha no valida para registro")
                                .canalOrigen(CanalOrigen.CORREO)
                                .solicitanteId(1L)
                                .fechaLimite(LocalDate.now().minusDays(1))
                                .build();

                mockMvc.perform(post("/api/solicitudes")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.exitoso").value(false));
        }

        @Test
        @Order(11)
        @DisplayName("RF-07: Consultar solicitudes paginadas")
        void consultarSolicitudesPaginadas_DebeRetornarEstructuraPaginada() throws Exception {
                mockMvc.perform(get("/api/solicitudes/paginado")
                                                .param("page", "0")
                                                .param("size", "2")
                                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.exitoso").value(true))
                                .andExpect(jsonPath("$.datos.contenido").isArray())
                                .andExpect(jsonPath("$.datos.numeroPagina").value(0))
                                .andExpect(jsonPath("$.datos.tamanoPagina").value(2));
        }
}
