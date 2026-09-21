import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Download,
  RefreshCw,
  Search,
  Target,
  Radio,
  ShieldCheck,
  MapPin,
  Waves,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { getDetections } from "../services/api";

function Reports() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);

  // =====================================================
  // FETCH SCANS
  // =====================================================

  const fetchReports = async () => {
    try {
      setLoading(true);

      const data = await getDetections();

      setScans(data);

      // Automatically select latest scan
      if (data.length > 0 && !selectedScan) {
        setSelectedScan(data[0]);
      }
    } catch (error) {
      console.error("Reports error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredScans = useMemo(() => {
    if (!search.trim()) {
      return scans;
    }

    return scans.filter((scan) =>
      scan.filename
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [scans, search]);

  // =====================================================
  // SELECT SCAN
  // =====================================================

  const handleSelectScan = (scan) => {
    setSelectedScan(scan);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // FORMAT OBJECT NAME
  // =====================================================

  const formatName = (name) => {
    if (!name) return "Unknown";

    return name
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =====================================================
  // CONFIDENCE CLASS
  // =====================================================

  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.8) {
      return "report-confidence-high";
    }

    if (confidence >= 0.5) {
      return "report-confidence-medium";
    }

    return "report-confidence-low";
  };

  // =====================================================
  // SELECTED SCAN ANALYSIS
  // =====================================================

  const selectedDetections =
    selectedScan?.detections || [];

  const reportStats = useMemo(() => {
    if (!selectedScan) {
      return {
        total: 0,
        averageConfidence: 0,
        highestConfidence: 0,
        classes: {},
      };
    }

    const detections =
      selectedScan.detections || [];

    const total = detections.length;

    const averageConfidence =
      total > 0
        ? detections.reduce(
            (sum, item) =>
              sum + Number(item.confidence || 0),
            0
          ) / total
        : 0;

    const highestConfidence =
      total > 0
        ? Math.max(
            ...detections.map(
              (item) =>
                Number(item.confidence || 0)
            )
          )
        : 0;

    const classes = {};

    detections.forEach((item) => {
      if (!classes[item.class]) {
        classes[item.class] = 0;
      }

      classes[item.class]++;
    });

    return {
      total,
      averageConfidence,
      highestConfidence,
      classes,
    };
  }, [selectedScan]);

  // =====================================================
  // PRINT REPORT
  // =====================================================

  const handlePrint = () => {
    if (!selectedScan) {
      return;
    }

    window.print();
  };

  // =====================================================
  // EMPTY STATE
  // =====================================================

  if (!loading && scans.length === 0) {
    return (
      <div className="reports-page">

        <div className="page-header">

          <div>
            <div className="eyebrow">
              <FileText size={13} />
              INTELLIGENCE REPORTING
            </div>

            <h1>Detection Reports</h1>

            <p>
              Generate detailed reports from
              completed sonar scans.
            </p>
          </div>

        </div>

        <div className="reports-empty">

          <div className="reports-empty-icon">
            <FileText size={28} />
          </div>

          <h2>No reports available</h2>

          <p>
            Run a sonar detection scan first.
            Your completed scans will appear here.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="reports-page">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="page-header">

        <div>

          <div className="eyebrow">

            <FileText size={13} />

            INTELLIGENCE REPORTING

          </div>

          <h1>
            Detection Reports
          </h1>

          <p>
            Generate detailed intelligence reports
            from analyzed sonar scans.
          </p>

        </div>


        <div className="reports-header-actions">

          <button
            className="refresh-btn"
            onClick={fetchReports}
            disabled={loading}
          >

            <RefreshCw
              size={15}
              className={
                loading ? "spin" : ""
              }
            />

            Refresh

          </button>


          <button
            className="report-primary-btn"
            onClick={handlePrint}
            disabled={!selectedScan}
          >

            <Download size={16} />

            Print / Save PDF

          </button>

        </div>

      </div>


      {/* ==================================================
          PROTOTYPE NOTICE
      ================================================== */}

      <div className="report-notice">

        <AlertTriangle size={16} />

        <div>

          <strong>
            Prototype report
          </strong>

          <span>
            Location and depth information shown
            in this report may be simulated during
            prototype operation.
          </span>

        </div>

      </div>


      {/* ==================================================
          REPORT WORKSPACE
      ================================================== */}

      <div className="reports-workspace">


        {/* =================================================
            LEFT SCAN LIST
        ================================================= */}

        <aside className="reports-list-panel">

          <div className="reports-list-header">

            <div>

              <h2>
                Scan Reports
              </h2>

              <span>
                {scans.length} scans
              </span>

            </div>

          </div>


          {/* SEARCH */}

          <div className="reports-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search scans..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          {/* SCAN LIST */}

          <div className="reports-scan-list">

            {filteredScans.length === 0 ? (

              <div className="reports-no-results">
                No matching scans
              </div>

            ) : (

              filteredScans.map((scan) => {

                const objectCount =
                  scan.detections?.length || 0;

                return (
                  <button
                    key={scan._id}
                    className={
                      selectedScan?._id === scan._id
                        ? "report-scan-item active"
                        : "report-scan-item"
                    }
                    onClick={() =>
                      handleSelectScan(scan)
                    }
                  >

                    <div className="report-scan-icon">
                      <Radio size={17} />
                    </div>


                    <div className="report-scan-info">

                      <strong>
                        {scan.filename}
                      </strong>

                      <span>
                        {formatDate(
                          scan.createdAt
                        )}
                        {" • "}
                        {formatTime(
                          scan.createdAt
                        )}
                      </span>

                    </div>


                    <div className="report-scan-count">
                      {objectCount}
                    </div>

                  </button>
                );
              })

            )}

          </div>

        </aside>


        {/* =================================================
            REPORT DOCUMENT
        ================================================= */}

        {selectedScan && (

          <main className="report-document">

            {/* REPORT TOP */}

            <div className="report-document-header">

              <div>

                <div className="report-document-label">
                  MARINESCAN
                </div>

                <h2>
                  Marine Detection Report
                </h2>

                <p>
                  AI-powered underwater sonar
                  analysis report
                </p>

              </div>


              <div className="report-id">

                <span>
                  REPORT ID
                </span>

                <strong>
                  {String(
                    selectedScan._id
                  ).slice(-8).toUpperCase()}
                </strong>

              </div>

            </div>


            {/* =================================================
                SCAN INFORMATION
            ================================================= */}

            <section className="report-section">

              <div className="report-section-title">

                <div>
                  <Radio size={17} />

                  <h3>
                    Scan Information
                  </h3>
                </div>

              </div>


              <div className="report-info-grid">

                <div className="report-info-item">

                  <span>
                    Source File
                  </span>

                  <strong>
                    {selectedScan.filename}
                  </strong>

                </div>


                <div className="report-info-item">

                  <span>
                    Scan Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedScan.createdAt
                    )}
                  </strong>

                </div>


                <div className="report-info-item">

                  <span>
                    Scan Time
                  </span>

                  <strong>
                    {formatTime(
                      selectedScan.createdAt
                    )}
                  </strong>

                </div>


                <div className="report-info-item">

                  <span>
                    Analysis Status
                  </span>

                  <strong className="report-status">

                    <span />

                    Completed

                  </strong>

                </div>

              </div>

            </section>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section className="report-section">

              <div className="report-section-title">

                <div>
                  <Target size={17} />

                  <h3>
                    Detection Summary
                  </h3>
                </div>

              </div>


              <div className="report-summary-grid">


                <div className="report-summary-card">

                  <div className="report-summary-icon">
                    <Target size={18} />
                  </div>

                  <span>
                    Objects Detected
                  </span>

                  <strong>
                    {reportStats.total}
                  </strong>

                </div>


                <div className="report-summary-card">

                  <div className="report-summary-icon">
                    <ShieldCheck size={18} />
                  </div>

                  <span>
                    Average Confidence
                  </span>

                  <strong>
                    {(
                      reportStats.averageConfidence *
                      100
                    ).toFixed(1)}
                    %
                  </strong>

                </div>


                <div className="report-summary-card">

                  <div className="report-summary-icon">
                    <Target size={18} />
                  </div>

                  <span>
                    Highest Confidence
                  </span>

                  <strong>
                    {(
                      reportStats.highestConfidence *
                      100
                    ).toFixed(1)}
                    %
                  </strong>

                </div>


                <div className="report-summary-card">

                  <div className="report-summary-icon">
                    <Waves size={18} />
                  </div>

                  <span>
                    Object Classes
                  </span>

                  <strong>
                    {
                      Object.keys(
                        reportStats.classes
                      ).length
                    }
                  </strong>

                </div>

              </div>

            </section>


            {/* =================================================
                DETECTION BREAKDOWN
            ================================================= */}

            <section className="report-section">

              <div className="report-section-title">

                <div>
                  <Target size={17} />

                  <h3>
                    Detection Breakdown
                  </h3>
                </div>

              </div>


              <div className="report-breakdown">

                {Object.entries(
                  reportStats.classes
                ).map(
                  ([className, count]) => {

                    const percentage =
                      reportStats.total > 0
                        ? (count /
                            reportStats.total) *
                          100
                        : 0;

                    return (
                      <div
                        className="report-breakdown-row"
                        key={className}
                      >

                        <div className="report-breakdown-name">

                          <span className="report-class-dot" />

                          <strong>
                            {formatName(
                              className
                            )}
                          </strong>

                        </div>


                        <div className="report-breakdown-bar">

                          <span
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>


                        <strong className="report-breakdown-count">

                          {count}

                        </strong>

                      </div>
                    );
                  }
                )}

              </div>

            </section>


            {/* =================================================
                DETECTION TABLE
            ================================================= */}

            <section className="report-section">

              <div className="report-section-title">

                <div>
                  <Target size={17} />

                  <h3>
                    Detected Objects
                  </h3>
                </div>

                <span>
                  {selectedDetections.length} objects
                </span>

              </div>


              <div className="report-table-wrapper">

                <table className="report-table">

                  <thead>

                    <tr>

                      <th>
                        #
                      </th>

                      <th>
                        Object
                      </th>

                      <th>
                        Confidence
                      </th>

                      <th>
                        Depth
                      </th>

                      <th>
                        Location
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {selectedDetections.map(
                      (detection, index) => {

                        // Deterministic simulated
                        // coordinates matching
                        // the MarineMap concept.

                        const latitude =
                          18.91 -
                          index * 0.04;

                        const longitude =
                          72.72 +
                          (index % 2 === 0
                            ? 0
                            : 0.05);

                        const depth =
                          15 +
                          ((index * 7) % 60);

                        return (
                          <tr
                            key={index}
                          >

                            <td>
                              <span className="report-index">
                                {String(
                                  index + 1
                                ).padStart(2, "0")}
                              </span>
                            </td>


                            <td>

                              <div className="report-object-name">

                                <span className="report-object-icon">
                                  <Target size={14} />
                                </span>

                                <strong>
                                  {formatName(
                                    detection.class
                                  )}
                                </strong>

                              </div>

                            </td>


                            <td>

                              <span
                                className={`report-confidence ${getConfidenceClass(
                                  detection.confidence
                                )}`}
                              >

                                {(
                                  detection.confidence *
                                  100
                                ).toFixed(1)}
                                %

                              </span>

                            </td>


                            <td>

                              <div className="report-depth">

                                <Waves size={13} />

                                {depth} m

                              </div>

                            </td>


                            <td>

                              <div className="report-location">

                                <MapPin size={13} />

                                <span>
                                  {latitude.toFixed(
                                    4
                                  )}
                                  ,{" "}
                                  {longitude.toFixed(
                                    4
                                  )}
                                </span>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </section>


            {/* =================================================
                AI ASSESSMENT
            ================================================= */}

            <section className="report-section">

              <div className="report-section-title">

                <div>
                  <ShieldCheck size={17} />

                  <h3>
                    AI Assessment
                  </h3>
                </div>

              </div>


              <div className="report-assessment">

                <div className="report-assessment-icon">
                  <ShieldCheck size={22} />
                </div>


                <div>

                  <strong>
                    Automated sonar analysis completed
                  </strong>

                  <p>

                    The MarineScan AI pipeline
                    analyzed the uploaded sonar
                    image and identified{" "}

                    <strong>
                      {reportStats.total}
                    </strong>

                    {" "}
                    potential underwater object
                    {reportStats.total !== 1
                      ? "s"
                      : ""}

                    . Detection confidence ranges
                    from{" "}

                    <strong>
                      {(
                        Math.min(
                          ...selectedDetections.map(
                            (item) =>
                              item.confidence
                          )
                        ) * 100 || 0
                      ).toFixed(1)}
                      %
                    </strong>

                    {" "}to{" "}

                    <strong>
                      {(
                        reportStats.highestConfidence *
                        100
                      ).toFixed(1)}
                      %
                    </strong>

                    .

                  </p>

                </div>

              </div>

            </section>


            {/* =================================================
                GEOLOCATION NOTE
            ================================================= */}

            <section className="report-location-note">

              <MapPin size={18} />

              <div>

                <strong>
                  Geolocation Status
                </strong>

                <p>

                  Coordinates displayed in this
                  prototype are simulated offshore
                  positions. In a production
                  deployment, object coordinates
                  should be calculated using synchronized
                  sonar, vessel GPS, heading, range
                  and navigation data.

                </p>

              </div>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="report-document-footer">

              <div>

                <strong>
                  MARINESCAN
                </strong>

                <span>
                  AI-Powered Marine Intelligence
                </span>

              </div>


              <div>

                <Clock size={13} />

                Generated{" "}
                {formatDate(
                  new Date()
                )}

              </div>

            </div>

          </main>

        )}

      </div>

    </div>
  );
}

export default Reports;