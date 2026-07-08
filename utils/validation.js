/**
 * GLITCH_BOARD - SECURITY CORE VALIDATION ENGINE
 * SYSTEM PROTOCOL: SERVER-SIDE VALIDATION
 */

export function validateNotice(data) {
  const errors = {};

  // TITLE VALIDATION
  if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
    errors.title = "BULLETIN TITLE IS REQUIRED / MUST BE STRING";
  } else if (data.title.length > 100) {
    errors.title = "BULLETIN TITLE EXCEEDS MEMORY ALLOCATION (MAX 100 CHARS)";
  }

  // BODY VALIDATION
  if (!data.body || typeof data.body !== "string" || data.body.trim() === "") {
    errors.body = "BULLETIN BODY CONTENT IS REQUIRED";
  }

  // CATEGORY VALIDATION
  const allowedCategories = ["Exam", "Event", "General"];
  if (!data.category || !allowedCategories.includes(data.category)) {
    errors.category = `INVALID CATEGORY. ALLOWED NODES: ${allowedCategories.join(", ")}`;
  }

  // PRIORITY VALIDATION
  const allowedPriorities = ["Normal", "Urgent"];
  if (!data.priority || !allowedPriorities.includes(data.priority)) {
    errors.priority = `INVALID PRIORITY STATUS. ALLOWED NODES: ${allowedPriorities.join(", ")}`;
  }

  // PUBLISH DATE VALIDATION
  if (!data.publishDate) {
    errors.publishDate = "PUBLISH DATE TIMESTAMP IS REQUIRED";
  } else {
    const parsedDate = new Date(data.publishDate);
    if (isNaN(parsedDate.getTime())) {
      errors.publishDate = "INVALID DATE FORMAT. CONFORM TO ISO-8601";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
