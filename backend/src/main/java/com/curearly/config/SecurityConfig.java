package com.curearly.config;

import com.curearly.auth.JwtAuthenticationFilter;
import com.curearly.auth.GoogleOAuthSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final String frontendUrl;
    private final boolean googleEnabled;
    private final GoogleOAuthSuccessHandler googleSuccess;

    public SecurityConfig(
            JwtAuthenticationFilter jwtFilter,
            GoogleOAuthSuccessHandler googleSuccess,
            @Value("${app.frontend-url}") String frontendUrl,
            @Value("${app.google-oauth-enabled}") boolean googleEnabled) {
        this.jwtFilter = jwtFilter;
        this.googleSuccess = googleSuccess;
        this.frontendUrl = frontendUrl;
        this.googleEnabled = googleEnabled;
    }

    @Bean
    public SecurityFilterChain security(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/api/auth/**", "/actuator/health", "/oauth2/**", "/login/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        if (googleEnabled) {
            http.oauth2Login(o -> o.successHandler(googleSuccess));
        }

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
            "Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"
        ));
        config.setExposedHeaders(List.of("Set-Cookie"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
