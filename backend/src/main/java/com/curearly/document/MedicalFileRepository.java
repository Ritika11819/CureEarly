package com.curearly.document;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MedicalFileRepository extends MongoRepository<MedicalFile, String> {
    List<MedicalFile> findByPatientIdOrderByUploadedAtDesc(String patientId);
}
