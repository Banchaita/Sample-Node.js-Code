var ControllerMessages = require("./controllerMessages");
var Specializations = require('../utils/Specializations');
var helpers = require('../services/helper')
const upload = require('../services/image-upload');
const singleUpload = upload.single('specs_image');

const specializationsController = {

    uploadImage: async (req, res) => {
        singleUpload(req, res, async (err) => {
            if(!req.file){
                return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.NO_IMAGE), 203);
            }
            let { filename } = req.file;
            return helpers.showOutput(res, helpers.showResponse(true, ControllerMessages.UPLOADED, { filename }), 200);
        });
    },

    addNew: async (req, res) => {
        let requiredFields = ['name', 'image'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Specializations.addNew(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    update: async (req, res) => {
        let requiredFields = ['_id', 'name', 'image'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Specializations.update(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    updateStatus: async (req, res) => {
        let requiredFields = ['_id', 'status'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Specializations.updateStatus(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    deleteData: async (req, res) => {
        let requiredFields = ['_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Specializations.deleteData(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getAllByAdmin: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Specializations.getAll();
        return helpers.showOutput(res, result, result.code);
    },

    // without token
    getAll: async (req, res) => {
        let result = await Specializations.getAll();
        return helpers.showOutput(res, result, result.code);
    }
}

module.exports = {
    ...specializationsController
}