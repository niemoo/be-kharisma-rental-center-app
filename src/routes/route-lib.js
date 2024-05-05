const router = require('express').Router();
const { admin } = require('../controllers/index-control');

router.post('/admin/roles', admin.addRolesData);
router.post('/admin/cars', admin.addCarsData);

module.exports = router;
