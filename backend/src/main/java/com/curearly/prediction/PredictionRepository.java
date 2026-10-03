package com.curearly.prediction;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface PredictionRepository extends MongoRepository<Prediction,String> { List<Prediction> findByPatientIdOrderByCreatedAtDesc(String patientId); }
