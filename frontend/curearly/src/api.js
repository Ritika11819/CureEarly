// Docker Compose maps the Spring Boot container to localhost:8082.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function api(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) },
    ...options,
  });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Something went wrong. Please try again.");
  return body;
}

export { API_URL };
