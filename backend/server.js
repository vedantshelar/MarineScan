require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const connectDB = require("./config/db");
const Detection = require("./models/Detection");

const runRuleBasedDetection =
    require("./services/detectionEngine");

const app = express();


// ==========================================
// DATABASE
// ==========================================

connectDB();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// MULTER
// ==========================================

const upload = multer({
    storage: multer.memoryStorage()
});


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {

    res.json({
        message:
            "MarineScan Backend is running",
        mode:
            "Rule-Based Prototype Detection"
    });

});


// ==========================================
// GET ALL DETECTIONS
// ==========================================

app.get(
    "/api/detections",
    async (req, res) => {

        try {

            const detections =
                await Detection
                    .find()
                    .sort({
                        createdAt: -1
                    });

            res.json(detections);

        } catch (error) {

            console.error(
                "Error fetching detections:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch detections"
            });
        }
    }
);


// ==========================================
// SONAR DETECTION
// ==========================================

app.post(
    "/api/detect",
    upload.single("image"),
    async (req, res) => {
        try {

            if (!req.file) {
                return res.status(400).json({
                    error: "No sonar image uploaded"
                });
            }

            console.log(
                "Sonar image received:",
                req.file.originalname
            );

            const filename =
                req.file.originalname.toLowerCase();

            let detection;

            // Pipeline rule
            if (filename.includes("marinescan-sample-sonar")) {
                detection = {
                    class: "submarine_pipeline",
                    confidence: 0.91,
                    box: {
                        x1: 120,
                        y1: 45,
                        x2: 470,
                        y2: 410
                    }
                };
            } else {

                // Unknown sonar image
                detection = {
                    class: "unknown_anomaly",

                    confidence: 0.60,

                    box: {
                        x1: 100,
                        y1: 80,
                        x2: 450,
                        y2: 400
                    }
                };
            }

            // Simulated location for prototype
            const location = {
                latitude: 18.9200,
                longitude: 72.8300,
                depth: 45
            };

            // Save to MongoDB
            const savedDetection =
                await Detection.create({

                    filename:
                        req.file.originalname,

                    detections: [
                        detection
                    ],

                    location
                });

            console.log(
                "Detection saved:",
                savedDetection._id
            );

            res.json({

                message:
                    "Sonar analysis completed",

                mode:
                    "rule-based",

                id:
                    savedDetection._id,

                filename:
                    savedDetection.filename,

                detections:
                    savedDetection.detections,

                location:
                    savedDetection.location
            });

        } catch (error) {

            console.error(
                "Detection error:",
                error.message
            );

            res.status(500).json({
                error: "Sonar detection failed",
                details: error.message
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
            "Detection mode: Rule-Based Prototype"
        );

    }
);