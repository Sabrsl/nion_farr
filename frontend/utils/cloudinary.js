/**
 * Utilitaire de configuration Cloudinary pour optimiser l'intégration avec Vercel
 */

const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  uploadPreset: 'nionfar_uploads',
  folder: 'nionfar'
};

/**
 * Génère l'URL de l'API Cloudinary pour les uploads
 * @returns {string} L'URL d'upload Cloudinary
 */
export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
};

/**
 * Prépare les paramètres pour un upload vers Cloudinary
 * @param {File} file - Le fichier à uploader
 * @returns {FormData} Les données formatées pour l'upload
 */
export const prepareCloudinaryUpload = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', cloudinaryConfig.folder);
  return formData;
};

/**
 * Optimise une URL d'image Cloudinary pour Vercel
 * @param {string} url - L'URL originale de l'image Cloudinary
 * @param {Object} options - Options de transformation (width, height, quality, etc.)
 * @returns {string} L'URL optimisée
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary')) return url;
  
  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  // Construire les paramètres de transformation
  let transformation = 'f_auto,q_auto';
  if (width) transformation += `,w_${width}`;
  if (height) transformation += `,h_${height}`;
  
  // Insérer la transformation dans l'URL
  const baseUrl = url.split('upload/')[0];
  const imageId = url.split('upload/')[1];
  
  return `${baseUrl}upload/${transformation}/${imageId}`;
};

export default cloudinaryConfig; 