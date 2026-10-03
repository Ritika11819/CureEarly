package com.curearly.patient;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Document("patients")
public class Patient {
    @Id private String id;
    @Indexed(unique = true) private String email;
    private String passwordHash;
    private String authProvider = "LOCAL";
    private String googleSubject;
    private String fullName;
    private String phone;
    private Integer age;
    private String gender;
    private String city;
    private HealthProfile healthProfile = new HealthProfile();
    private List<Condition> conditions = new ArrayList<>();
    private List<Medication> medications = new ArrayList<>();
    private List<Allergy> allergies = new ArrayList<>();
    private List<FamilyHistory> familyHistory = new ArrayList<>();
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public static class HealthProfile { public String bloodGroup; public Double height; public Double weight; public Boolean smoking; public Boolean alcoholConsumption; public Integer sleepHours; public Integer stressLevel; }
    public static class Condition { public String name; public LocalDate diagnosedDate; public String status = "ACTIVE"; }
    public static class Medication { public String name; public String dosage; public String frequency; }
    public static class Allergy { public String name; public String seriousness; }
    public static class FamilyHistory { public String diseaseName; public String relation; }
    public String getId() { return id; } public String getEmail() { return email; } public void setEmail(String email) { this.email = email == null ? null : email.toLowerCase(); }
    @JsonIgnore public String getPasswordHash() { return passwordHash; } public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getAuthProvider() { return authProvider; } public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }
    @JsonIgnore public String getGoogleSubject() { return googleSubject; } public void setGoogleSubject(String googleSubject) { this.googleSubject = googleSubject; }
    public String getFullName() { return fullName; } public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; } public void setPhone(String phone) { this.phone = phone; }
    public Integer getAge() { return age; } public void setAge(Integer age) { this.age = age; }
    public String getGender() { return gender; } public void setGender(String gender) { this.gender = gender; }
    public String getCity() { return city; } public void setCity(String city) { this.city = city; }
    public HealthProfile getHealthProfile() { return healthProfile; } public void setHealthProfile(HealthProfile healthProfile) { this.healthProfile = healthProfile; }
    public List<Condition> getConditions() { return conditions; } public void setConditions(List<Condition> conditions) { this.conditions = conditions; }
    public List<Medication> getMedications() { return medications; } public void setMedications(List<Medication> medications) { this.medications = medications; }
    public List<Allergy> getAllergies() { return allergies; } public void setAllergies(List<Allergy> allergies) { this.allergies = allergies; }
    public List<FamilyHistory> getFamilyHistory() { return familyHistory; } public void setFamilyHistory(List<FamilyHistory> familyHistory) { this.familyHistory = familyHistory; }
    public Instant getCreatedAt() { return createdAt; } public Instant getUpdatedAt() { return updatedAt; } public void touch() { updatedAt = Instant.now(); }
}
