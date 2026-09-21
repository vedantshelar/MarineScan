require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const connectDB = require("./config/db");
const Detection = require("./models/Detection");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "MarineScan Node Backend is running"
    });
});

// Get all saved detections
app.get("/api/detections", async (req, res) => {

    try {

        const detections = await Detection
            .find()
            .sort({ createdAt: -1 });

        res.json(detections);

    } catch (error) {

        console.error("Error fetching detections:", error);

        res.status(500).json({
            error: "Failed to fetch detections"
        });
    }
});

// Send sonar image to Python AI service
app.post("/api/detect", upload.single("image"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                error: "No image uploaded"
            });
        }

        // Create form data
        const form = new FormData();

        form.append(
            "file",
            req.file.buffer,
            {
                filename: req.file.originalname,
                contentType: req.file.mimetype
            }
        );

        // Send image to FastAPI
        const response = await axios.post(
            "http://127.0.0.1:8000/predict",
            form,
            {
                headers: {
                    ...form.getHeaders()
                }
            }
        );

        // YOLO result
        const aiResult = response.data;

        // Save result to MongoDB
        const savedDetection = await Detection.create({
            filename: aiResult.filename,
            detections: aiResult.detections
        });

        // Send response back to frontend
        res.json({
            message: "Detection completed and saved",
            id: savedDetection._id,
            filename: savedDetection.filename,
            detections: savedDetection.detections
        });

    } catch (error) {

        console.error("Detection error:", error);

        res.status(500).json({
            error: "Detection failed"
        });
    }
});

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`MarineScan backend running on http://localhost:${PORT}`);
});