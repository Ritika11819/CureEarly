"""Train the first Curearly baseline using the UCI Breast Cancer Coimbra CSV.
Expected target column: Classification (1=healthy, 2=patient). This is research-only.
"""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
import joblib
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

parser = argparse.ArgumentParser();
parser.add_argument("csv");
parser.add_argument("--output", default="artifacts/blood-model.joblib");
parser.add_argument("--metrics-output");
args = parser.parse_args()
data = pd.read_csv(args.csv);
target = "Classification"
if target not in data: raise ValueError("CSV must contain Classification")
X = data.drop(columns=[target]); y = (data[target].astype(int) == 2).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=.2, stratify=y, random_state=42)
model = Pipeline([("impute", SimpleImputer(strategy="median")), ("classifier", CalibratedClassifierCV(RandomForestClassifier(n_estimators=400, min_samples_leaf=3, class_weight="balanced", random_state=42), method="sigmoid", cv=5))])
model.fit(X_train, y_train); probability = model.predict_proba(X_test)[:, 1]
Path(args.output).parent.mkdir(parents=True, exist_ok=True)
joblib.dump({"model": model, "features": list(X.columns), "label": "breast-cancer-presence"}, args.output)
metrics = {
    "model": "calibrated-random-forest", "dataset": "UCI Breast Cancer Coimbra (id=451)",
    "trainedAt": datetime.now(timezone.utc).isoformat(), "randomState": 42,
    "rows": len(data), "trainRows": len(X_train), "testRows": len(X_test), "features": list(X.columns),
    "positiveClass": "patient", "negativeClass": "healthy-control", "testAuc": roc_auc_score(y_test, probability),
    "classificationReport": classification_report(y_test, probability >= .5, output_dict=True),
    "limitations": ["Small, single-dataset research baseline (116 participants).", "Not clinically validated or approved for diagnosis.", "Only accepts the exact training feature schema and units."],
}
metrics_path = Path(args.metrics_output) if args.metrics_output else Path(args.output).with_suffix(".metrics.json")
metrics_path.write_text(json.dumps(metrics, indent=2))
print(json.dumps(metrics, indent=2))
