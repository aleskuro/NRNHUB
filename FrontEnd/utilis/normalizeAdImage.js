// src/utils/normalizeAdImage.js
export const normalizeAdImage = (path, API_URL) => {
  if (!path) return null;

  // Already full URL
  if (/^https?:\/\//i.test(path)) return path;

  // Extract filename
  const filename = path.split(/[\\/]/).pop();
  if (!filename || !/^adImage-\d+-\d+\.\w+$/i.test(filename)) {
    console.warn('Invalid ad image path:', path);
    return null;
  }

  // Remove /api if present
  const base = API_URL.replace(/\/api\/?$/, '');
  return `${base}/Uploads/ads/${filename}`;
};