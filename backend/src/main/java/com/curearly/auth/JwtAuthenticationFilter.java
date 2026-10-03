package com.curearly.auth;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwt;

    public JwtAuthenticationFilter(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = cookie(request, "curearly_access");
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null)
            try {
                String id = jwt.subject(token);
                var auth = new UsernamePasswordAuthenticationToken(id, null, java.util.List.of());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException | IllegalArgumentException ignored) {
            }
        chain.doFilter(request, response);
    }

    private String cookie(HttpServletRequest r, String name) {
        if (r.getCookies() == null)
            return null;
        for (Cookie c : r.getCookies())
            if (name.equals(c.getName()))
                return c.getValue();
        return null;
    }
}
