const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

function makeCloudinaryStorage(folder) {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `matbakhy/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit' }],
    },
  });
}

const uploadRecipeImage = multer({
  storage: makeCloudinaryStorage('recipes'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadAvatar = multer({
  storage: makeCloudinaryStorage('avatars'),
  limits: { fileSize: 3 * 1024 * 1024 },
});

module.exports = { uploadRecipeImage, uploadAvatar };