"""Fine-tune a report classifier from a clinician-labelled CSV with text,label columns."""
import argparse
from datasets import Dataset
import pandas as pd
from transformers import AutoModelForSequenceClassification, AutoTokenizer, TrainingArguments, Trainer

parser=argparse.ArgumentParser(); parser.add_argument("csv"); parser.add_argument("--output",default="artifacts/report-bert"); args=parser.parse_args()
frame=pd.read_csv(args.csv).dropna(subset=["text","label"]); labels=sorted(frame.label.unique()); label_map={v:i for i,v in enumerate(labels)}; frame["labels"]=frame.label.map(label_map)
tokenizer=AutoTokenizer.from_pretrained("distilbert-base-uncased")
dataset=Dataset.from_pandas(frame[["text","labels"]]).map(lambda x: tokenizer(x["text"],truncation=True,max_length=512),batched=True)
model=AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased",num_labels=len(labels)); Trainer(model=model,args=TrainingArguments(output_dir=args.output,num_train_epochs=3,per_device_train_batch_size=8,save_strategy="no"),train_dataset=dataset,processing_class=tokenizer).train(); model.save_pretrained(args.output); tokenizer.save_pretrained(args.output); open(f"{args.output}/labels.txt","w").write("\n".join(labels))
