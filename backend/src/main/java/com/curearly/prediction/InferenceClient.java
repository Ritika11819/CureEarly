package com.curearly.prediction;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

/** Calls the private model-service network; it is never exposed to browsers. */
@Service
public class InferenceClient {
    private static final Logger log = LoggerFactory.getLogger(InferenceClient.class);
    private final RestClient client;
    private final boolean enabled;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

   public InferenceClient(
        RestClient.Builder builder,
        ObjectMapper objectMapper,
        @Value("${app.prediction.service-url:}") String serviceUrl) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .build();
        this.enabled = serviceUrl != null && !serviceUrl.isBlank();
        this.client = enabled ? builder.baseUrl(serviceUrl).build() : null;
        log.info("InferenceClient initialized. Enabled: {}, Target URL: {}", enabled, serviceUrl);
    }

    public Optional<Map<String, Object>> blood(
        Map<String, Object> measurements) {

    if (!enabled || measurements == null) {
        log.warn(
                "InferenceClient: blood prediction skipped (enabled={}, measurements={})",
                enabled,
                measurements != null
        );
        return Optional.empty();
    }

    try {
        String jsonBody = objectMapper.writeValueAsString(measurements);

        log.info("Sending blood JSON to FastAPI: {}", jsonBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8000/predict/blood"))
                .version(HttpClient.Version.HTTP_1_1)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response =
                httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString()
                );

        log.info(
                "FastAPI blood response: status={}, body={}",
                response.statusCode(),
                response.body()
        );

        if (response.statusCode() >= 200 &&
                response.statusCode() < 300) {

            Map<String, Object> result =
                    objectMapper.readValue(
                            response.body(),
                            new TypeReference<Map<String, Object>>() {}
                    );

            return Optional.of(result);
        }

        log.error(
                "FastAPI blood error: status={}, body={}",
                response.statusCode(),
                response.body()
        );

        return Optional.empty();

    } catch (Exception e) {

        log.error(
                "InferenceClient: blood prediction error: {}",
                e.getMessage(),
                e
        );

        return Optional.empty();
    }
}

    public Optional<Map<String, Object>> image(String gridFsId, String category) {
        if (!enabled || gridFsId == null) {
            log.warn("InferenceClient: image prediction skipped (enabled={}, gridFsId={})", enabled, gridFsId);
            return Optional.empty();
        }
        try {
            return Optional.ofNullable(
                    client.post()
                            .uri("/predict/image")
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(Map.of(
                                    "gridFsId", gridFsId,
                                    "category", category != null ? category : "MEDICAL_IMAGE"))
                            .retrieve()
                            .body(new ParameterizedTypeReference<Map<String, Object>>() {
                            }));
        } catch (RestClientException e) {
            log.error("InferenceClient: image prediction error: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }

    public Optional<Map<String, Object>> report(
        String gridFsId,
        String extractedText,
        String category) {

    if (!enabled) {
        log.warn("InferenceClient: report prediction skipped (service not enabled)");
        return Optional.empty();
    }

    try {
        Map<String, Object> requestBody = new HashMap<>();

        requestBody.put(
                "gridFsId",
                gridFsId != null ? gridFsId : ""
        );

        requestBody.put(
                "text",
                extractedText != null ? extractedText : ""
        );

        requestBody.put(
                "category",
                category != null ? category : "RADIOLOGY_REPORT"
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        log.info("Sending JSON to FastAPI: {}", jsonBody);

        String baseUrl = "http://localhost:8000";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/predict/report"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response =
                httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString()
                );

        log.info(
                "FastAPI response: status={}, body={}",
                response.statusCode(),
                response.body()
        );

        if (response.statusCode() >= 200 && response.statusCode() < 300) {

            Map<String, Object> result =
                    objectMapper.readValue(
                            response.body(),
                            new TypeReference<Map<String, Object>>() {}
                    );

            return Optional.of(result);
        }

        log.error(
                "FastAPI returned error: status={}, body={}",
                response.statusCode(),
                response.body()
        );

        return Optional.empty();

    } catch (Exception e) {

        log.error(
                "InferenceClient: report prediction error: {}",
                e.getMessage(),
                e
        );

        return Optional.empty();
    }
}
}