package com.curearly.prediction;

import java.time.Instant;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("predictions")
public class Prediction {
    @Id
    private String id;
    private String patientId;
    private String sourceFileId;
    private String analysisType;
    private String status = "PENDING";
    private String result;
    private Double confidence;
    private String urgency;
    private String modelName;
    private Map<String, Object> findings;
    private Map<String, Object> input;
    private Instant createdAt = Instant.now();

    public String getId() { return id; }
    public String getPatientId() { return patientId; }
    public void setPatientId(String v) { patientId = v; }
    public String getSourceFileId() { return sourceFileId; }
    public void setSourceFileId(String v) { sourceFileId = v; }
    public String getAnalysisType() { return analysisType; }
    public void setAnalysisType(String v) { analysisType = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public String getResult() { return result; }
    public void setResult(String v) { result = v; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double v) { confidence = v; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String v) { urgency = v; }
    public String getModelName() { return modelName; }
    public void setModelName(String v) { modelName = v; }
    public Map<String, Object> getFindings() { return findings; }
    public void setFindings(Map<String, Object> v) { findings = v; }
    public Map<String, Object> getInput() { return input; }
    public void setInput(Map<String, Object> v) { input = v; }
    public Instant getCreatedAt() { return createdAt; }
}
