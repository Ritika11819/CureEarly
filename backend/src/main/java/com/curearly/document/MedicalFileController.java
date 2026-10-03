package com.curearly.document;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import java.io.IOException;
import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class MedicalFileController {
    private final GridFSBucket gridfs;
    private final MedicalFileRepository files;

    public MedicalFileController(GridFSBucket gridfs, MedicalFileRepository files) {
        this.gridfs = gridfs;
        this.files = files;
    }

    @GetMapping
    public List<MedicalFile> list(@AuthenticationPrincipal String patientId) {
        return files.findByPatientIdOrderByUploadedAtDesc(patientId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@AuthenticationPrincipal String patientId, @RequestParam String category,
            @RequestPart MultipartFile file) throws IOException {
        if (!List.of("BLOOD_REPORT", "PET_CT_IMAGE", "SONOGRAPHY_IMAGE", "PET_CT_REPORT", "SONOGRAPHY_REPORT")
                .contains(category))
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Unsupported file category"));
        String type = file.getContentType();
        if (type == null || !(type.equals("application/pdf") || type.startsWith("image/")))
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "Only PDF and image uploads are permitted."));
        ObjectId gridId = gridfs.uploadFromStream(file.getOriginalFilename(), file.getInputStream(),
                new GridFSUploadOptions().metadata(new org.bson.Document("patientId", patientId)
                        .append("category", category).append("contentType", type)));
        MedicalFile record = new MedicalFile();
        record.setPatientId(patientId);
        record.setGridFsId(gridId.toHexString());
        record.setOriginalFilename(file.getOriginalFilename());
        record.setContentType(type);
        record.setSize(file.getSize());
        record.setCategory(category);
        return ResponseEntity.status(201).body(files.save(record));
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<InputStreamResource> download(@AuthenticationPrincipal String patientId,
            @PathVariable String id) throws IOException {
        MedicalFile f = files.findById(id).filter(x -> x.getPatientId().equals(patientId))
                .orElseThrow(() -> new IllegalArgumentException("File not found"));
        var stream = gridfs.openDownloadStream(new ObjectId(f.getGridFsId()));
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(f.getContentType())).contentLength(f.getSize())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + f.getOriginalFilename().replace("\"", "") + "\"")
                .body(new InputStreamResource(stream));
    }
}
