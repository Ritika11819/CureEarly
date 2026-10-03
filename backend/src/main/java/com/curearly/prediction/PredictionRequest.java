package com.curearly.prediction;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
public record PredictionRequest(@NotBlank String analysisType, String sourceFileId, Map<String,Object> measurements) { }
