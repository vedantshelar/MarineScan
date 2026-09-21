const mongoose = require("mongoose");

const detectionSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true
        },

        detections: [
            {
                class: {
                    type: String,
                    required: true
                },

                confidence: {
                    type: Number,
                    required: true
                },

                box: {
                    x1: Number,
                    y1: Number,
                    x2: Number,
                    y2: Number
                }
            }
        ],

        location: {
            latitude: Number,
            longitude: Number,
            depth: Number
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Detection", detectionSchema);