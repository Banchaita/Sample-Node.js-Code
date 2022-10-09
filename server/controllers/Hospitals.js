var ControllerMessages = require("./controllerMessages");
var Hospitals = require('../utils/Hospitals');
var helpers = require('../services/helper')
const upload = require('../services/image-upload');
const multipleUpload = upload.array('hospital_images');

const hospitalsController = {

    uploadImages: async (req, res) => {
        multipleUpload(req, res, async (err) => {
            if(!req.files){
                return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.NO_IMAGE), 203);
            }
            let files = []
            req.files.map((file) => {
                files.push(file.filename)
            })
            if(files.length <= 0){
                return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.NO_IMAGE), 203);
            }
            return helpers.showOutput(res, helpers.showResponse(true, ControllerMessages.UPLOADED, files), 200);
        });
    },

    addNew: async (req, res) => {
        let requiredFields = ['name', 'images', 'lat', 'lon', 'location'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Hospitals.addNew(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    update: async (req, res) => {
        let requiredFields = ['hospital_id', 'name', 'images', 'lat', 'lon', 'location'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Hospitals.update(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    updateStatus: async (req, res) => {
        let requiredFields = ['hospital_id', 'status'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Hospitals.updateStatus(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    deleteData: async (req, res) => {
        let requiredFields = ['hospital_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Hospitals.deleteData(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getAllByAdmin: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Hospitals.getAll();
        return helpers.showOutput(res, result, result.code);
    },

    getByAdmin: async (req, res) => {
        let requiredFields = ['hospital_id'];
        let validator = helpers.validateParams(req,requiredFields);
        if(!validator.status){
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if(!admin_id){
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Hospitals.get(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    // without token
    getAll: async (req, res) => {
        let result = await Hospitals.getAll();
        return helpers.showOutput(res, result, result.code);
    }
}

module.exports = {
    ...hospitalsController
}