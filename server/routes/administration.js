var express = require('express');
var router = express.Router();

var AdministratorController = require('../controllers/Administrator');

var middleware = require("../controllers/middleware");

// Admin Routes without admin Token
router.post('/login', AdministratorController.login);
router.post('/forgot', AdministratorController.forgotPasswordMail);
router.post('/reset_password', AdministratorController.forgotChangePassword);

// Admin Routes with admin Token
router.post('/change_password', middleware.checkAdminToken, AdministratorController.changePasswordWithOld);
router.post('/change_password_without_old', middleware.checkAdminToken, AdministratorController.changeAdministratorPassword);
router.post('/get', middleware.checkAdminToken, AdministratorController.getDetail);
router.post('/get_all', middleware.checkAdminToken, AdministratorController.getAllAdmins);
router.post('/get_admin_by_id', middleware.checkAdminToken, AdministratorController.getAdminById);
router.post('/change_status', middleware.checkAdminToken, AdministratorController.changeAdministratorStatus);
router.post('/add_admin', middleware.checkAdminToken, AdministratorController.addNewAdministrator);
router.post('/update_admin', middleware.checkAdminToken, AdministratorController.updateAdministrator);
router.post('/delete', middleware.checkAdminToken, AdministratorController.deleteAdministrator);
router.post('/get_dash_count', middleware.checkAdminToken, AdministratorController.getDashCount);

// Common Routes
router.get('*',(req,res) => {res.status(405).json({status:false, message:"Invalid Get Request"})});
router.post('*',(req,res) => {res.status(405).json({status:false, message:"Invalid Post Request"})});
module.exports = router;