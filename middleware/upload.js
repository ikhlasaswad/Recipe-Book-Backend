const multer = require('multer');
const path = require('path');

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', subfolder));
    },
    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() +
        '-' +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);

      cb(null, uniqueName);
    },
  });
}
const imageFilter = (req, file, cb) => {
  cb(null, true);
};


const uploadRecipeImage = multer({
  storage: makeStorage('recipes'),
  fileFilter: imageFilter,
});

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter: imageFilter,
});

module.exports = { uploadRecipeImage, uploadAvatar };