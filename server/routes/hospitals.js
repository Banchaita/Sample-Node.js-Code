var express = require('express');
var router = express.Router();
var HospitalsController = require('../controllers/Hospitals');
var middleware = require("../controllers/middleware");

// Without Token Routes
router.post('/get_all', HospitalsController.getAll);

// With Admin Token Routes
router.post('/upload_image', middleware.checkAdminToken, HospitalsController.uploadImages);
router.post('/get_all_by_admin', middleware.checkAdminToken, HospitalsController.getAllByAdmin);
router.post('/get_by_admin', middleware.checkAdminToken, HospitalsController.getByAdmin);
router.post('/add', middleware.checkAdminToken, HospitalsController.addNew);
router.post('/update', middleware.checkAdminToken, HospitalsController.update);
router.post('/update_status', middleware.checkAdminToken, HospitalsController.updateStatus);
router.post('/delete', middleware.checkAdminToken, HospitalsController.deleteData);

// Common Routes
router.get('*',(req, res) => {res.status(405).json({status:false, message:"Invalid Get Request"})});
router.post('*',(req, res) => {res.status(405).json({status:false, message:"Invalid Post Request"})});
module.exports = router;