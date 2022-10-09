require('../../db_functions');
let md5 = require("md5");
let Administration = require('../../models/Administration');
let Users = require('../../models/Users');
let Specializations = require('../../models/Specializations');
let Hospitals = require('../../models/Hospitals');
let ObjectId = require('mongodb').ObjectID;
var Messages = require("./messages");
let jwt = require('jsonwebtoken');
let helpers = require('../../services/helper')
let moment = require('moment');
const nodemailer = require('nodemailer')

const adminUtils = {

    login: async (data) => {
        let { email, password } = data;
        let where = {
            email: email,
            password: md5(password),
            status: { $eq: 1 }
        }
        let result = await getSingleData(Administration, where, '-password');
        if (result.status) {
            let token = jwt.sign({ admin_id: result.data._id }, process.env.API_SECRET, {
                expiresIn: process.env.JWT_EXPIRY
            });
            let data = { token, time: process.env.JWT_EXPIRY };
            return helpers.showResponse(true, Messages.ADMIN_LOGIN_SUCCESS, data, null, 200);
        }
        return helpers.showResponse(false, Messages.ADMIN_LOGIN_FAILED, null, null, 200);
    },

    forgotPasswordMail: async (data) => {
        let { email } = data;
        let queryObject = { email: { $eq: email } }
        let result = await getSingleData(Administration, queryObject, '');
        if (result.status) {
            let otp = helpers.randomStr(4, "1234567890");
            let AdminData = {
                otp,
                updated_at: moment().unix()
            }
            let response = await updateData(Administration, AdminData, ObjectId(result.data._id))
            if (response.status) {
                try {
                    let transporter = nodemailer.createTransport({
                        host: "smtp.sendgrid.net",
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: 'apikey',
                            pass: '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'
                        },
                    });
                    await transporter.sendMail({
                        from: '"Socrates👻" <daisylisette879@gmail.com>', // sender address
                        to: email, // list of receivers
                        subject: "Reset Password Instruction", // Subject line
                        html: "<b>Greetings, </b><br /><br />Here is your 4 Digits verification Code<br />" +
                            "<h2>" + otp + "</h2><br /><br /><label><small>Please use this code to change your password." +
                            "</small></label><br /><br /><label>Thanks & Regards</label><br /><label>Socrates " +
                            "Community</label>", // html body
                    });
                    return helpers.showResponse(true, Messages.FP_EMAIL_SENT, null, null, 200);
                } catch (err) {
                    return helpers.showResponse(false, Messages.EMAIL_ERROR, err, null, 200);
                }
            }
            return helpers.showResponse(false, Messages.SERVER_ERROR, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_ADMIN, null, null, 200);
    },

    forgotChangePassword: async (data) => {
        let { otp, email, password } = data;
        let queryObject = { email, otp, status: { $ne: 2 } }
        let result = await getSingleData(Administration, queryObject, '');
        if (result.status) {
            let AdminData = {
                otp: 0,
                password: md5(password),
                updated_at: moment().unix()
            }
            let response = await updateData(Administration, AdminData, ObjectId(result.data._id));
            if (response.status) {
                return helpers.showResponse(true, Messages.PASSWORD_CHANGED, null, null, 200);
            }
            return helpers.showResponse(false, Messages.INVALID_OTP, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_OTP, null, null, 200);
    },

    changePasswordWithOld: async (data, admin_id) => {
        let { old_password, new_password } = data;
        let result = await getSingleData(Administration, { password: { $eq: md5(old_password) }, _id: ObjectId(admin_id) }, '');
        if (!result.status) {
            return helpers.showResponse(false, Messages.INVALID_OLD, null, null, 200);
        }
        let AdminData = {
            password: md5(new_password),
            updated_at: moment().unix()
        }
        let response = await updateByQuery(Administration, AdminData, { password: { $eq: md5(old_password) }, _id: ObjectId(admin_id) });
        if (response.status) {
            return helpers.showResponse(true, Messages.PASSWORD_CHANGED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.PASSWORD_CHANGE_FAILED, null, null, 200);
    },

    changeAdministratorPassword: async (data) => {
        let { _id, new_password } = data;
        let result = await getSingleData(Administration, { _id: ObjectId(_id) }, '');
        if (!result.status) {
            return helpers.showResponse(false, Messages.INVALID_ADMIN, null, null, 200);
        }
        let AdminData = {
            password: md5(new_password),
            updated_at: moment().unix()
        }
        let response = await updateData(Administration, AdminData, ObjectId(_id));
        if (response.status) {
            return helpers.showResponse(true, Messages.PASSWORD_CHANGED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.PASSWORD_CHANGE_FAILED, null, null, 200);
    },

    changeAdministratorStatus: async (data) => {
        let { admin_id, status } = data;
        let result = await getSingleData(Administration, { _id: ObjectId(admin_id) }, '');
        if (!result.status) {
            return helpers.showResponse(false, Messages.INVALID_ADMIN, null, null, 200);
        }
        let AdminData = {
            status,
            updated_at: moment().unix()
        }
        let response = await updateData(Administration, AdminData, ObjectId(admin_id));
        if (response.status) {
            return helpers.showResponse(true, Messages.ADMIN_UPDATED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.ADMIN_UPDATE_FAILED, null, null, 200);
    },

    getAdminData: async (admin_id) => {
        let result = await getSingleData(Administration, { _id: ObjectId(admin_id) }, '');
        if (result.status) {
            return helpers.showResponse(true, Messages.ADMIN_DATA, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_ADMIN, null, null, 200);
    },

    getAdminById: async (data) => {
        let { _id } = data
        let result = await getSingleData(Administration, { _id: ObjectId(_id) }, '');
        if (result.status) {
            return helpers.showResponse(true, Messages.ADMIN_DATA, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_ADMIN, null, null, 200);
    },

    getAllAdmins: async () => {
        let result = await getDataArray(Administration, { status: { $ne: 2 }, type: {$ne: 'super'}}, '');
        if (result.status) {
            return helpers.showResponse(true, Messages.ADMIN_DATA, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_ADMIN, null, null, 200);
    },

    addNewAdministrator: async (data) => {
        let { name, email, password } = data;
        let queryObject = { email, status: { $ne: 2 } }
        let result = await getSingleData(Administration, queryObject, '');
        if (result.status) {
            return helpers.showResponse(false, Messages.ADMIN_EXIST, result.data, null, 200);
        }
        let adminRef = new Administration({
            name,
            email,
            password: md5(password),
            created_at: moment().unix()
        })
        let response = await postData(adminRef);
        if (response.status) {
            return helpers.showResponse(true, Messages.ADMIN_CREATED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.ADMIN_CREATE_ERROR, null, null, 200);
    },

    updateAdministrator: async (data) => {
        let { _id, name, email } = data;
        let queryObject = { _id: { $ne: ObjectId(_id) }, email, status: { $ne: 2 } }
        let result = await getSingleData(Administration, queryObject, '');
        if (result.status) {
            return helpers.showResponse(false, Messages.ADMIN_EXIST, result.data, null, 200);
        }
        let adminData = {
            name,
            email,
            updated_at: moment().unix()
        }
        let response = await updateData(Administration, adminData, ObjectId(_id));
        if (response.status) {
            return helpers.showResponse(true, Messages.ADMIN_UPDATED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.ADMIN_UPDATE_FAILED, null, null, 200);
    },

    deleteAdministrator: async (data) => {
        let { _id } = data;
        let queryObject = { _id: ObjectId(_id), status: { $ne: 2 } }
        let result = await getSingleData(Administration, queryObject, '');
        if (result.status) {
            let adminData = {
                status: 2,
                updated_at: moment().unix()
            }
            let response = await updateData(Administration, adminData, ObjectId(_id));
            if (response.status) {
                return helpers.showResponse(true, Messages.ADMIN_DELETED, null, null, 200);
            }
            return helpers.showResponse(false, Messages.ADMIN_DELETE_ERROR, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_ADMIN, null, null, 200);
    },

    getDashCount: async () => {
        let data = { 
            total_patients: 0,
            total_providers: 0,
            total_hospitals: 0,
            total_appointments: 0,
            total_categories:0
        }
        let patientCount = await getCount(Users, {role: "patient", status: {$ne: 2 }})
        if(patientCount.status){
            data.total_patients = patientCount.message
        }
        let providerCount = await getCount(Users, {role: "provider", status: {$ne: 2 }})
        if(providerCount.status){
            data.total_providers = providerCount.message
        }
        let hospitalCount = await getCount(Hospitals, {status: {$ne: 2 }})
        if(hospitalCount.status){
            data.total_hospitals = hospitalCount.message
        }
        let specsCount = await getCount(Specializations, {status: {$ne: 2 }})
        if(specsCount.status){
            data.total_categories = specsCount.message
        }
        return helpers.showResponse(true, Messages.DASH_DATA, data, null, 200);
    }
}

module.exports = {
    ...adminUtils
}