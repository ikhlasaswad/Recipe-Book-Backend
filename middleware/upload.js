const multer = require('multer');
const path = require('path');

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', subfolder));
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  });
}

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('الملف المرفوع يجب أن يكون صورة'), false);
};

const uploadRecipeImage = multer({ storage: makeStorage('recipes'), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: makeStorage('avatars'), fileFilter: imageFilter, limits: { fileSize: 3 * 1024 * 1024 } });

module.exports = { uploadRecipeImage, uploadAvatar };
