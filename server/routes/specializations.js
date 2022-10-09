var express = require('express');
var router = express.Router();
var SpecializationsController = require('../controllers/Specializations');
var middleware = require("../controllers/middleware");

// Without Token Routes
router.post('/get_all', SpecializationsController.getAll);

// With Admin Token Routes
router.post('/upload_image', middleware.checkAdminToken, SpecializationsController.uploadImage);
router.post('/get_all_by_admin', middleware.checkAdminToken, SpecializationsController.getAllByAdmin);
router.post('/add', middleware.checkAdminToken, SpecializationsController.addNew);
router.post('/update', middleware.checkAdminToken, SpecializationsController.update);
router.post('/update_status', middleware.checkAdminToken, SpecializationsController.updateStatus);
router.post('/delete', middleware.checkAdminToken, SpecializationsController.deleteData);

// Common Routes
router.get('*',(req, res) => {res.status(405).json({status:false, message:"Invalid Get Request"})});
router.post('*',(req, res) => {res.status(405).json({status:false, message:"Invalid Post Request"})});
module.exports = router;