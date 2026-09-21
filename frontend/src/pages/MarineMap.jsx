import { useEffect, useMemo, useState } from "react";

import {
  Map as MapIcon,
  RefreshCw,
  Target,
  Radio,
  AlertTriangle,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import { getDetections } from "../services/api";

import "leaflet/dist/leaflet.css";


// ======================================================
// FIX LEAFLET MARKER ICONS IN VITE
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// ======================================================
// MAP CONFIGURATION
// ======================================================

// Offshore survey area
// Coordinates are simulated for prototype purposes.

const DEFAULT_CENTER = [18.72, 72.70];


// ======================================================
// OFFSHORE SIMULATED COORDINATES
// ======================================================
//
// These points are intentionally placed in the
// Arabian Sea / offshore region.
//
// They are NOT real detection coordinates.
//
// In the final system these will be replaced by:
//
// Sonar ping + GPS + vessel position + heading + range
//

const SEA_COORDINATES = [
  [18.91, 72.72],
  [18.88, 72.68],
  [18.84, 72.74],
  [18.80, 72.69],
  [18.76, 72.75],
  [18.72, 72.70],
  [18.68, 72.76],
  [18.64, 72.71],
  [18.60, 72.77],
  [18.56, 72.73],
  [18.52, 72.79],
  [18.48, 72.74],
  [18.44, 72.80],
  [18.40, 72.76],
  [18.36, 72.82],
  [18.32, 72.78],
  [18.28, 72.84],
  [18.24, 72.80],
  [18.20, 72.86],
  [18.16, 72.82],
];


// ======================================================
// CREATE CUSTOM DETECTION ICON
// ======================================================

function createIcon(type) {
  let symbol = "●";

  if (type === "ghost_net") {
    symbol = "G";
  }

  if (type === "shipwreck") {
    symbol = "W";
  }

  if (type === "submarine_pipeline") {
    symbol = "P";
  }

  if (type === "mine_cylinder") {
    symbol = "M";
  }

  return L.divIcon({
    className: "marine-marker-wrapper",

    html: `
      <div class="marine-marker">
        <span>${symbol}</span>
      </div>
    `,

    iconSize: [34, 34],

    iconAnchor: [17, 17],
  });
}


// ======================================================
// MAP RECENTER COMPONENT
// ======================================================

function MapRecenter({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}


// ======================================================
// MAIN COMPONENT
// ======================================================

function MarineMap() {
  const [scans, setScans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState("all");

  const [selectedDetection, setSelectedDetection] =
    useState(null);


  // ====================================================
  // FETCH DETECTIONS
  // ====================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await getDetections();

      setScans(data);
    } catch (error) {
      console.error("Map data error:", error);
    } finally {
      setLoading(false);
    }
  };


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    fetchData();
  }, []);


  // ====================================================
  // CONVERT DETECTIONS TO MAP MARKERS
  // ====================================================
  //
  // IMPORTANT:
  //
  // The DRISHTI dataset does not contain GPS coordinates.
  //
  // Therefore we assign deterministic simulated offshore
  // coordinates for the prototype.
  //
  // Later:
  //
  // latitude + longitude
  // will come from:
  //
  // sonar ping
  // +
  // vessel GPS
  // +
  // heading
  // +
  // sonar range
  //
  // ====================================================

  const mapDetections = useMemo(() => {
    const result = [];

    let index = 0;

    scans.forEach((scan) => {
      scan.detections?.forEach((detection) => {
        const seed = index;

        // Pick an offshore coordinate
        const coordinate =
          SEA_COORDINATES[
            seed % SEA_COORDINATES.length
          ];

        const latitude = coordinate[0];

        const longitude = coordinate[1];

        // Simulated depth
        const depth =
          15 + ((seed * 7) % 60);

        result.push({
          id: `${scan._id}-${seed}`,

          scanId: scan._id,

          filename: scan.filename,

          type: detection.class,

          confidence: detection.confidence,

          latitude,

          longitude,

          depth,

          box: detection.box,
        });

        index++;
      });
    });

    return result;
  }, [scans]);


  // ====================================================
  // FILTER VISIBLE DETECTIONS
  // ====================================================

  const visibleDetections = useMemo(() => {
    if (selectedType === "all") {
      return mapDetections;
    }

    return mapDetections.filter(
      (item) => item.type === selectedType
    );
  }, [
    mapDetections,
    selectedType,
  ]);


  // ====================================================
  // OBJECT COUNTS
  // ====================================================

  const objectCounts = useMemo(() => {
    const counts = {
      ghost_net: 0,

      shipwreck: 0,

      submarine_pipeline: 0,

      mine_cylinder: 0,
    };

    mapDetections.forEach((item) => {
      if (counts[item.type] !== undefined) {
        counts[item.type]++;
      }
    });

    return counts;
  }, [mapDetections]);


  // ====================================================
  // FORMAT OBJECT NAME
  // ====================================================

  const formatName = (name) => {
    return name
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="marine-map-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="page-header">

        <div>

          <div className="eyebrow">

            <MapIcon size={13} />

            GEOSPATIAL INTELLIGENCE

          </div>


          <h1>
            Marine Detection Map
          </h1>


          <p>
            Geographic visualization of AI-detected
            underwater objects.
          </p>

        </div>


        <button
          className="refresh-btn"
          onClick={fetchData}
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

      </div>


      {/* ==================================================
          SIMULATION NOTICE
      ================================================== */}

      <div className="map-notice">

        <AlertTriangle size={15} />

        <div>

          <strong>
            Prototype geolocation mode
          </strong>


          <span>
            Coordinates shown on this map are
            simulated offshore locations. Real
            deployment will use synchronized sonar
            and GPS/navigation data.
          </span>

        </div>

      </div>


      {/* ==================================================
          STATS
      ================================================== */}

      <div className="map-stats">

        {/* TOTAL DETECTIONS */}

        <div className="map-stat">

          <div className="map-stat-icon">

            <Target size={16} />

          </div>


          <div>

            <span>
              Total detections
            </span>

            <strong>
              {mapDetections.length}
            </strong>

          </div>

        </div>


        {/* SCANS */}

        <div className="map-stat">

          <div className="map-stat-icon">

            <Radio size={16} />

          </div>


          <div>

            <span>
              Scans analyzed
            </span>

            <strong>
              {scans.length}
            </strong>

          </div>

        </div>


        {/* VISIBLE */}

        <div className="map-stat">

          <div className="map-stat-icon">

            <Target size={16} />

          </div>


          <div>

            <span>
              Visible objects
            </span>

            <strong>
              {visibleDetections.length}
            </strong>

          </div>

        </div>

      </div>


      {/* ==================================================
          MAP LAYOUT
      ================================================== */}

      <div className="map-layout">


        {/* =================================================
            MAP
        ================================================= */}

        <div className="map-container">

          <MapContainer
            center={DEFAULT_CENTER}
            zoom={10}
            scrollWheelZoom={true}
            className="marine-leaflet-map"
          >

            {/* BASE MAP */}

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            {/* RECENTER */}

            <MapRecenter
              center={DEFAULT_CENTER}
            />


            {/* =============================================
                OFFSHORE SURVEY AREA
            ============================================= */}

            <Circle
              center={DEFAULT_CENTER}
              radius={25000}
              pathOptions={{
                color: "#42bcd2",

                fillColor: "#42bcd2",

                fillOpacity: 0.035,

                weight: 1,
              }}
            />


            {/* =============================================
                DETECTION MARKERS
            ============================================= */}

            {visibleDetections.map((item) => (

              <Marker
                key={item.id}

                position={[
                  item.latitude,
                  item.longitude,
                ]}

                icon={createIcon(item.type)}

                eventHandlers={{
                  click: () =>
                    setSelectedDetection(item),
                }}
              >

                {/* =========================================
                    POPUP
                ========================================= */}

                <Popup>

                  <div className="leaflet-popup-content-custom">

                    <strong>
                      {formatName(item.type)}
                    </strong>


                    <span>
                      Confidence:{" "}
                      {(
                        item.confidence * 100
                      ).toFixed(1)}
                      %
                    </span>


                    <span>
                      Depth:{" "}
                      {item.depth} m
                    </span>


                    <span>
                      Lat:{" "}
                      {item.latitude.toFixed(5)}
                    </span>


                    <span>
                      Lon:{" "}
                      {item.longitude.toFixed(5)}
                    </span>

                  </div>

                </Popup>

              </Marker>

            ))}

          </MapContainer>


          {/* =================================================
              MAP LABEL
          ================================================= */}

          <div className="map-overlay-label">

            <Radio size={12} />

            SONAR SURVEY ZONE

          </div>

        </div>


        {/* =================================================
            SIDE PANEL
        ================================================= */}

        <div className="map-side-panel">


          {/* PANEL HEADER */}

          <div className="map-panel-header">

            <div>

              <h2>
                Detection Layers
              </h2>

              <p>
                Filter detected objects
              </p>

            </div>

          </div>


          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="map-filters">


            {/* ALL */}

            <button
              className={
                selectedType === "all"
                  ? "map-filter active"
                  : "map-filter"
              }

              onClick={() =>
                setSelectedType("all")
              }
            >

              <span className="filter-dot all" />

              <span>
                All Objects
              </span>

              <strong>
                {mapDetections.length}
              </strong>

            </button>


            {/* GHOST NET */}

            <button
              className={
                selectedType === "ghost_net"
                  ? "map-filter active"
                  : "map-filter"
              }

              onClick={() =>
                setSelectedType("ghost_net")
              }
            >

              <span className="filter-dot ghost" />

              <span>
                Ghost Net
              </span>

              <strong>
                {objectCounts.ghost_net}
              </strong>

            </button>


            {/* SHIPWRECK */}

            <button
              className={
                selectedType === "shipwreck"
                  ? "map-filter active"
                  : "map-filter"
              }

              onClick={() =>
                setSelectedType("shipwreck")
              }
            >

              <span className="filter-dot wreck" />

              <span>
                Shipwreck
              </span>

              <strong>
                {objectCounts.shipwreck}
              </strong>

            </button>


            {/* PIPELINE */}

            <button
              className={
                selectedType ===
                "submarine_pipeline"
                  ? "map-filter active"
                  : "map-filter"
              }

              onClick={() =>
                setSelectedType(
                  "submarine_pipeline"
                )
              }
            >

              <span className="filter-dot pipe" />

              <span>
                Pipeline
              </span>

              <strong>
                {objectCounts.submarine_pipeline}
              </strong>

            </button>


            {/* MINE */}

            <button
              className={
                selectedType ===
                "mine_cylinder"
                  ? "map-filter active"
                  : "map-filter"
              }

              onClick={() =>
                setSelectedType(
                  "mine_cylinder"
                )
              }
            >

              <span className="filter-dot mine" />

              <span>
                Mine Cylinder
              </span>

              <strong>
                {objectCounts.mine_cylinder}
              </strong>

            </button>

          </div>


          {/* =================================================
              SELECTED DETECTION
          ================================================= */}

          {selectedDetection && (

            <div className="selected-detection">


              {/* SELECTED HEADER */}

              <div className="selected-header">

                <div>

                  <span>
                    SELECTED DETECTION
                  </span>

                  <strong>
                    {formatName(
                      selectedDetection.type
                    )}
                  </strong>

                </div>


                <button
                  onClick={() =>
                    setSelectedDetection(null)
                  }
                >
                  ×
                </button>

              </div>


              {/* SELECTED DETAILS */}

              <div className="selected-details">


                {/* CONFIDENCE */}

                <div>

                  <span>
                    Confidence
                  </span>

                  <strong>

                    {(
                      selectedDetection.confidence *
                      100
                    ).toFixed(1)}

                    %

                  </strong>

                </div>


                {/* DEPTH */}

                <div>

                  <span>
                    Depth
                  </span>

                  <strong>

                    {selectedDetection.depth}
                    m

                  </strong>

                </div>


                {/* LATITUDE */}

                <div>

                  <span>
                    Latitude
                  </span>

                  <strong>

                    {selectedDetection.latitude.toFixed(
                      5
                    )}

                  </strong>

                </div>


                {/* LONGITUDE */}

                <div>

                  <span>
                    Longitude
                  </span>

                  <strong>

                    {selectedDetection.longitude.toFixed(
                      5
                    )}

                  </strong>

                </div>

              </div>


              {/* SOURCE */}

              <div className="selected-source">

                Source:{" "}
                {selectedDetection.filename}

              </div>

            </div>

          )}


          {/* =================================================
              LEGEND
          ================================================= */}

          <div className="map-legend">

            <h3>
              Map Legend
            </h3>


            <div>

              <span className="legend-marker" />

              AI Detection

            </div>


            <div>

              <span className="legend-zone" />

              Survey Zone

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


// ======================================================
// EXPORT
// ======================================================

export default MarineMap;