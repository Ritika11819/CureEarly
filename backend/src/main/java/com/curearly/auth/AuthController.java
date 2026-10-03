package com.curearly.auth;

import com.curearly.patient.Patient;
import com.curearly.patient.PatientRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final PatientRepository patients;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final boolean secure;

    public AuthController(
            PatientRepository patients,
            PasswordEncoder encoder,
            JwtService jwt,
            @org.springframework.beans.factory.annotation.Value("${app.cookie-secure}") boolean secure) {
        this.patients = patients;
        this.encoder = encoder;
        this.jwt = jwt;
        this.secure = secure;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequests.Register r, HttpServletResponse response) {
        if (patients.findByEmail(r.email()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "An account with this email already exists."));
        }
        Patient p = new Patient();
        p.setFullName(r.fullName().trim());
        p.setEmail(r.email());
        p.setPhone(r.phone().trim());
        p.setPasswordHash(encoder.encode(r.password()));
        patients.save(p);
        setSession(response, p);
        return ResponseEntity.status(201).body(user(p));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequests.Login r, HttpServletResponse response) {
        Patient p = patients.findByEmail(r.email()).orElse(null);
        if (p == null || p.getPasswordHash() == null || !encoder.matches(r.password(), p.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
        }
        setSession(response, p);
        return ResponseEntity.ok(user(p));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal String patientId) {
        if (patientId == null || patientId.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        Patient p = patients.findById(patientId).orElse(null);
        if (p == null) {
            return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        }
        return ResponseEntity.ok(user(p));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", 0).toString());
        return ResponseEntity.noContent().build();
    }

    public void setSession(HttpServletResponse response, Patient p) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(jwt.issue(p.getId()), jwt.expirationSeconds()).toString());
    }

    private ResponseCookie cookie(String value, long seconds) {
        return ResponseCookie.from("curearly_access", value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(seconds)
                .build();
    }

    private AuthRequests.AuthenticatedUser user(Patient p) {
        return new AuthRequests.AuthenticatedUser(p.getId(), p.getFullName(), p.getEmail());
    }
}
