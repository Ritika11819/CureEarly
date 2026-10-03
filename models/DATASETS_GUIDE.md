# CureEarly ML & Deep Learning Datasets & Training Guide

This guide describes how the 3 ML/DL models are structured and how to train them on the public datasets provided in the CureEarly specification.

---

## Model 1: Blood Report -> Disease Prediction (Machine Learning)

- **Dataset**: UCI Breast Cancer Coimbra Dataset (`dataR2.csv` in `models/blood-report/data/`)
- **Features**: Age, BMI, Glucose, Insulin, HOMA-IR, Leptin, Adiponectin, Resistin, MCP-1
- **Target**: Clinical status (healthy vs. patient)
- **Algorithm**: Calibrated Random Forest Classifier with Median Imputation Pipeline (`scikit-learn`)
- **Trained Artifact**: `models/blood-report/artifacts/coimbra-rf-v1.joblib` (Already trained and packaged with the inference service!)

### To re-train or update:
```bash
cd models/blood-report
python train.py data/dataR2.csv --output artifacts/coimbra-rf-v1.joblib
```

---

## Model 2: PET/CT & Ultrasound Images -> Lesion Prediction (Deep Learning CNN)

- **Datasets**:
  - **Ultrasound**: BUSI (Breast Ultrasound Images - Zenodo: [zenodo.org/records/21128640](https://zenodo.org/records/21128640)) or BrEaST Dataset ([Nature Scientific Data](https://www.nature.com/articles/s41597-024-02984-z))
  - **PET/CT**: FDG-PET-CT-Lesions ([The Cancer Imaging Archive - TCIA](https://www.cancerimagingarchive.net/collection/fdg-pet-ct-lesions/))
- **Architecture**: Transfer learning with PyTorch `ResNet18` fine-tuned on medical imaging classes (`normal`, `benign`, `malignant`).
- **Data Folder Layout**:
  ```
  models/medical-image/data/
    ├── train/
    │    ├── normal/
    │    ├── benign/
    │    └── malignant/
    └── val/
         ├── normal/
         ├── benign/
         └── malignant/
  ```

### To train:
```bash
cd models/medical-image
python train.py data/ --output artifacts/busi-resnet18.pt
```

---

## Model 3: PET/CT & Sonography Reports -> Prediction & Risk (Clinical NLP Deep Learning)

- **Datasets**:
  - PETWB-REP (Whole-body PET/CT reports - Zenodo: [zenodo.org/records/18670487](https://zenodo.org/records/18670487) / [Nature](https://www.nature.com/articles/s41597-026-07058-w))
  - MIMIC-IV-Note & MIMIC-IV ([PhysioNet](https://physionet.org/content/mimic-iv-note/2.2/))
- **Architecture**: HuggingFace Transformers `distilbert-base-uncased` fine-tuned on clinical text sequences for radiological impression classification.
- **Input Format**: CSV with columns `text` (radiologist impression) and `label` (e.g. `BENIGN`, `SUSPICIOUS`, `MALIGNANT`).

### To train:
```bash
cd models/radiology-report
python train.py reports.csv --output artifacts/report-bert
```
