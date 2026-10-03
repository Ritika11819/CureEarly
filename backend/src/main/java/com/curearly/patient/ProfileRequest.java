package com.curearly.patient;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
public record ProfileRequest(@NotBlank String fullName, @NotNull @Min(1) @Max(120) Integer age, @NotBlank String gender, String city, @NotBlank String phone,
    String bloodGroup, Double height, Double weight, Boolean smoking, Boolean alcoholConsumption, @Min(0) @Max(24) Integer sleepHours, @Min(1) @Max(5) Integer stressLevel,
    List<Patient.Condition> conditions, List<Patient.Medication> medications, List<Patient.Allergy> allergies, List<Patient.FamilyHistory> familyHistory) { }
