const router = require('express').Router();
const multer = require('multer');
const { admin } = require('../controllers/index-control');
const { auth } = require('../controllers/index-control');
const { app } = require('../controllers/index-control');
const userAuthMiddleware = require('../middleware/user-middleware');
const adminAuthMiddleware = require('../middleware/admin-middleware');

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

// APP
router.get('/cars', app.getAllCarsData);
router.get('/cars/:id', app.getSpecifiedCarData);

// AUTH
router.post('/register', auth.registerUser);
router.post('/login', auth.loginUser);

// ADMIN
router.get('/users', adminAuthMiddleware, admin.getAllUsersData);
router.post('/admin', adminAuthMiddleware, admin.addAdminData);
router.post('/admin/roles', adminAuthMiddleware, admin.addRolesData);
router.post('/admin/cars', adminAuthMiddleware, upload.single('image'), admin.addCarsData);
router.patch('/admin/cars/edit', adminAuthMiddleware, upload.single('image'), admin.editCarsData);

module.exports = router;
