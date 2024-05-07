const router = require('express').Router();
const multer = require('multer');
const { admin } = require('../controllers/index-control');

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/cars');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().getTime() + '_' + file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
});

router.get('/cars', admin.getCarsData);
router.post('/admin/roles', admin.addRolesData);
router.post('/admin/cars', upload.single('image'), admin.addCarsData);
// router.patch('/admin/cars', upload.single('image'), admin.editCarsData);

module.exports = router;
