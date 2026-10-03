package com.curearly.common;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException e) { String message=e.getBindingResult().getFieldErrors().stream().findFirst().map(x -> x.getField()+": "+x.getDefaultMessage()).orElse("Invalid request"); return ResponseEntity.badRequest().body(Map.of("message",message)); }
    @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<?> notFound(IllegalArgumentException e) { return ResponseEntity.status(404).body(Map.of("message",e.getMessage())); }
    @ExceptionHandler(HttpMessageNotReadableException.class) ResponseEntity<?> malformedJson() { return ResponseEntity.badRequest().body(Map.of("message","One or more profile values are in an invalid format.")); }
}
