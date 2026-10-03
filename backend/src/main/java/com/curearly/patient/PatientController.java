package com.curearly.patient;

import jakarta.validation.Valid;
import java.util.List;
//import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients/me")
public class PatientController {
    private final PatientRepository patients;

    public PatientController(PatientRepository patients) {
        this.patients = patients;
    }

    @GetMapping
    public Patient me(@AuthenticationPrincipal String patientId) {
        return patient(patientId);
    }

    @PutMapping("/profile")
    public Patient updateProfile(@AuthenticationPrincipal String patientId, @Valid @RequestBody ProfileRequest r) {
        Patient p = patient(patientId);
        p.setFullName(r.fullName());
        p.setAge(r.age());
        p.setGender(r.gender());
        p.setCity(r.city());
        p.setPhone(r.phone());
        Patient.HealthProfile h = new Patient.HealthProfile();
        h.bloodGroup = r.bloodGroup();
        h.height = r.height();
        h.weight = r.weight();
        h.smoking = r.smoking();
        h.alcoholConsumption = r.alcoholConsumption();
        h.sleepHours = r.sleepHours();
        h.stressLevel = r.stressLevel();
        p.setHealthProfile(h);
        p.setConditions(orEmpty(r.conditions()));
        p.setMedications(orEmpty(r.medications()));
        p.setAllergies(orEmpty(r.allergies()));
        p.setFamilyHistory(orEmpty(r.familyHistory()));
        p.touch();
        return patients.save(p);
    }

    private Patient patient(String id) {
        return patients.findById(id).orElseThrow(() -> new IllegalArgumentException("Patient not found"));
    }

    private static <T> List<T> orEmpty(List<T> values) {
        return values == null ? List.of() : values;
    }
}
