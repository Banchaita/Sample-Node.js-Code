require('../../db_functions');
let Hospitals = require('../../models/Hospitals');
let ObjectId = require('mongodb').ObjectID;
var Messages = require("./messages");
let helpers = require('../../services/helper')
let moment = require('moment');

const hospitalUtils = {

    addNew: async (data) => {
        let { name, images, lat, lon, location } = data;
        let result = await getSingleData(Hospitals, {name, status: { $ne: 2 }}, '')
        if(result.status){
            return helpers.showResponse(false, Messages.DATA_ALREADY, null, null, 200);
        }
        let newObj = {
            name,
            images: images?JSON.parse(images):[],
            address: {location, lat, lon},
            created_on: moment().unix()
        };
        let hospitalsRef = new Hospitals(newObj)
        let response = await postData(hospitalsRef);
        if (response.status) {
            return helpers.showResponse(true, Messages.ADD_SUCCESS, null, null, 200);
        }
        return helpers.showResponse(false, Messages.ADD_FAILED, null, null, 200);
    }, 

    update: async (data) => {
        let { hospital_id, name, images, lat, lon, location } = data;
        let result = await getSingleData(Hospitals, {_id: { $ne: ObjectId(hospital_id)}, name, status: { $ne: 2 }}, '')
        if(result.status){
            return helpers.showResponse(false, Messages.DATA_ALREADY, null, null, 200);
        }
        let editObj = {
            name,
            images: images?JSON.parse(images): [],
            address: {location, lat, lon},
            updated_on: moment().unix()
        };
        let response = await updateData(Hospitals, editObj, ObjectId(hospital_id));
        if (response.status) {
            return helpers.showResponse(true, Messages.UPDATE_SUCCESS, null, null, 200);
        }
        return helpers.showResponse(false, Messages.UPDATE_FAILED, null, null, 200);
    }, 

    updateStatus: async (data) => {
        let { hospital_id, status } = data;
        let result = await getSingleData(Hospitals, {_id: ObjectId(hospital_id), status: { $ne: 2 }}, '')
        if(!result.status){
            return helpers.showResponse(false, Messages.INVALID_ID, null, null, 200);
        }
        let editObj = {
            status,
            updated_on: moment().unix()
        };
        let response = await updateData(Hospitals, editObj, ObjectId(hospital_id));
        if (response.status) {
            return helpers.showResponse(true, Messages.UPDATE_SUCCESS, null, null, 200);
        }
        return helpers.showResponse(false, Messages.UPDATE_FAILED, null, null, 200);
    }, 

    get: async (data) => {
        let { hospital_id } = data
        let queryObject = { _id: ObjectId(hospital_id), status: { $ne: 2 } }
        let result = await getSingleData(Hospitals, queryObject, '');
        if (result.status) {
            return helpers.showResponse(true, Messages.DATA, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_ID, null, null, 200);
    },

    getAll: async () => {
        let queryObject = { status: { $ne: 2 } }
        let result = await getDataArray(Hospitals, queryObject, '');
        if (result.status) {
            return helpers.showResponse(true, Messages.LIST, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.NO_DATA, null, null, 200);
    },

    deleteData: async (data) => {
        let { hospital_id } = data;
        let editObj = { status: 2, updated_on: moment().unix() }
        let result = await updateData(Hospitals, editObj, ObjectId(hospital_id));
        if (result.status) {
            return helpers.showResponse(true, Messages.DELETED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.DELETE_FAILED, null, null, 200);
    }
}

module.exports = {
    ...hospitalUtils
}