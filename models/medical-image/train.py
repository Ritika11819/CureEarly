"""BUSI transfer-learning training entrypoint. Directory layout: data/{train,val}/{normal,benign,malignant}."""
import argparse
from pathlib import Path
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

parser=argparse.ArgumentParser(); parser.add_argument("data"); parser.add_argument("--output",default="artifacts/busi-resnet18.pt"); args=parser.parse_args()
transform=transforms.Compose([transforms.Resize((224,224)),transforms.ToTensor(),transforms.Normalize([.485,.456,.406],[.229,.224,.225])])
train=datasets.ImageFolder(Path(args.data)/"train",transform); valid=datasets.ImageFolder(Path(args.data)/"val",transform)
model=models.resnet18(weights=models.ResNet18_Weights.DEFAULT); model.fc=nn.Linear(model.fc.in_features,len(train.classes)); device="cuda" if torch.cuda.is_available() else "cpu"; model.to(device)
optimizer=torch.optim.AdamW(model.parameters(),lr=1e-4); loss_fn=nn.CrossEntropyLoss()
for _ in range(8):
    model.train()
    for x,y in DataLoader(train,batch_size=16,shuffle=True): optimizer.zero_grad(); loss_fn(model(x.to(device)),y.to(device)).backward(); optimizer.step()
model.eval(); correct=total=0
with torch.no_grad():
    for x,y in DataLoader(valid,batch_size=32): correct+=(model(x.to(device)).argmax(1).cpu()==y).sum().item(); total+=len(y)
Path(args.output).parent.mkdir(parents=True,exist_ok=True); torch.save({"state_dict":model.state_dict(),"classes":train.classes,"validation_accuracy":correct/total},args.output); print(f"validation_accuracy={correct/total:.3f}")
