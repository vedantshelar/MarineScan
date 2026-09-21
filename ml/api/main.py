from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
from PIL import Image
import io
import os

app = FastAPI(title="MarineScan AI API")

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "best.pt"
)

model = YOLO(MODEL_PATH)


@app.get("/")
def home():
    return {
        "message": "MarineScan AI API is running"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image_bytes = await file.read()

    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    results = model(image)

    detections = []

    for result in results:

        for box in result.boxes:

            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            class_name = model.names[class_id]

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "class": class_name,
                "confidence": round(confidence, 3),
                "box": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2)
                }
            })

    return {
        "filename": file.filename,
        "detections": detections
    }