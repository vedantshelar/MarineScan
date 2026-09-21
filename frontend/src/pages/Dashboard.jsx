import { useEffect, useMemo, useState } from "react";

import {
  ScanLine,
  Target,
  Waves,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  RefreshCw
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

import { getDetections } from "../services/api";


function Dashboard() {

  const [detections, setDetections] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  const fetchData = async () => {

    try {

      setLoading(true);
      setError(null);

      const data = await getDetections();

      setDetections(data);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to connect to MarineScan backend."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    fetchData();
  }, []);


  /* =========================
     CALCULATE REAL STATISTICS
  ========================= */

  const statistics = useMemo(() => {

    let totalObjects = 0;

    let ghostNet = 0;
    let pipeline = 0;
    let shipwreck = 0;
    let mineCylinder = 0;


    detections.forEach((scan) => {

      if (!scan.detections) return;

      totalObjects += scan.detections.length;


      scan.detections.forEach((item) => {

        switch (item.class) {

          case "ghost_net":
            ghostNet++;
            break;

          case "submarine_pipeline":
            pipeline++;
            break;

          case "shipwreck":
            shipwreck++;
            break;

          case "mine_cylinder":
            mineCylinder++;
            break;

          default:
            break;

        }

      });

    });


    return {
      totalScans: detections.length,
      totalObjects,
      ghostNet,
      pipeline,
      shipwreck,
      mineCylinder
    };

  }, [detections]);


  /* =========================
     CHART DATA
  ========================= */

  const chartData = useMemo(() => {

    const counts = {};

    detections.forEach((scan) => {

      const date = new Date(
        scan.createdAt
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short"
        }
      );

      counts[date] =
        (counts[date] || 0) + 1;

    });


    return Object.entries(counts)
      .reverse()
      .map(([day, scans]) => ({
        day,
        scans
      }));

  }, [detections]);


  /* =========================
     RENDER
  ========================= */

  return (

    <div className="dashboard">


      {/* HEADER */}

      <div className="page-header">

        <div>

          <p className="page-eyebrow">
            MARINE INTELLIGENCE
          </p>

          <h1>
            Dashboard
          </h1>

          <p>
            Monitor underwater sonar analysis
            and marine object detections.
          </p>

        </div>


        <button
          className="primary-button"
          onClick={fetchData}
        >

          <RefreshCw size={17} />

          Refresh Data

        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="dashboard-error">

          <AlertTriangle size={17} />

          {error}

        </div>

      )}


      {/* STATISTICS */}

      <div className="stats-grid">


        <StatCard
          icon={<ScanLine size={21} />}
          iconClass="blue"
          label="TOTAL SCANS"
          value={loading ? "..." : statistics.totalScans}
          description="Sonar images analyzed"
        />


        <StatCard
          icon={<Target size={21} />}
          iconClass="cyan"
          label="OBJECTS DETECTED"
          value={loading ? "..." : statistics.totalObjects}
          description="AI identified objects"
        />


        <StatCard
          icon={<Waves size={21} />}
          iconClass="purple"
          label="SONAR IMAGES"
          value={loading ? "..." : statistics.totalScans}
          description="Images processed"
        />


        <StatCard
          icon={<AlertTriangle size={21} />}
          iconClass="orange"
          label="DETECTION TYPES"
          value={loading ? "..." : getDetectionTypes(statistics)}
          description="Marine object categories"
        />

      </div>


      {/* MAIN GRID */}

      <div className="dashboard-grid">


        {/* CHART */}

        <div className="dashboard-card chart-card">

          <div className="card-header">

            <div>

              <h3>
                Scan Activity
              </h3>

              <p>
                Real scans stored in MongoDB
              </p>

            </div>

            <button className="icon-button">
              <ArrowUpRight size={18} />
            </button>

          </div>


          <div className="chart-container">

            {chartData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart data={chartData}>

                  <defs>

                    <linearGradient
                      id="scanGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopOpacity={0.35}
                      />

                      <stop
                        offset="100%"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>


                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />


                  <Area
                    type="monotone"
                    dataKey="scans"
                    strokeWidth={3}
                    fill="url(#scanGradient)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            ) : (

              <div className="empty-chart">

                <Activity size={25} />

                <span>
                  No scan data available yet
                </span>

              </div>

            )}

          </div>

        </div>


        {/* DETECTION SUMMARY */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h3>
                Detection Summary
              </h3>

              <p>
                Real AI detections
              </p>

            </div>

            <Activity size={19} />

          </div>


          <DetectionSummary
            name="Ghost Net"
            count={statistics.ghostNet}
            total={statistics.totalObjects}
          />

          <DetectionSummary
            name="Submarine Pipeline"
            count={statistics.pipeline}
            total={statistics.totalObjects}
          />

          <DetectionSummary
            name="Shipwreck"
            count={statistics.shipwreck}
            total={statistics.totalObjects}
          />

          <DetectionSummary
            name="Mine Cylinder"
            count={statistics.mineCylinder}
            total={statistics.totalObjects}
          />

        </div>

      </div>


      {/* RECENT SCANS */}

      <div className="dashboard-card recent-card">

        <div className="card-header">

          <div>

            <h3>
              Recent Scans
            </h3>

            <p>
              Latest sonar analysis activity
            </p>

          </div>

          <button
            className="text-button"
            onClick={fetchData}
          >
            Refresh
          </button>

        </div>


        {detections.length > 0 ? (

          <div className="scan-table">

            <div className="table-head">

              <span>SCAN</span>
              <span>OBJECTS</span>
              <span>CONFIDENCE</span>
              <span>STATUS</span>
              <span>DATE</span>

            </div>


            {detections
              .slice(0, 5)
              .map((scan) => (

                <RecentScan
                  key={scan._id}
                  scan={scan}
                />

              ))}

          </div>

        ) : (

          <div className="empty-scans">

            <Waves size={25} />

            <h3>
              No scans yet
            </h3>

            <p>
              Upload a sonar image from the AI
              Detection page to get started.
            </p>

          </div>

        )}

      </div>

    </div>

  );
}


