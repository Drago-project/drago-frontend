const isDataUrl = (value) =>
  typeof value === "string" && value.startsWith("data:");
const isHttpUrl = (value) =>
  typeof value === "string" && /^(https?:|blob:)/.test(value);
const isSvgString = (value) =>
  typeof value === "string" && value.trim().startsWith("<svg");
const isBase64String = (value) =>
  typeof value === "string" &&
  /^[A-Za-z0-9+/]+={0,2}$/.test(value.replace(/\s+/g, ""));

export function toImageSrc(value) {
  if (!value) return "";
  if (isDataUrl(value) || isHttpUrl(value)) return value;

  const trimmed = value.trim();

  if (isSvgString(trimmed)) {
    try {
      return `data:image/svg+xml;base64,${btoa(trimmed)}`;
    } catch (error) {
      console.error("toImageSrc SVG encode failed:", error);
      return "";
    }
  }

  if (isBase64String(trimmed)) {
    return `data:image/png;base64,${trimmed}`;
  }

  const backendBaseUrl = import.meta.env.VITE_API_URL || "";
  const imageFolder = "/uploads";

  // 3. التأكد من وجود سلاش / قبل اسم الملف
  const fileName = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // النتيجة النهائية: http://localhost:5000/uploads/2db2345e-9af4...svg
  return `${backendBaseUrl}${imageFolder}${fileName}`;
}
