from ultralytics import YOLO

model = YOLO("yolov8s.pt")

model.train(
    data="data/splits/drishti.yaml",
    epochs=1,
    imgsz=640,
    batch=4,
    device="mps"
)