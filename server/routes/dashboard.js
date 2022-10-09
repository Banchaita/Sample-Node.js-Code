var express = require('express');
var router = express.Router();
var UserController = require('../controllers/Users');
var middleware = require("../controllers/middleware");

// With Admin Token Routes
router.post('/get_main_dashboard_data', middleware.checkAdminToken, UserController.getMainDashboardData);
router.post('/get_provider_dashboard_count', middleware.checkAdminToken, UserController.getProviderDashboardCount);
router.post('/get_users_by_provider_role', middleware.checkAdminToken, UserController.getUsersByProviderRole);



// Common Routes
router.get('*',(req, res) => {res.status(405).json({status:false, message:"Invalid Get Request"})});
router.post('*',(req, res) => {res.status(405).json({status:false, message:"Invalid Post Request"})});
module.exports = router;