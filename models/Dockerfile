FROM python:3.11-slim
WORKDIR /service
COPY inference-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY inference-service/ .
COPY blood-report/artifacts/ /models/blood-report/artifacts/
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
