import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  FileImage,
  ChevronDown,
  X,
  Radar,
  Calendar,
  Target,
} from "lucide-react";
import { getDetections } from "../services/api";

function ScanHistory() {
  const [scans, setScans] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchScans = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDetections();
      setScans(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load scan history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const filenameMatch = scan.filename
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const objects = scan.detections || [];

      const typeMatch =
        filter === "all" ||
        objects.some(
          (item) => item.class?.toLowerCase() === filter.toLowerCase()
        );

      return filenameMatch && typeMatch;
    });
  }, [scans, search, filter]);

  const getMaxConfidence = (detections) => {
    if (!detections || detections.length === 0) return 0;

    return Math.max(...detections.map((item) => item.confidence || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = (detections) => {
    if (!detections || detections.length === 0) {
      return "No Objects";
    }

    return "Completed";
  };

  return (
    <div className="history-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Radar size={13} />
            MARINE INTELLIGENCE
          </div>

          <h1>Scan History</h1>

          <p>
            Review previously analyzed sonar scans and AI detections.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchScans}
          disabled={loading}
        >
          <RefreshCw
            size={15}
            className={loading ? "spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* CONTROLS */}
      <div className="history-toolbar">

        <div className="history-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search scan filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="history-filter">
          <ChevronDown size={14} />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Objects</option>
            <option value="ghost_net">Ghost Net</option>
            <option value="shipwreck">Shipwreck</option>
            <option value="submarine_pipeline">
              Submarine Pipeline
            </option>
            <option value="mine_cylinder">
              Mine Cylinder
            </option>
          </select>
        </div>

      </div>

      {/* SUMMARY */}
      <div className="history-summary">

        <div className="history-summary-item">
          <span>Total Scans</span>
          <strong>{scans.length}</strong>
        </div>

        <div className="history-summary-item">
          <span>Visible</span>
          <strong>{filteredScans.length}</strong>
        </div>

        <div className="history-summary-item">
          <span>Total Objects</span>
          <strong>
            {scans.reduce(
              (total, scan) =>
                total + (scan.detections?.length || 0),
              0
            )}
          </strong>
        </div>

      </div>

      {/* TABLE */}
      <div className="history-card">

        <div className="history-card-header">
          <div>
            <h2>Analysis Records</h2>
            <p>
              AI detection results stored in MongoDB
            </p>
          </div>

          <div className="record-count">
            {filteredScans.length} records
          </div>
        </div>

        {loading ? (
          <div className="history-loading">
            <RefreshCw size={22} className="spin" />
            <p>Loading scan history...</p>
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="history-empty">
            <FileImage size={38} />

            <h3>No scan records found</h3>

            <p>
              Upload a sonar image from the Detection page
              to create a scan record.
            </p>
          </div>
        ) : (
          <div className="history-table-wrapper">

            <table className="history-table">

              <thead>
                <tr>
                  <th>SCAN</th>
                  <th>OBJECTS</th>
                  <th>TOP DETECTION</th>
                  <th>CONFIDENCE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredScans.map((scan) => {

                  const detections = scan.detections || [];

                  const maxConfidence =
                    getMaxConfidence(detections);

                  const topDetection =
                    detections.length > 0
                      ? detections.reduce((best, current) =>
                          current.confidence >
                          best.confidence
                            ? current
                            : best
                        )
                      : null;

                  return (
                    <tr key={scan._id}>

                      <td>
                        <div className="scan-name">
                          <div className="scan-icon">
                            <FileImage size={16} />
                          </div>

                          <div>
                            <strong>
                              {scan.filename}
                            </strong>

                            <span>
                              ID: {scan._id?.slice(-8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="object-count">
                          <Target size={14} />
                          {detections.length}
                        </div>
                      </td>

                      <td>
                        {topDetection ? (
                          <span className="object-badge">
                            {topDetection.class.replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        ) : (
                          <span className="muted">
                            None
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="table-confidence">

                          <div className="confidence-track">
                            <div
                              className="confidence-fill"
                              style={{
                                width: `${Math.min(
                                  maxConfidence * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <span>
                            {(
                              maxConfidence * 100
                            ).toFixed(1)}
                            %
                          </span>

                        </div>
                      </td>

                      <td>
                        <div className="date-cell">
                          <Calendar size={13} />
                          {formatDate(scan.createdAt)}
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            detections.length > 0
                              ? "status-badge completed"
                              : "status-badge empty"
                          }
                        >
                          <span />
                          {getStatus(detections)}
                        </span>
                      </td>

                      <td>
                        <button
                          className="view-btn"
                          onClick={() =>
                            setSelectedScan(scan)
                          }
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* DETAIL MODAL */}
      {selectedScan && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedScan(null)}
        >

          <div
            className="scan-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <div>
                <div className="eyebrow">
                  <Radar size={13} />
                  SCAN DETAILS
                </div>

                <h2>{selectedScan.filename}</h2>

                <p>
                  {formatDate(selectedScan.createdAt)}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedScan(null)}
              >
                <X size={18} />
              </button>

            </div>

            <div className="modal-stats">

              <div>
                <span>Objects</span>
                <strong>
                  {selectedScan.detections?.length || 0}
                </strong>
              </div>

              <div>
                <span>Max Confidence</span>
                <strong>
                  {(
                    getMaxConfidence(
                      selectedScan.detections
                    ) * 100
                  ).toFixed(1)}
                  %
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>Completed</strong>
              </div>

            </div>

            <h3 className="modal-section-title">
              Detected Objects
            </h3>

            <div className="modal-detections">

              {selectedScan.detections?.map(
                (detection, index) => (
                  <div
                    className="modal-detection"
                    key={index}
                  >

                    <div>
                      <strong>
                        {detection.class.replaceAll(
                          "_",
                          " "
                        )}
                      </strong>

                      <span>
                        Detection #{index + 1}
                      </span>
                    </div>

                    <div className="modal-confidence">
                      {(
                        detection.confidence * 100
                      ).toFixed(1)}
                      %
                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default ScanHistory;