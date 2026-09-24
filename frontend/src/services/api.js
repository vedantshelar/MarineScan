
const API_URL = import.meta.env.VITE_API_URL;

export const getDetections = async () => {
  const response = await fetch(
    `${API_URL}/api/detections`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch detections");
  }

  return response.json();
};