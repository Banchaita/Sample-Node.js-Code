var ControllerMessages = require("./controllerMessages");
var Administration = require('../utils/Administration');
var helpers = require('../services/helper')

const adminController = {
    login: async (req, res) => {
        let requiredFields = ['email', 'password'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Administration.login(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    forgotPasswordMail: async (req, res) => {
        let requiredFields = ['email'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Administration.forgotPasswordMail(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    forgotChangePassword: async (req, res) => {
        let requiredFields = ['otp', 'email', 'password'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Administration.forgotChangePassword(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    changePasswordWithOld: async (req, res) => {
        let requiredFields = ['old_password', 'new_password'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.changePasswordWithOld(req.body, admin_id);
        return helpers.showOutput(res, result, result.code);
    },

    changeAdministratorPassword: async (req, res) => {
        let requiredFields = ['_id', 'new_password'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.changeAdministratorPassword(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    changeAdministratorStatus: async (req, res) => {
        let requiredFields = ['admin_id', 'status'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.changeAdministratorStatus(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getDetail: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.getAdminData(admin_id);
        return helpers.showOutput(res, result, result.code);
    },

    getAllAdmins: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.getAllAdmins();
        return helpers.showOutput(res, result, result.code);
    },

    addNewAdministrator: async (req, res) => {
        let requiredFields = ['name', 'email', 'password'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.addNewAdministrator(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    updateAdministrator: async (req, res) => {
        let requiredFields = ['_id', 'name', 'email'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.updateAdministrator(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    deleteAdministrator: async (req, res) => {
        let requiredFields = ['_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.deleteAdministrator(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getAdminById: async (req, res) => {
        let requiredFields = ['_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.getAdminById(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getDashCount: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.getDashCount();
        return helpers.showOutput(res, result, result.code);
    }
}

module.exports = {
    ...adminController
}