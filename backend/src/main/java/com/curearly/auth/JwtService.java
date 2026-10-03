package com.curearly.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(@Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32)
            throw new IllegalStateException("JWT_SECRET must contain at least 32 bytes");
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    public String issue(String patientId) {
        Instant now = Instant.now();
        return Jwts.builder().subject(patientId).issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationMinutes * 60))).signWith(key).compact();
    }

    public String subject(String token) {
        Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return c.getSubject();
    }

    public long expirationSeconds() {
        return expirationMinutes * 60;
    }
}
