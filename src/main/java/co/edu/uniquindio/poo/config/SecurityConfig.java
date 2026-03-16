package co.edu.uniquindio.poo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Configuración de seguridad del sistema.
 * RF-13: Autorización básica de operaciones.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/solicitudes").hasAnyRole("ESTUDIANTE", "ADMINISTRATIVO", "RESPONSABLE")
                    .requestMatchers(HttpMethod.GET, "/api/solicitudes/**").hasAnyRole("ESTUDIANTE", "DOCENTE", "ADMINISTRATIVO", "RESPONSABLE")
                    .requestMatchers(HttpMethod.PUT, "/api/solicitudes/**").hasAnyRole("ADMINISTRATIVO", "RESPONSABLE")
                    .requestMatchers(HttpMethod.POST, "/api/usuarios").hasRole("ADMINISTRATIVO")
                    .requestMatchers(HttpMethod.GET, "/api/usuarios/**").hasAnyRole("ADMINISTRATIVO", "RESPONSABLE")
                    .requestMatchers(HttpMethod.PUT, "/api/usuarios/**").hasRole("ADMINISTRATIVO")
                    .requestMatchers(HttpMethod.GET, "/api/ia/**").hasAnyRole("ADMINISTRATIVO", "RESPONSABLE", "DOCENTE")
                    .requestMatchers(HttpMethod.POST, "/api/ia/**").hasAnyRole("ADMINISTRATIVO", "RESPONSABLE", "DOCENTE")
                    .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
