require('../../db_functions');
let Specializations = require('../../models/Specializations');
let ObjectId = require('mongodb').ObjectID;
var Messages = require("./messages");
let helpers = require('../../services/helper')
let moment = require('moment');

const specializationsUtil = {

    addNew: async (data) => {
        let { name, image } = data;
        let result = await getSingleData(Specializations, {name, status: { $ne: 2 }}, '')
        if(result.status){
            return helpers.showResponse(false, Messages.DATA_ALREADY, null, null, 200);
        }
        let newObj = {
            name,
            image,
            created_on: moment().unix()
        };
        let specializationsRef = new Specializations(newObj)
        let response = await postData(specializationsRef);
        if (response.status) {
            return helpers.showResponse(true, Messages.ADD_SUCCESS, null, null, 200);
        }
        return helpers.showResponse(false, Messages.ADD_FAILED, null, null, 200);
    }, 

    update: async (data) => {
        let { _id, name, image } = data;
        let result = await getSingleData(Specializations, {_id: { $ne: ObjectId(_id)}, name, status: { $ne: 2 }}, '')
        if(result.status){
            return helpers.showResponse(false, Messages.DATA_ALREADY, null, null, 200);
        }
        let editObj = {
            name,
            image,
            updated_on: moment().unix()
        };
        let response = await updateData(Specializations, editObj, ObjectId(_id));
        if (response.status) {
            return helpers.showResponse(true, Messages.UPDATE_SUCCESS, null, null, 200);
        }
        return helpers.showResponse(false, Messages.UPDATE_FAILED, null, null, 200);
    }, 

    updateStatus: async (data) => {
        let { _id, status } = data;
        let result = await getSingleData(Specializations, {_id: ObjectId(_id), status: { $ne: 2 }}, '')
        if(!result.status){
            return helpers.showResponse(false, Messages.INVALID_SPECS, null, null, 200);
        }
        let editObj = {
            status,
            updated_on: moment().unix()
        };
        let response = await updateData(Specializations, editObj, ObjectId(_id));
        if (response.status) {
            return helpers.showResponse(true, Messages.UPDATE_SUCCESS, null, null, 200);
        }
        return helpers.showResponse(false, Messages.UPDATE_FAILED, null, null, 200);
    }, 

    getAll: async () => {
        let queryObject = { status: { $ne: 2 } }
        let result = await getDataArray(Specializations, queryObject, '');
        if (result.status) {
            return helpers.showResponse(true, Messages.LIST, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.NO_DATA, null, null, 200);
    },

    deleteData: async (data) => {
        let { _id } = data;
        let editObj = { status: 2, updated_on: moment().unix() }
        let result = await updateData(Specializations, editObj, ObjectId(_id));
        if (result.status) {
            return helpers.showResponse(true, Messages.DELETED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.DELETE_FAILED, null, null, 200);
    }   
}

module.exports = {
    ...specializationsUtil
}