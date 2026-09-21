require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const connectDB = require("./config/db");
const Detection = require("./models/Detection");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Multer - store uploaded image in memory
const upload = multer({
    storage: multer.memoryStorage()
});

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "MarineScan Node Backend is running"
    });
});

// ==========================================
// GET ALL DETECTIONS
// ==========================================

app.get("/api/detections", async (req, res) => {

    try {

        const detections = await Detection
            .find()
            .sort({ createdAt: -1 });

        res.json(detections);

    } catch (error) {

        console.error(
            "Error fetching detections:",
            error.message
        );

        res.status(500).json({
            error: "Failed to fetch detections"
        });
    }
});

// ==========================================
// AI DETECTION
// ==========================================

app.post(
    "/api/detect",
    upload.single("image"),
    async (req, res) => {

        try {

            // Check image
            if (!req.file) {

                return res.status(400).json({
                    error: "No image uploaded"
                });
            }

            // Check ML API URL
            if (!process.env.ML_API_URL) {

                console.error(
                    "ML_API_URL environment variable is missing"
                );

                return res.status(500).json({
                    error: "ML API URL is not configured"
                });
            }

            console.log(
                `Sending ${req.file.originalname} to ML API`
            );

            // Create multipart form
            const form = new FormData();

            form.append(
                "file",
                req.file.buffer,
                {
                    filename: req.file.originalname,
                    contentType: req.file.mimetype
                }
            );

            // ==========================================
            // SEND IMAGE TO FASTAPI / YOLO
            // ==========================================

            const response = await axios.post(
                `${process.env.ML_API_URL}/predict`,
                form,
                {
                    headers: {
                        ...form.getHeaders()
                    },

                    // 2 minute timeout
                    timeout: 120000
                }
            );

            // YOLO result
            const aiResult = response.data;

            console.log(
                "AI detection completed"
            );

            // ==========================================
            // SAVE RESULT TO MONGODB
            // ==========================================

            const savedDetection = await Detection.create({

                filename: aiResult.filename,

                detections: aiResult.detections

            });

            console.log(
                `Detection saved with ID: ${savedDetection._id}`
            );

            // ==========================================
            // SEND RESULT TO FRONTEND
            // ==========================================

            res.json({

                message:
                    "Detection completed and saved",

                id:
                    savedDetection._id,

                filename:
                    savedDetection.filename,

                detections:
                    savedDetection.detections

            });

        } catch (error) {

            console.error(
                "Detection error:",
                error.message
            );

            // Axios timeout
            if (error.code === "ECONNABORTED") {

                return res.status(504).json({

                    error:
                        "AI service timed out"

                });
            }

            // ML API returned an error
            if (error.response) {

                console.error(
                    "ML API response:",
                    error.response.data
                );

                return res.status(
                    error.response.status
                ).json({

                    error:
                        "ML API returned an error",

                    details:
                        error.response.data

                });
            }

            // Other errors
            res.status(500).json({

                error:
                    "Detection failed",

                details:
                    error.message

            });
        }
    }
);

// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 5001;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `MarineScan backend running on port ${PORT}`
        );

        console.log(
            `ML API URL: ${
                process.env.ML_API_URL || "Not configured"
            }`
        );
    }
);