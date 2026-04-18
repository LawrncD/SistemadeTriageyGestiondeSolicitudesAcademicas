package co.edu.uniquindio.poo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro de autenticación JWT.
 * Intercepta cada request para validar el token JWT y establecer el contexto de seguridad.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String mockUserEmail = request.getHeader("X-Mock-User-Email");
        final String jwt;
        final String userEmail;

        // Mock para Hito 2: Evadir JWT usando un header directo de prueba
        if (mockUserEmail != null && !mockUserEmail.isBlank()) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(mockUserEmail);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.warn("ATENCIÓN: Autenticado mediante Mock Header (X-Mock-User-Email) para pruebas del Hito 2.");
            } catch (Exception e) {
                logger.error("Error en Mock Authentication: " + e.getMessage());
            }
            filterChain.doFilter(request, response);
            return;
        }

        // Si no hay header Authorization o no empieza con "Bearer ", continuar sin autenticar
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extraer el token (quitar "Bearer ")
        jwt = authHeader.substring(7);

        try {
            // Extraer el email del token
            userEmail = jwtService.extractUsername(jwt);

            // Si hay email y no hay autenticación previa en el contexto
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Cargar los detalles del usuario desde la base de datos
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // Validar el token
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Crear el token de autenticación
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    // Establecer detalles adicionales
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Establecer la autenticación en el contexto de seguridad
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Si hay error al procesar el token, simplemente no autenticamos
            // El filtro de seguridad se encargará de denegar el acceso si es necesario
            logger.debug("Error procesando token JWT: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
