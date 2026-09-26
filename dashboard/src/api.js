const API_BASE = "http://127.0.0.1:8000";

export async function getSessions() {
  const response = await fetch(
    `${API_BASE}/api/telemetry/sessions`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }

  return response.json();
}

export async function getEvents() {
  const response = await fetch(
    `${API_BASE}/api/telemetry/events`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  return response.json();
}

export async function getSessionDetails(sessionId) {
  const response = await fetch(
    `${API_BASE}/api/telemetry/sessions/${sessionId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch session details");
  }

  return response.json();
}

export async function getSessionReplay(sessionId) {
  const response = await fetch(
    `${API_BASE}/api/telemetry/sessions/${sessionId}/replay`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch session replay");
  }

  return response.json();
}