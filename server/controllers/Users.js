var ControllerMessages = require("./controllerMessages");
var Users = require('../utils/Users');
var helpers = require('../services/helper')
const upload = require('../services/image-upload');
const singleUpload = upload.single('user_profile');
const moment =  require('moment');

const usersController = {

    uploadProfilePicture: async (req, res) => {
        singleUpload(req, res, async (err) => {
            if(!req.file){
                return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.NO_IMAGE), 203);
            }
            let { filename } = req.file;
            return helpers.showOutput(res, helpers.showResponse(true, ControllerMessages.UPLOADED, { filename }), 200);
        });
    },

    checkEmailExistance: async (req, res) => {
        let requiredFields = ['email'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.checkEmailExistance(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    register: async (req, res) => {
        let requiredFields = ['fcm_token', 'full_name', 'password', 'email', 'country_code', 'phone', 'role'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let { role } = req.body
        if(role == "provider"){
            let requiredFields = ['education', 'provider_role', 'hospital', 'bio', 'start_time', 'end_time'];
            let validator = helpers.validateParams(req,requiredFields);
            if(!validator.status){
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            let { provider_role } = req.body
            if(provider_role == "doctor"){
                let requiredFields = ['specializations'];
                let validator = helpers.validateParams(req,requiredFields);
                if(!validator.status){
                    return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
                }
            }
        }
        let result = await Users.register(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    socialLogin: async (req, res) => {
        let requiredFields = ['login_source', 'fcm_token'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let { login_source } = req.body
        if(login_source == "social"){
            let requiredFields = ['email'];
            let validator = helpers.validateParams(req,requiredFields);
            if(!validator.status){
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
        } else if(login_source == "apple"){
            let requiredFields = ['auth_token'];
            let validator = helpers.validateParams(req,requiredFields);
            if(!validator.status){
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
        }
        let result = await Users.socialLogin(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    login: async (req, res) => {
        let requiredFields = ['email', 'password', 'fcm_token'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.login(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    forgotPasswordMail: async (req, res) => {
        let requiredFields = ['email'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.forgotPasswordMail(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    verifyOtp: async (req, res) => {
        let requiredFields = ['email', 'otp'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.verifyOtp(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    forgotChangePassword: async (req, res) => {
        let requiredFields = ['email', 'password'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.forgotChangePassword(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    changePasswordWithOld: async (req, res) => {
        let requiredFields = ['old_password', 'new_password'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.changePasswordWithOld(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getUserDetail: async (req, res) => {
        let _id = req.decoded.user_id;
        if(!_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let user_id = _id
        if("user_id" in req.body){
            if(req.body.user_id !=""){
                user_id = req.body.user_id
            }
        } 
        let result = await Users.getUserDetail(user_id);
        return helpers.showOutput(res, result, result.code);
    },

    updateCurrentLocation: async (req, res) => {
        let requiredFields = ['lat', 'lon',  'role'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        if(req.body.role !== "patient"){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.WRONG_USER_ACTION), 403);
        }
        let userDataObj = {
            lat         : req.body.lat,
            lon         : req.body.lon,
            updated_on  : moment().unix()
        }
        let result = await Users.updateUserDetails(userDataObj, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    updateUser: async (req, res) => {
        let requiredFields = ['full_name', 'email', 'country_code', 'phone', 'role'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let { role } = req.body
        if(role == "provider"){
            let requiredFields = ['education', 'hospital', 'bio', 'provider_role', 'start_time', 'end_time'];
            let validator = helpers.validateParams(req,requiredFields);
            if(!validator.status){
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            let { provider_role } = req.body
            if(provider_role == "doctor"){
                let requiredFields = ['specializations'];
                let validator = helpers.validateParams(req,requiredFields);
                if(!validator.status){
                    return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
                }
            }
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.updateUser(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    updateUserProfilePic: async (req, res) => {
        singleUpload(req, res, async (err) => {
            if(!req.file){
                return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.NO_IMAGE), 203);
            }
            let { filename } = req.file;
            let user_id = req.decoded.user_id;
            if(!user_id){
                return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
            }
            let userDataObj = {
                profile_pic   : filename,
                updated_on    : moment().unix()
            }
            let result = await Users.updateUserDetails(userDataObj, user_id);
            return helpers.showOutput(res, result, result.code);
        });
    },

    logout: async (req, res) => {
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.logout(user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getHomeData: async (req, res) => {
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.getHomeData(user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getMembers: async (req, res) => {
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.getMembers(user_id);
        return helpers.showOutput(res, result, result.code);
    },

    ///// friend request part start
    sendFriendRequest: async (req, res) => {
        let requiredFields = ['receiver_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.sendFriendRequest(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    cancelFriendRequest: async (req, res) => {
        let requiredFields = ['receiver_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.cancelFriendRequest(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    respondToFriendRequest: async (req, res) => {
        let requiredFields = ['sender_id', 'action'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.respondToFriendRequest(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    unFriendUser: async (req, res) => {
        let requiredFields = ['req_user_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.unFriendUser(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },
    ///// friend request part end

    getUsersData: async (req, res) => {
        let requiredFields = ['users'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.getUsersData(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getOtherUserData: async (req, res) => {
        let requiredFields = ['user_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let { user_id } = req.body
        let result = await Users.getOtherUserData(user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getMyFriends: async (req, res) => {
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.getMyFriends(user_id);
        return helpers.showOutput(res, result, result.code);
    },

    NotifyOtherUser: async (req, res) => {
        let requiredFields = ['req_user_ids', 'payload'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.NotifyOtherUser(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getDoctorBySpecs: async (req, res) => {
        let requiredFields = ['specialization_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.getDoctorBySpecs(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getDoctorsOfHospital: async (req, res) => {
        let requiredFields = ['hospital_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.getDoctorsOfHospital(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getAvailableTimeSlots: async (req, res) => {
        let requiredFields = ['doctor_id', 'selected_date'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.getAvailableTimeSlots(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    reserveSlotByDoctor: async (req, res) => {
        let requiredFields = ['start_time', 'end_time'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.reserveSlotByDoctor(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    freezeAppointment: async (req, res) => {
        let requiredFields = ['start_time', 'end_time', 'doctor_id', 'appointment_type', 'appointment_amount'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.freezeAppointment(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    respondToAppointmentRequest: async (req, res) => {
        let requiredFields = ['appointment_id', 'decision'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let { decision } = req.body
        if(decision == 2){
            let requiredFields = ['appoint_start', 'appoint_end'];
            let validator = helpers.validateParams(req,requiredFields);
            if(!validator.status){
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
        }
        let result = await Users.respondToAppointmentRequest(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    addProviderToAppointment: async (req, res) => {
        let requiredFields = ['appointment_id', 'provider_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.addProviderToAppointment(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    rateProvider: async (req, res) => {
        let requiredFields = ['provider_id', 'rating', 'review'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.rateProvider(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getMyAppointments: async (req, res) => {
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.getMyAppointments(user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getAppointmentDetail: async (req, res) => {
        let requiredFields = ['appointment_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let { appointment_id } = req.body
        let result = await Users.getAppointmentDetail(appointment_id);
        return helpers.showOutput(res, result, result.code);
    },

    createTeam: async (req, res) => {
        let requiredFields = ['members'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.createTeam(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    updateTeam: async (req, res) => {
        let requiredFields = ['team_id', 'members'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.updateTeam(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getMyTeam: async (req, res) => {
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.getMyTeam(user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getAllProviderRoles: async (req, res) => {
        let result = await Users.getAllProviderRoles();
        return helpers.showOutput(res, result, result.code);
    },

    readAllNotifications: async (req, res) => {
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.readAllNotifications(user_id);
        return helpers.showOutput(res, result, result.code);
    },

    clearNotifications: async (req, res) => {
        let user_id = req.decoded.user_id;
        if(!user_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_USER), 403);
        }
        let result = await Users.clearNotifications(user_id);
        return helpers.showOutput(res, result, result.code);
    },
    
    //// admin panel controller
    updateUserByAdmin: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let requiredFields = ['user_id', 'full_name', 'country_code', 'phone', 'profile_pic', 'role', 'email'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let { role } = req.body
        if(role == "doctor"){
            let requiredFields = ['education', 'specializations', 'hospital', 'bio', 'start', 'end'];
            let validator = helpers.validateParams(req,requiredFields);
            if(!validator.status){
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
        }
        let result = await Users.updateUserByAdmin(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    updateStatus: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let requiredFields = ['user_id', 'status'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.updateStatus(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    deleteUser: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let requiredFields = ['user_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.deleteUser(req.body.user_id);
        return helpers.showOutput(res, result, result.code);
    },

    getAllUsers: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let requiredFields = ['role'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.getAllUsers(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    changePasswordByAdmin: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let requiredFields = ['user_id', 'password'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.changePasswordByAdmin(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getProviderDashboardCount: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Users.getProviderDashboardCount();
        return helpers.showOutput(res, result, result.code);
    },

    getMainDashboardData: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Users.getMainDashboardData();
        return helpers.showOutput(res, result, result.code);
    },

    getUsersByProviderRole: async (req, res) => {
        let requiredFields = ['provider_role'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Users.getUsersByProviderRole(req.body);
        return helpers.showOutput(res, result, result.code);
    },
}

module.exports = {
    ...usersController
}