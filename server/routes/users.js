var express = require('express');
var router = express.Router();
var UsersController = require('../controllers/Users');
var middleware = require("../controllers/middleware");

// Token Routes
router.post('/refresh', middleware.refreshToken);

// Without Token Routes
router.post('/upload_profile', UsersController.uploadProfilePicture);
router.post('/validate_email', UsersController.checkEmailExistance);
router.post('/register', UsersController.register);
router.post('/login', UsersController.login);
router.post('/social_login', UsersController.socialLogin);
router.post('/forgot', UsersController.forgotPasswordMail);
router.post('/verify_otp', UsersController.verifyOtp);
router.post('/reset_password', UsersController.forgotChangePassword);
router.post('/get_all_provider_roles', UsersController.getAllProviderRoles);

// With Token Routes
router.post('/get', middleware.checkToken, UsersController.getUserDetail);
router.post('/change_password', middleware.checkToken, UsersController.changePasswordWithOld);
router.post('/update', middleware.checkToken, UsersController.updateUser);
router.post('/update_profile', middleware.checkToken, UsersController.updateUserProfilePic);
router.post('/update_patient_location', middleware.checkToken, UsersController.updateCurrentLocation);
router.post('/logout', middleware.checkToken, UsersController.logout);
router.post('/get_home_data', middleware.checkToken, UsersController.getHomeData);

router.post('/get_members', middleware.checkToken, UsersController.getMembers);
router.post('/friend_request', middleware.checkToken, UsersController.sendFriendRequest);
router.post('/cancel_friend_request', middleware.checkToken, UsersController.cancelFriendRequest);
router.post('/respond_friend_request', middleware.checkToken, UsersController.respondToFriendRequest);
router.post('/unfriend', middleware.checkToken, UsersController.unFriendUser);
router.post('/get_users_data', middleware.checkToken, UsersController.getUsersData);
router.post('/get_my_friends', middleware.checkToken, UsersController.getMyFriends);
router.post('/notify_other_user', middleware.checkToken, UsersController.NotifyOtherUser);
router.post('/get_other_user_data', middleware.checkToken, UsersController.getOtherUserData);
router.post('/get_doctors_by_specs', middleware.checkToken, UsersController.getDoctorBySpecs);
router.post('/get_doctors_of_hospital', middleware.checkToken, UsersController.getDoctorsOfHospital);
router.post('/get_available_time_slots', middleware.checkToken, UsersController.getAvailableTimeSlots);
router.post('/reserve_slot_by_doctor', middleware.checkToken, UsersController.reserveSlotByDoctor);
router.post('/freeze_appointment', middleware.checkToken, UsersController.freezeAppointment);
router.post('/respond_to_appointment_request', middleware.checkToken, UsersController.respondToAppointmentRequest);
router.post('/add_provider_to_appointment', middleware.checkToken, UsersController.addProviderToAppointment);
router.post('/get_appointment_detail', middleware.checkToken, UsersController.getAppointmentDetail);
router.post('/get_my_appointments', middleware.checkToken, UsersController.getMyAppointments);
router.post('/rate_provider', middleware.checkToken, UsersController.rateProvider);
router.post('/create_team', middleware.checkToken, UsersController.createTeam);
router.post('/update_team', middleware.checkToken, UsersController.updateTeam);
router.post('/get_my_team', middleware.checkToken, UsersController.getMyTeam);
router.post('/read_all_notifications', middleware.checkToken, UsersController.readAllNotifications);
router.post('/clear_notifications', middleware.checkToken, UsersController.clearNotifications);

// With Admin Token Routes
router.post('/get_all_users', middleware.checkAdminToken, UsersController.getAllUsers);
router.post('/delete_user', middleware.checkAdminToken, UsersController.deleteUser);
router.post('/change_password_by_admin', middleware.checkAdminToken, UsersController.changePasswordByAdmin);
router.post('/update_status', middleware.checkAdminToken, UsersController.updateStatus);
router.post('/update_user', middleware.checkAdminToken, UsersController.updateUserByAdmin);

// Common Routes
router.get('*',(req, res) => {res.status(405).json({status:false, message:"Invalid Get Request"})});
router.post('*',(req, res) => {res.status(405).json({status:false, message:"Invalid Post Request"})});
module.exports = router;