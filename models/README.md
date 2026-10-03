# Curearly model workspace

These are three independently trainable models, intentionally separated from the Spring Boot API. The API owns identity, consent, authorization, GridFS storage, and audit records; a model service must never be publicly reachable or receive a user identifier.

| Model | Dataset starting point | Method | Output |
|---|---|---|---|
| `blood-report` | Breast Cancer Coimbra | calibrated Random Forest | healthy / finding-present probability |
| `medical-image` | BUSI | transfer-learning image classifier | normal / benign / malignant probability |
| `radiology-report` | PETWB-REP | transformer text classifier | labels defined by a clinician-reviewed task schema |

## Important

Do not treat these preliminary models as diagnostic devices. Dataset labels, split strategy, demographics, calibration, clinical validation, bias review, and human oversight must be approved before any clinical use. MIMIC data needs credentialed access; do not automate downloading it.

Each model needs a locked dataset version and a held-out patient-level test set. Store model artifacts outside the Git repository and record dataset license, checksum, preprocessing version, and metrics with every artifact.
