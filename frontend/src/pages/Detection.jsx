import { useRef, useState } from "react";
import {
  Upload,
  ScanSearch,
  RotateCcw,
  CheckCircle2,
  Target,
  Cpu,
  Database,
  Zap,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function Detection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [dragging, setDragging] = useState(false);

  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  const downloadSampleSonar = () => {
    const link = document.createElement("a");
  
    link.href = "/sample-sonar.jpg";
    link.download = "MarineScan-Sample-Sonar.jpg";
  
    document.body.appendChild(link);
  
    link.click();
  
    document.body.removeChild(link);
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const runDetection = async () => {
    if (!file) return;

    try {
      setScanning(true);
      setResult(null);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/api/detect`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Detection failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
      alert(
        "Detection failed. Make sure Node and FastAPI are running."
      );
    } finally {
      setScanning(false);
    }
  };

  const resetScan = () => {
    setFile(null);
    setPreview(null);
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.8) return "confidence-high";
    if (confidence >= 0.5) return "confidence-medium";
    return "confidence-low";
  };

  return (
    <div className="detection-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <div className="eyebrow">
            <ScanSearch size={13} />
            AI COMPUTER VISION
          </div>

          <h1>Sonar Detection</h1>

          <p>
            Analyze side-scan sonar imagery using the
            MarineScan YOLO detection model.
          </p>
        </div>

        {result && (
          <button
            className="refresh-btn"
            onClick={resetScan}
          >
            <RotateCcw size={14} />
            New Scan
          </button>
        )}
      </div>

      <div className="detection-layout">

        {/* LEFT SIDE */}

        <div className="detection-main">

        <button
  type="button"
  onClick={downloadSampleSonar}
  style={{
    marginBottom:"10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "10px 16px",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    background: "#fff7ed",
    color: "#ea580c",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  ↓ Download Sample Sonar
</button>

          {!preview ? (
            <div
              className={`upload-zone ${
                dragging ? "dragging" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  handleFile(e.target.files[0])
                }
              />
              

              <div className="upload-icon">
                <Upload size={25} />
              </div>

              <h2>
                Upload Side-Scan Sonar Image
              </h2>

              <p>
                Drag & drop a sonar image here or
                click to browse
              </p>

              <span>
                JPG, JPEG or PNG
              </span>

            </div>
          ) : (

            <div className="sonar-card">

              <div className="sonar-card-header">

                <div>
                  <span>SONAR INPUT</span>

                  <strong>
                    {file?.name}
                  </strong>
                </div>

                <div className="image-status">
                  {result ? (
                    <>
                      <CheckCircle2 size={13} />
                      Analysis Complete
                    </>
                  ) : (
                    <>
                      <Zap size={13} />
                      Ready
                    </>
                  )}
                </div>

              </div>

              {/* IMAGE + BOUNDING BOXES */}

              <div className="sonar-viewer">

<div className="sonar-stage">

  <img
    ref={imageRef}
    src={preview}
    alt="Sonar"
    className="sonar-image"
  />

  {result?.detections?.map((detection, index) => (
    <BoundingBox
      key={index}
      detection={detection}
      imageRef={imageRef}
      index={index}
    />
  ))}

</div>

{scanning && (
  <div className="scan-overlay">

    <div className="scan-line" />

    <div className="scan-status">
      <ScanSearch size={15} />
      AI ANALYZING SONAR DATA...
    </div>

  </div>
)}

</div>

              {/* ACTION */}

              <div className="sonar-actions">

                {!result ? (
                  <button
                    className="primary-action"
                    onClick={runDetection}
                    disabled={scanning}
                  >
                    {scanning ? (
                      <>
                        <ScanSearch
                          size={16}
                          className="spin"
                        />
                        Running AI Detection...
                      </>
                    ) : (
                      <>
                        <ScanSearch size={16} />
                        Run AI Detection
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="secondary-action"
                    onClick={resetScan}
                  >
                    <RotateCcw size={15} />
                    Analyze Another Image
                  </button>
                )}

              </div>

            </div>
          )}

          {/* RESULTS */}

          {result && (
            <DetectionResults
              detections={result.detections || []}
            />
          )}

        </div>

        {/* RIGHT SIDE */}

        <div className="detection-sidebar">

          <div className="ai-model-card">

            <div className="ai-card-top">

              <div className="ai-model-icon">
                <Cpu size={18} />
              </div>

              <div>
                <span>ACTIVE MODEL</span>
                <strong>MarineScan YOLO</strong>
              </div>

            </div>

            <div className="model-info">

              <div>
                <span>Architecture</span>
                <strong>YOLOv8s</strong>
              </div>

              <div>
                <span>Framework</span>
                <strong>PyTorch</strong>
              </div>

              <div>
                <span>Input</span>
                <strong>640 × 640</strong>
              </div>

            </div>

            <div className="model-status">
              <span />
              Model online
            </div>

          </div>

          {/* PIPELINE */}

          <div className="pipeline-card">

            <div className="side-card-title">
              Detection Pipeline
            </div>

            <PipelineStep
              number="01"
              title="Image Upload"
              icon={<Upload size={14} />}
              active={!!file}
            />

            <PipelineStep
              number="02"
              title="Preprocessing"
              icon={<Zap size={14} />}
              active={scanning || !!result}
            />

            <PipelineStep
              number="03"
              title="YOLO Detection"
              icon={<Target size={14} />}
              active={!!result}
            />

            <PipelineStep
              number="04"
              title="MongoDB Storage"
              icon={<Database size={14} />}
              active={!!result}
            />

          </div>

          {/* CLASSES */}

          <div className="classes-card">

            <div className="side-card-title">
              Detectable Objects
            </div>

            <ObjectClass name="Ghost Net" />
            <ObjectClass name="Shipwreck" />
            <ObjectClass name="Submarine Pipeline" />
            <ObjectClass name="Mine Cylinder" />

          </div>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   BOUNDING BOX
===================================== */

function BoundingBox({
  detection,
  imageRef,
  index,
}) {
  if (!imageRef.current) return null;

  const image = imageRef.current;

  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;

  if (!naturalWidth || !naturalHeight) {
    return null;
  }

  const box = detection.box;

  const left =
    (box.x1 / naturalWidth) * 100;

  const top =
    (box.y1 / naturalHeight) * 100;

  const width =
    ((box.x2 - box.x1) / naturalWidth) * 100;

  const height =
    ((box.y2 - box.y1) / naturalHeight) * 100;

  return (
    <div
      className="detection-box"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
    >

      <div className="box-label">
        <span>
          {detection.class.replaceAll("_", " ")}
        </span>

        <strong>
          {(detection.confidence * 100).toFixed(0)}%
        </strong>
      </div>

      <div className="box-corner top-left" />
      <div className="box-corner top-right" />
      <div className="box-corner bottom-left" />
      <div className="box-corner bottom-right" />

    </div>
  );
}


/* =====================================
   RESULTS
===================================== */

function DetectionResults({ detections }) {
  const total = detections.length;

  const highest =
    total > 0
      ? Math.max(
          ...detections.map(
            (d) => d.confidence
          )
        )
      : 0;

  return (
    <div className="results-card">

      <div className="results-header">

        <div>
          <div className="eyebrow">
            <Target size={12} />
            AI RESULTS
          </div>

          <h2>Detection Results</h2>
        </div>

        <div className="result-count">
          {total} objects
        </div>

      </div>

      <div className="result-summary">

        <div>
          <span>Objects detected</span>
          <strong>{total}</strong>
        </div>

        <div>
          <span>Highest confidence</span>
          <strong>
            {(highest * 100).toFixed(1)}%
          </strong>
        </div>

        <div>
          <span>Processing</span>
          <strong>Complete</strong>
        </div>

      </div>

      <div className="result-list">

        {detections.map((detection, index) => {

          const confidence =
            detection.confidence * 100;

          return (
            <div
              className="result-row"
              key={index}
            >

              <div className="result-index">
                #{String(index + 1).padStart(2, "0")}
              </div>

              <div className="result-object">

                <strong>
                  {detection.class.replaceAll(
                    "_",
                    " "
                  )}
                </strong>

                <span>
                  Bounding box detected
                </span>

              </div>

              <div className="result-confidence">

                <div className="result-progress">
                  <div
                    className={getConfidenceClass(
                      detection.confidence
                    )}
                    style={{
                      width: `${confidence}%`,
                    }}
                  />
                </div>

                <strong>
                  {confidence.toFixed(1)}%
                </strong>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}


/* =====================================
   PIPELINE STEP
===================================== */

function PipelineStep({
  number,
  title,
  icon,
  active,
}) {
  return (
    <div
      className={`pipeline-step ${
        active ? "active" : ""
      }`}
    >

      <div className="pipeline-number">
        {number}
      </div>

      <div className="pipeline-icon">
        {icon}
      </div>

      <span>{title}</span>

      {active && (
        <CheckCircle2 size={13} />
      )}

    </div>
  );
}


/* =====================================
   OBJECT CLASS
===================================== */

function ObjectClass({ name }) {
  return (
    <div className="object-class">

      <span />

      <span>{name}</span>

    </div>
  );
}


function getConfidenceClass(confidence) {
  if (confidence >= 0.8) {
    return "confidence-high";
  }

  if (confidence >= 0.5) {
    return "confidence-medium";
  }

  return "confidence-low";
}

export default Detection;