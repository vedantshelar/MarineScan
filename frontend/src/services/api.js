const API_URL = "http://localhost:5001";

export const getDetections = async () => {
  const response = await fetch(
    `${API_URL}/api/detections`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch detections");
  }

  return response.json();
};