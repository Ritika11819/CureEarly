package com.curearly.document;
import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document("medical_files")
public class MedicalFile {
    @Id private String id; private String patientId; private String gridFsId; private String originalFilename; private String contentType; private long size; private String category; private Instant uploadedAt=Instant.now();
    public String getId(){return id;} public String getPatientId(){return patientId;} public void setPatientId(String v){patientId=v;} public String getGridFsId(){return gridFsId;} public void setGridFsId(String v){gridFsId=v;} public String getOriginalFilename(){return originalFilename;} public void setOriginalFilename(String v){originalFilename=v;} public String getContentType(){return contentType;} public void setContentType(String v){contentType=v;} public long getSize(){return size;} public void setSize(long v){size=v;} public String getCategory(){return category;} public void setCategory(String v){category=v;} public Instant getUploadedAt(){return uploadedAt;}
}
