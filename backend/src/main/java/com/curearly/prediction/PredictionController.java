package com.curearly.prediction;

import com.curearly.document.MedicalFile;
import com.curearly.document.MedicalFileRepository;
import com.mongodb.client.gridfs.GridFSBucket;
import jakarta.validation.Valid;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {
    private static final Logger log = LoggerFactory.getLogger(PredictionController.class);

    private final PredictionRepository predictions;
    private final MedicalFileRepository files;
    private final InferenceClient inference;
    private final GridFSBucket gridfs;

    public PredictionController(
            PredictionRepository predictions,
            MedicalFileRepository files,
            InferenceClient inference,
            GridFSBucket gridfs) {
        this.predictions = predictions;
        this.files = files;
        this.inference = inference;
        this.gridfs = gridfs;
    }

    @GetMapping
    public List<Prediction> list(@AuthenticationPrincipal String patientId) {
        return predictions.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @PostMapping
    public ResponseEntity<?> request(
            @AuthenticationPrincipal String patientId,
            @Valid @RequestBody PredictionRequest r) {

        if (!List.of("BLOOD_REPORT", "MEDICAL_IMAGE", "RADIOLOGY_REPORT").contains(r.analysisType())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unsupported analysis type: " + r.analysisType()));
        }

        MedicalFile fileRecord = null;
        if (r.sourceFileId() != null) {
            fileRecord = files.findById(r.sourceFileId())
                    .filter(f -> f.getPatientId().equals(patientId))
                    .orElseThrow(() -> new IllegalArgumentException("Source file not found"));
        }

        Prediction p = new Prediction();
        p.setPatientId(patientId);
        p.setSourceFileId(r.sourceFileId());
        p.setAnalysisType(r.analysisType());
        // Sanitize map keys: MongoDB does not allow dots in keys (e.g. "MCP.1" → "MCP_1")
        if (r.measurements() != null) {
            java.util.Map<String, Object> sanitized = new java.util.LinkedHashMap<>();
            r.measurements().forEach((k, v) -> sanitized.put(k.replace('.', '_'), v));
            p.setInput(sanitized);
        }
        p = predictions.save(p);

        try {
            Optional<Map<String, Object>> output = Optional.empty();

            if ("BLOOD_REPORT".equals(r.analysisType())) {
                output = inference.blood(r.measurements());
            } else if ("MEDICAL_IMAGE".equals(r.analysisType())) {
                String gridFsId = fileRecord != null ? fileRecord.getGridFsId() : null;
                String category = fileRecord != null ? fileRecord.getCategory() : "MEDICAL_IMAGE";
                output = inference.image(gridFsId, category);
            } else if ("RADIOLOGY_REPORT".equals(r.analysisType())) {
                String gridFsId = fileRecord != null ? fileRecord.getGridFsId() : null;
                String extractedPdfText = "";
                if (gridFsId != null) {
                    extractedPdfText = extractPdfText(gridFsId);
                }
                String symptoms = r.measurements() != null ? String.valueOf(r.measurements().getOrDefault("symptoms", "")).trim() : "";
                String reportText = extractedPdfText;
                if (!symptoms.isEmpty()) {
                    reportText = (reportText.isEmpty() ? "" : reportText + "\n\nClinical Notes / Symptoms:\n") + symptoms;
                }
                String category = fileRecord != null ? fileRecord.getCategory() : "RADIOLOGY_REPORT";
                output = inference.report(gridFsId, reportText, category);
            }

            if (output.isPresent()) {
                var result = output.get();
                String status = (String) result.getOrDefault("status", "COMPLETED");
                p.setStatus(status);
                p.setResult((String) result.get("result"));
                Object conf = result.get("confidence");
                if (conf instanceof Number n) {
                    p.setConfidence(n.doubleValue());
                } else {
                    p.setConfidence(null);
                }
                p.setUrgency((String) result.getOrDefault("urgency", "UNKNOWN"));
                p.setModelName((String) result.get("model"));
                if (result.get("findings") instanceof Map<?, ?> m) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> findingsMap = (Map<String, Object>) m;
                    p.setFindings(findingsMap);
                }
                p = predictions.save(p);
            } else {
                log.warn("Inference service returned no output for analysisType: {}. Setting status to ANALYSIS_UNAVAILABLE.", r.analysisType());
                p.setStatus("ANALYSIS_UNAVAILABLE");
                p.setResult("Analysis service was unable to evaluate this request. Ensure model service is running with appropriate artifacts.");
                p.setConfidence(null);
                p.setUrgency("UNKNOWN");
                p.setModelName(null);
                p = predictions.save(p);
            }
        } catch (Exception e) {
            log.error("Exception processing prediction request for patient {}: {}", patientId, e.getMessage(), e);
            p.setStatus("ANALYSIS_UNAVAILABLE");
            p.setResult("Analysis processing failed: " + e.getMessage());
            p.setConfidence(null);
            p.setUrgency("UNKNOWN");
            p.setModelName(null);
            p = predictions.save(p);
        }

        return ResponseEntity.accepted().body(p);
    }

    /** Extracts text from PDF bytes stored in GridFS using Apache PDFBox. */
    private String extractPdfText(String gridFsId) {
        if (gridFsId == null || gridFsId.isBlank()) return "";
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            gridfs.downloadToStream(new ObjectId(gridFsId), baos);
            byte[] bytes = baos.toByteArray();
            if (bytes.length == 0) {
                log.warn("GridFS file {} is empty (0 bytes)", gridFsId);
                return "";
            }
            try (PDDocument doc = Loader.loadPDF(bytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(doc);
                log.info("PDFBox extracted {} characters from GridFS PDF {}", text.length(), gridFsId);
                return text;
            }
        } catch (Exception e) {
            log.error("Error extracting text with PDFBox from GridFS file {}: {}", gridFsId, e.getMessage());
            return "";
        }
    }
}