/* =========================
   STAT CARD
========================= */

function StatCard({
  icon,
  iconClass,
  label,
  value,
  description
}) {

  return (

    <div className="stat-card">

      <div className="stat-top">

        <div className={`stat-icon ${iconClass}`}>
          {icon}
        </div>

      </div>

      <span className="stat-label">
        {label}
      </span>

      <strong className="stat-value">
        {value}
      </strong>

      <span className="stat-description">
        {description}
      </span>

    </div>

  );
}


/* =========================
   DETECTION SUMMARY
========================= */

function DetectionSummary({
  name,
  count,
  total
}) {

  const percentage =
    total > 0
      ? (count / total) * 100
      : 0;


  return (

    <div>

      <div className="summary-row">

        <div className="summary-name">

          <span className="summary-dot ghost"></span>

          {name}

        </div>

        <strong>
          {count}
        </strong>

      </div>


      <div className="summary-bar">

        <span
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

    </div>

  );

}


/* =========================
   RECENT SCAN
========================= */

function RecentScan({ scan }) {

  const detections =
    scan.detections || [];


  const confidence =
    detections.length > 0
      ? Math.max(
          ...detections.map(
            (d) => d.confidence
          )
        ) * 100
      : 0;


  const date =
    new Date(
      scan.createdAt
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }
    );


  return (

    <div className="table-row">

      <span className="scan-name">

        <div className="scan-thumbnail">
          <Waves size={18} />
        </div>

        {scan.filename}

      </span>


      <span>
        {detections.length} objects
      </span>


      <span className="confidence">
        {confidence.toFixed(1)}%
      </span>


      <span>

        <span className="status-badge success">
          Completed
        </span>

      </span>


      <span>
        {date}
      </span>

    </div>

  );

}


/* =========================
   HELPERS
========================= */

function getDetectionTypes(statistics) {

  let count = 0;

  if (statistics.ghostNet > 0)
    count++;

  if (statistics.pipeline > 0)
    count++;

  if (statistics.shipwreck > 0)
    count++;

  if (statistics.mineCylinder > 0)
    count++;

  return count;

}


export default Dashboard;