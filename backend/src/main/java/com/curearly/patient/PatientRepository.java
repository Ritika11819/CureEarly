package com.curearly.patient;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface PatientRepository extends MongoRepository<Patient, String> { Optional<Patient> findByEmail(String email); Optional<Patient> findByGoogleSubject(String googleSubject); }
