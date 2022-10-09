require('../../db_functions');
let md5 = require("md5");
let Users = require('../../models/Users');
let Specializations = require('../../models/Specializations');
let Hospitals = require('../../models/Hospitals');
let ProviderRoles = require('../../models/ProviderRoles');
const Appointments = require('../../models/Appointments');
const ReservedSlots = require('../../models/ReservedSlots');
const Teams = require('../../models/Teams');
let ObjectId = require('mongodb').ObjectID;
var Messages = require("./messages");
let jwt = require('jsonwebtoken');
let helpers = require('../../services/helper')
let moment = require('moment');
let nodemailer = require('nodemailer');

const userUtil = {

    checkEmailExistance: async (data) => {
        let { email } = data;
        if (!helpers.validateEmail(email)) {
            return helpers.showResponse(false, Messages.INVALID_EMAIL_FORMAT, null, null, 200);
        }
        let result = await getSingleData(Users, {
            email,
            status: { $ne: 2 }
        }, '');
        if (result.status) {
            return helpers.showResponse(false, Messages.EMAIL_ALREADY, null, null, 200);
        }
        return helpers.showResponse(true, Messages.NEW_USER, null, null, 200);
    },

    register: async (data) => {
        let { full_name, email, password, country_code, phone, fcm_token, profile_pic, role, education, hospital, bio, provider_role, specializations, start_time, end_time } = data;
        let newObj = {
            full_name,
            email,
            password: md5(password),
            country_code,
            phone,
            profile_pic,
            fcm_token,
            role,
            bio,
            education,
            hospital: hospital ? ObjectId(hospital) : null,
            provider_role,
            specializations: specializations ? ObjectId(specializations) : null,
            start_time,
            end_time,
            login_source: 'email',
            created_on: moment().unix()
        };
        let userRef = new Users(newObj)
        let result = await postData(userRef);
        if (result.status) {
            return helpers.showResponse(true, Messages.REGISTER_SUCCESS, result.data._id, null, 200);
        }
        return helpers.showResponse(false, Messages.REGISTER_FAILED, null, null, 200);
    },

    socialLogin: async (data) => {
        let { login_source, fcm_token } = data
        if (login_source === "social") {
            let { email, full_name, profile_pic } = data
            let emailCheck = await getSingleData(Users, { email: { $eq: email }, status: { $ne: 2 } }, '');
            if (emailCheck.status) {
                // email already exist
                let userObj = {
                    login_source,
                    fcm_token,
                    updated_on: moment().unix()
                }
                if (full_name) {
                    userObj.full_name = full_name
                }
                if (profile_pic) {
                    userObj.profile_pic = profile_pic
                }
                let response = await updateData(Users, userObj, ObjectId(emailCheck.data._id));
                if (response.status) {
                    let token = jwt.sign({ user_id: response.data._id }, process.env.API_SECRET, {
                        expiresIn: process.env.JWT_EXPIRY
                    });
                    return helpers.showResponse(true, Messages.REGISTER_SUCCESS, { userData: response.data, token }, null, 200);
                }
                return helpers.showResponse(false, Messages.REGISTER_FAILED, null, null, 200);
            }
            // register as a new User
            let newObj = {
                full_name: full_name ? full_name : '',
                email,
                profile_pic: profile_pic ? profile_pic : '',
                fcm_token,
                login_source: 'social',
                created_on: moment().unix()
            };
            let userRef = new Users(newObj)
            let result = await postData(userRef);
            if (result.status) {
                let token = jwt.sign({ user_id: result.data._id }, process.env.API_SECRET, {
                    expiresIn: process.env.JWT_EXPIRY
                });
                return helpers.showResponse(true, Messages.REGISTER_SUCCESS, { userData: result.data, token }, null, 200);
            }
            return helpers.showResponse(false, Messages.REGISTER_FAILED, null, null, 200);
        } else if (login_source === "apple") {
            let { auth_token, fcm_token, profile_pic, email } = data;
            let authTokenCheck = await getSingleData(Users, { auth_token: { $eq: auth_token }, status: { $ne: 2 } }, '');
            if (authTokenCheck.status) {
                // auth token already exist
                let userObj = {
                    login_source,
                    fcm_token,
                    updated_on: moment().unix()
                }
                if (profile_pic) {
                    userObj.profile_pic = profile_pic
                }
                let response = await updateData(Users, userObj, ObjectId(authTokenCheck.data._id));
                if (response.status) {
                    let token = jwt.sign({ user_id: response.data._id }, process.env.API_SECRET, {
                        expiresIn: process.env.JWT_EXPIRY
                    });
                    return helpers.showResponse(true, Messages.REGISTER_SUCCESS, { userData: response.data, token }, null, 200);
                }
                return helpers.showResponse(false, Messages.REGISTER_FAILED, null, null, 200);
            }
            // register as a new User
            let newObj = {
                email,
                profile_pic: profile_pic ? profile_pic : '',
                fcm_token,
                login_source: 'social',
                auth_token,
                created_on: moment().unix()
            };
            let userRef = new Users(newObj)
            let result = await postData(userRef);
            if (result.status) {
                let token = jwt.sign({ user_id: result.data._id }, process.env.API_SECRET, {
                    expiresIn: process.env.JWT_EXPIRY
                });
                return helpers.showResponse(true, Messages.REGISTER_SUCCESS, { userData: result.data, token }, null, 200);
            }
            return helpers.showResponse(false, Messages.REGISTER_FAILED, null, null, 200);
        }
    },

    login: async (data) => {
        let { email, password, fcm_token } = data;
        let queryObject = {
            email,
            password: md5(password),
            status: { $eq: 1 }
        }
        let result = await getSingleData(Users, queryObject, '-password');
        if (result.status) {
            let update = await updateData(Users, { fcm_token, updated_on: moment().unix() }, ObjectId(result.data._id));
            if (update.status) {
                let token = jwt.sign({ user_id: result.data._id }, process.env.API_SECRET, {
                    expiresIn: process.env.JWT_EXPIRY
                });
                return helpers.showResponse(true, Messages.LOGIN_SUCCESS, { token }, null, 200);
            }
            return helpers.showResponse(false, Messages.LOGIN_FAILED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.LOGIN_FAILED, null, null, 200);
    },

    forgotPasswordMail: async (data) => {
        let { email } = data;
        let queryObject = { email, status: { $ne: 2 } }
        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            let userData = result.data
            let otp = helpers.randomStr(4, "1234567890")
            let userObj = {
                otp,
                updated_on: moment().unix()
            }
            let update = await updateData(Users, userObj, ObjectId(userData._id));
            if (update.status) {
                try {
                    let transporter = nodemailer.createTransport({
                        host: "smtp.sendgrid.net",
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: "apikey", // generated ethereal user
                            pass: "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", // generated ethereal password
                        },
                    });
                    await transporter.sendMail({
                        from: '"Socrates 👻" <daisylisette879@gmail.com>', // sender address
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
            return helpers.showResponse(false, Messages.FP_EMAIL_ERROR, null, null, 200);
        }
        return helpers.showResponse(false, Messages.FP_EMAIL_ERROR, null, null, 200);
    },

    verifyOtp: async (data) => {
        let { email, otp } = data;
        let queryObject = { email, otp, status: { $ne: 2 } }
        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            return helpers.showResponse(true, Messages.OTP_VERIFIED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_OTP, null, null, 200);
    },

    forgotChangePassword: async (data) => {
        let { email, password } = data;
        let queryObject = { email, status: { $ne: 2 } }
        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            let UserData = {
                password: md5(password),
                updated_on: moment().unix()
            }
            let response = await updateData(Users, UserData, ObjectId(result.data._id));
            if (response.status) {
                return helpers.showResponse(true, Messages.PASSWORD_CHANGED, null, null, 200);
            }
            return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    changePasswordWithOld: async (data, user_id) => {
        let { old_password, new_password } = data;
        let result = await getSingleData(Users, { password: { $eq: md5(old_password) }, _id: ObjectId(user_id) });
        if (!result.status) {
            return helpers.showResponse(false, Messages.PASSWORD_CHANGE_FAILED, null, null, 200);
        }
        let UserData = {
            password: md5(new_password),
            updated_on: moment().unix()
        }
        let response = await updateByQuery(Users, UserData, { password: { $eq: md5(old_password) }, _id: ObjectId(user_id) });
        if (response.status) {
            return helpers.showResponse(true, Messages.PASSWORD_CHANGED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.PASSWORD_CHANGE_FAILED, null, null, 200);
    },

    getUserDetail: async (user_id) => {
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } };
        let populate = [{
            path: 'hospital',
            select: 'name images lat lon location'
        }, {
            path: 'specializations',
            select: 'name'
        }, {
            path: 'notifications.from_user_id',
            select: 'full_name profile_pic fcm_token'
        }, {
            path: 'friends.user_id',
            select: 'full_name profile_pic email'
        }]
        let result = await getSingleData(Users, queryObject, '-password', populate);
        if (result.status) {
            return helpers.showResponse(true, Messages.USER_DATA, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    updateUser: async (data, user_id) => {
        let { role, full_name, email, country_code, phone, profile_pic } = data;
        let userResult = await getSingleData(Users, { _id: ObjectId(user_id), status: { $ne: 2 } }, '')
        if (userResult.status) {
            let userData = userResult.data
            if (userData.email != email) {
                let login_source = userData.login_source
                if (login_source === 'email') {
                    let checkEmail = await getSingleData(Users, { _id: { $ne: ObjectId(user_id) }, email, status: { $ne: 2 } }, '');
                    if (checkEmail.status) {
                        return helpers.showResponse(false, Messages.EMAIL_ALREADY, null, null, 200);
                    }
                } else {
                    return helpers.showResponse(false, Messages.NO_EMAIL_CHANGE, null, null, 200);
                }
            }
            let UserData = {
                role,
                full_name,
                email,
                country_code,
                phone,
                updated_on: moment().unix()
            }
            if (!profile_pic) {
                UserData.profile_pic = profile_pic
            }
            if (role == "provider") {
                let { education, provider_role, hospital, bio, start_time, end_time } = data;
                UserData.provider_role = provider_role,
                UserData.education = education
                UserData.hospital = ObjectId(hospital)
                UserData.bio = bio
                UserData.start_time = start_time
                UserData.end_time = end_time
                if (provider_role == "doctor") {
                    let { specializations, start_time, end_time } = data;
                    UserData.specializations = ObjectId(specializations)
                }
            }
            let result = await updateData(Users, UserData, ObjectId(user_id));
            if (result.status) {
                return helpers.showResponse(true, Messages.USER_UPDATED, result.data._id, null, 200);
            }
            return helpers.showResponse(false, Messages.USER_UPDATE_FAILED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    updateUserDetails: async (data, user_id) => {
        let response = await updateData(Users, data, ObjectId(user_id));
        if (response.status) {
            return helpers.showResponse(true, Messages.USER_UPDATED, data, null, 200);
        }
        return helpers.showResponse(false, Messages.USER_UPDATE_FAILED, null, null, 200);
    },

    logout: async (user_id) => {
        let userDataObj = {
            fcm_token: '',
            updated_on: moment().unix()
        }
        let response = await updateData(Users, userDataObj, ObjectId(user_id));
        if (response.status) {
            return helpers.showResponse(true, Messages.LOGOUT, response.data, null, 200);
        }
        return helpers.showResponse(false, Messages.LOGOUT_FAILED, null, null, 200);
    },

    getHomeData: async (user_id) => {
        let finalHospitals = []
        let categories = []
        let appointments = []
        let sort = { created_on: -1 }
        let pagination = { skip: 0, limit: 4 }
        let userResult = await getSingleData(Users, { _id: ObjectId(user_id), status: { $ne: 2 } }, '');
        if (userResult.status) {
            let userData = userResult.data
            let userLat = userData.lat
            let userLon = userData.lon
            let hospitalsResult = await getDataArray(Hospitals, { status: { $ne: 2 } }, '', null, sort);
            if (hospitalsResult.status) {
                let hospitals = hospitalsResult.data
                let hospitalsCount = 0
                for (let i = 0; i < hospitals.length; i++) {
                    let hospital = hospitals[i]
                    let distance = helpers.getDistanceFromLatLonInKm(userLat, userLon, hospital.address.lat, hospital.address.lon).toFixed(2)
                    if (distance <= 10000 && hospitalsCount <= 4) {
                        hospital.distance = distance
                        finalHospitals.push(hospital)
                        hospitalsCount++
                    }
                }
                // sort doc list by distance from low to high
                finalHospitals = finalHospitals.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
            }
            // categories
            let queryObj = { status: { $ne: 2 } }
            let categoriesResult = await getDataArray(Specializations, queryObj, '', pagination, sort);
            if (categoriesResult.status) {
                categories = categoriesResult.data
            }
            // appointments
            let appQueryObj = { user_id: ObjectId(user_id), is_completed: 0, status: { $ne: 2 } }
            let app_sort = { appoint_start: -1 }
            let app_populate = [{
                path: 'user_id',
                select: 'full_name profile_pic'
            }, {
                path: 'doctor_id',
                select: 'full_name profile_pic',
                populate: [{
                    path: 'specializations',
                    select: 'name image'
                }, {
                    path: 'hospital',
                    select: 'name images address'
                }]
            }, {
                path: 'providers.user_id',
                select: 'full_name profile_pic provider_role',
                populate: [{
                    path: 'specializations',
                    select: 'name image'
                }, {
                    path: 'hospital',
                    select: 'name images address'
                }]
            }]
            let appointmentResult = await getDataArray(Appointments, appQueryObj, '', pagination, app_sort, app_populate);
            if (appointmentResult.status) {
                appointments = appointmentResult.data
            }
            return helpers.showResponse(true, Messages.HOME_DATA, { hospitals: finalHospitals, categories, appointments }, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    getMembers: async (user_id) => {
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } };
        let populate = [{
            path: 'hospital',
            select: 'name images lat lon location'
        }, {
            path: 'specializations',
            select: 'name'
        }, {
            path: 'notifications.user_id',
            select: 'full_name profile_pic email'
        }, {
            path: 'friends.user_id',
            select: 'full_name profile_pic email'
        }]
        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            let hospital_id = result.data.hospital
            let sort = { created_on: -1 }
            let hospQuery = { _id: { $ne: ObjectId(user_id) }, role: 'provider', hospital: ObjectId(hospital_id), status: { $ne: 2 } }
            let membersResult = await getDataArray(Users, hospQuery, '-password', null, sort, populate);
            if (membersResult.status) {
                return helpers.showResponse(true, Messages.MEMBERS_DATA, membersResult.data, null, 200);
            }
            return helpers.showResponse(false, Messages.NO_DATA, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    sendFriendRequest: async (data, sender_id) => {
        let { receiver_id } = data
        if (sender_id == receiver_id) {
            return helpers.showResponse(false, Messages.SELF_F_REQ, null, null, 200);
        }
        //receiver
        let rec_queryObject = { _id: ObjectId(receiver_id), role: "provider", status: { $ne: 2 } }
        let rec_result = await getSingleData(Users, rec_queryObject, '');
        if (!rec_result.status) {
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        }
        let rec_data = rec_result.data
        //sender
        let sen_queryObject = { _id: ObjectId(sender_id), role: "provider", status: { $ne: 2 } }
        let sen_result = await getSingleData(Users, sen_queryObject, '');
        if (!sen_result.status) {
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        }
        let sen_data = sen_result.data
        // now logic
        let sender_friends = sen_data.friends
        let recIndex = sender_friends.findIndex((sf) => sf.user_id == receiver_id)
        if (recIndex < 0) {
            let senObj = {
                user_id: ObjectId(receiver_id),
                request_type: 'out',
                request_status: 0,
                friend_since: ''
            }
            sender_friends.push(senObj)
            let editObj = {
                friends: sender_friends,
                updated_on: moment().unix()
            }
            let response = await updateData(Users, editObj, ObjectId(sender_id));
            if (response.status) {
                // add information on receiver side
                let rec_friends = rec_data.friends
                let recObj = {
                    user_id: ObjectId(sender_id),
                    request_type: 'in',
                    request_status: 0,
                    friend_since: ''
                }
                rec_friends.push(recObj)
                let recEditObj = {
                    friends: rec_friends,
                    updated_on: moment().unix()
                }
                await updateData(Users, recEditObj, ObjectId(receiver_id));
                // now send notification to receiver
                let notifData = {
                    title: 'New Member Request',
                    message: 'You have a new member request from ' + sen_data.full_name,
                    click_action: "DoctorHome",
                    type: 'on_friend_request_recieve',
                    sender_data: { sender_id, full_name: sen_data.full_name, profile_pic: sen_data.profile_pic },
                }
                let notification_data = { sender_id, full_name: sen_data.full_name, profile_pic: sen_data.profile_pic }
                let notification_id = await userUtil.addToNotifications({ from_user_id: ObjectId(sender_id), type: 'friend_request', text: notifData.message, notification_data }, receiver_id)
                notifData.notification_id = notification_id
                helpers.sendFcmNotification(rec_data.fcm_token, notifData, true)
                return helpers.showResponse(true, Messages.FRIEND_REQ_SENT, null, null, 200);
            }
            return helpers.showResponse(false, Messages.FRIEND_REQ_SEND_ERROR, null, null, 200);
        }
        return helpers.showResponse(false, Messages.FRIEND_REQ_ALREADY, null, null, 200);
    },

    cancelFriendRequest: async (data, sender_id) => {
        let { receiver_id } = data
        if (sender_id == receiver_id) {
            return helpers.showResponse(false, Messages.SELF_F_REQ, null, null, 200);
        }
        //receiver
        let rec_queryObject = { _id: ObjectId(receiver_id), role: "provider", status: { $ne: 2 } }
        let rec_result = await getSingleData(Users, rec_queryObject, '');
        if (!rec_result.status) {
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        }
        let rec_data = rec_result.data
        //sender
        let sen_queryObject = { _id: ObjectId(sender_id), role: "provider", status: { $ne: 2 } }
        let sen_result = await getSingleData(Users, sen_queryObject, '');
        if (!sen_result.status) {
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        }
        let sen_data = sen_result.data
        // now logic
        let sender_friends = sen_data.friends
        let recIndex = sender_friends.findIndex((sf) => sf.user_id == receiver_id)
        if (recIndex >= 0) {
            sender_friends.splice(recIndex, 1)
            let editObj = {
                friends: sender_friends,
                updated_on: moment().unix()
            }
            let response = await updateData(Users, editObj, ObjectId(sender_id));
            if (response.status) {
                // remove information from receiver side
                let rec_friends = rec_data.friends
                let senIndex = rec_friends.findIndex((rf) => rf.user_id == sender_id)
                rec_friends.splice(senIndex, 1)
                let recEditObj = {
                    friends: rec_friends,
                    updated_on: moment().unix()
                }
                await updateData(Users, recEditObj, ObjectId(receiver_id));
                // now remove local notification from receiver
                let rec_notifications = rec_data.notifications
                let notificationArray = rec_notifications.filter((rec_noti) => {
                    return rec_noti.from_user_id == sender_id && rec_noti.notification_type == 'friend_request'
                })
                for (var i = 0; i < notificationArray.length; i++) {
                    let notification_id = notificationArray[i]._id
                    await userUtil.removeNotifications({ notification_id: ObjectId(notification_id) }, receiver_id)
                }
                return helpers.showResponse(true, Messages.FRIEND_REQ_CANCELLED, null, null, 200);
            }
            return helpers.showResponse(false, Messages.FRIEND_REQ_CANCEL_ERROR, null, null, 200);
        }
        return helpers.showResponse(false, Messages.NO_FRIEND_REQUEST, null, null, 200);
    },

    respondToFriendRequest: async (data, receiver_id) => {
        let { sender_id, action, notification_id } = data
        let rec_queryObject = { _id: ObjectId(receiver_id), status: { $ne: 2 } }
        let rec_result = await getSingleData(Users, rec_queryObject, '');
        if (!rec_result.status) {
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        }
        let rec_data = rec_result.data
        let sen_queryObject = { _id: ObjectId(sender_id), status: { $ne: 2 } }
        let sen_result = await getSingleData(Users, sen_queryObject, '');
        if (!sen_result.status) {
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        }
        let sen_data = sen_result.data
        let sen_friends = sen_data.friends
        let recIndex = sen_friends.findIndex((sf) => sf.user_id == receiver_id && sf.request_status == 0)
        if (recIndex >= 0) {
            if (action == 1) {
                sen_friends[recIndex].request_status = 1
                sen_friends[recIndex].friend_since = moment().unix()
            } else {
                sen_friends.splice(recIndex, 1)
            }
            let editObj = {
                friends: sen_friends,
                updated_on: moment().unix()
            }
            let response = await updateData(Users, editObj, ObjectId(sender_id));
            if (response.status) {
                notifData = {
                    title: 'Member Request Accepted',
                    message: helpers.capitalize(rec_data.full_name) + ' accepted your member request',
                    click_action: "OPEN_ACTIVITY_1",
                    type: 'friend_request_accepted'
                }
                if (action == 2) {
                    notifData = {
                        title: 'Member Request Declined',
                        message: helpers.capitalize(rec_data.full_name) + ' rejected your member request',
                        click_action: "OPEN_ACTIVITY_1",
                        type: 'friend_request_rejected'
                    }
                }
                helpers.sendFcmNotification(sen_data.fcm_token, notifData)
                if (action == 1) {
                    let notification_data = null
                    userUtil.addToNotifications({ from_user_id: ObjectId(receiver_id), type: 'normal', text: notifData.message, notification_data }, sender_id)
                }
                // add information on receiver side
                let rec_friends = rec_data.friends
                let senIndex = rec_friends.findIndex((rf) => rf.user_id == sender_id && rf.request_status == 0)
                if (senIndex >= 0) {
                    if (action == 1) {
                        rec_friends[senIndex].request_status = 1
                        rec_friends[senIndex].friend_since = moment().unix()
                    } else {
                        rec_friends.splice(senIndex, 1)
                    }
                    let recEditObj = {
                        friends: rec_friends,
                        updated_on: moment().unix()
                    }
                    await updateData(Users, recEditObj, ObjectId(receiver_id));
                    if (action == 1) {
                        if (notification_id) {
                            await userUtil.removeNotifications({ notification_id: ObjectId(notification_id) }, receiver_id)
                        } else {
                            // find notification_id
                            let notifications = rec_data.notifications.filter((notification) => notification.from_user_id.toHexString() == sender_id && notification.notification_type == 'friend_request')
                            for (let n = 0; n < notifications.length; n++) {
                                await userUtil.removeNotifications({ notification_id: ObjectId(notifications[n]._id) }, receiver_id)
                            }
                        }
                        await userUtil.addToNotifications({ from_user_id: ObjectId(sender_id), type: 'normal', text: helpers.capitalize(sen_data.full_name) + ' is added as your member', notification_data: null }, receiver_id)
                    } else if (action == 2) {
                        if (notification_id) {
                            await userUtil.removeNotifications({ notification_id: ObjectId(notification_id) }, receiver_id)
                        } else {
                            // find notification_id
                            let notifications = rec_data.notifications.filter((notification) => notification.from_user_id.toHexString() == sender_id && notification.notification_type == 'friend_request')
                            for (let n = 0; n < notifications.length; n++) {
                                await userUtil.removeNotifications({ notification_id: ObjectId(notifications[n]._id) }, receiver_id)
                            }
                        }
                    }
                    return helpers.showResponse(true, action == 1 ? Messages.FRIEND_REQ_ACCEPT_ACTION : Messages.FRIEND_REQ_DECLINE_ACTION, null, null, 200);
                }
                return helpers.showResponse(false, Messages.FR_REQ_CANCELLED, null, null, 200);
            }
            return helpers.showResponse(false, Messages.SERVER_ERROR, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_FR_REQ, null, null, 200);
    },

    unFriendUser: async (data, user_id) => {
        let { req_user_id } = data
        let req_queryObject = { _id: ObjectId(req_user_id), status: { $ne: 2 } }
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } }
        let req_result = await getSingleData(Users, req_queryObject, '');
        if (req_result.status) {
            let req_data = req_result.data
            let result = await getSingleData(Users, queryObject, '');
            if (result.status) {
                let user_data = result.data
                let friends = user_data.friends;
                let reqIndex = friends.findIndex((f) => f.user_id == req_user_id && f.request_status == 1)
                if (reqIndex >= 0) {
                    friends.splice(reqIndex, 1)
                    let editObj = {
                        friends,
                        updated_on: moment().unix()
                    }
                    let response = await updateData(Users, editObj, ObjectId(user_id));
                    if (response.status) {
                        // now remove my detail from requested user game budies
                        let req_friends = req_data.friends
                        let myIndex = req_friends.findIndex((rf) => rf.user_id == user_id && rf.request_status == 1)
                        if (myIndex >= 0) {
                            req_friends.splice(myIndex, 1)
                            let reqEditObj = {
                                friends: req_friends,
                                updated_on: moment().unix()
                            }
                            let response2 = await updateData(Users, reqEditObj, ObjectId(req_user_id));
                            if (response2.status) {
                                // now send update friend list notification
                                let notifData = {
                                    title: '',
                                    message: '',
                                    click_action: "OPEN_ACTIVITY_1",
                                    type: 'update_friends_list'
                                }
                                helpers.sendFcmNotification(req_data.fcm_token, notifData)
                                return helpers.showResponse(true, Messages.UNFRIEND_SUCCESS, null, null, 200);
                            }
                            return helpers.showResponse(false, Messages.UNFRIEND_ERROR, null, null, 200);
                        }
                        return helpers.showResponse(false, Messages.NO_FRIEND_AT_ALL, null, null, 200);
                    }
                    return helpers.showResponse(false, Messages.SERVER_ERROR, null, null, 200);
                }
                return helpers.showResponse(false, Messages.NO_FRIEND_AT_ALL, null, null, 200);
            }
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
    },

    addToNotifications: async (data, user_id) => {
        let { from_user_id, type, text, notification_data } = data
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } }
        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            let user_data = result.data
            let notifications = user_data.notifications
            let notiObject = {
                _id: ObjectId(),
                from_user_id: ObjectId(from_user_id ? from_user_id : null),
                notification_type: type,
                is_read: 0,
                text,
                notification_data: notification_data ? notification_data : {},
                created_on: moment().unix()
            }
            notifications.push(notiObject);
            let editObj = {
                notifications,
                updated_on: moment().unix()
            }
            let response = await updateData(Users, editObj, ObjectId(user_id));
            if (response.status) {
                return notiObject._id
            }
            return false
        }
        return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
    },

    removeNotifications: async (data, user_id) => {
        let { notification_id } = data
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } }
        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            let user_data = result.data
            let notifications = user_data.notifications
            let idx = notifications.findIndex((notification) => notification._id.toHexString() == notification_id.toHexString())
            if (idx >= 0) {
                notifications.splice(idx, 1)
            }
            let editObj = {
                notifications,
                updated_on: moment().unix()
            }
            let response = await updateData(Users, editObj, ObjectId(user_id));
            if (response.status) {
                return true
            }
            return false
        }
        return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
    },

    getUsersData: async (data, user_id) => {
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } };
        let populate = [{
            path: 'hospital',
            select: 'name images lat lon location'
        }, {
            path: 'specializations',
            select: 'name'
        }]
        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            let usersArray = []
            let { users } = data
            users = (typeof users) === 'string' ? JSON.parse(users) : users
            for (let i = 0; i < users.length; i++) {
                let user = users[i]
                let userResp = await getSingleData(Users, { _id: ObjectId(user) }, 'full_name profile_pic hospital specializations', populate);
                if (userResp.status) {
                    usersArray.push(userResp.data)
                }
            }
            if (usersArray.length > 0) {
                return helpers.showResponse(true, Messages.USER_DATA, usersArray, null, 200);
            }
            return helpers.showResponse(false, Messages.NO_USERS, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    getMyFriends: async (user_id) => {
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } };
        let populate = [{
            path: 'friends.user_id',
            select: 'full_name profile_pic phone hospital specializations',
            populate: [{
                path: 'hospital',
                select: 'name images address'
            }, {
                path: 'specializations',
                select: 'name iamge'
            }]
        }]
        let result = await getSingleData(Users, queryObject, 'friends', populate);
        if (result.status) {
            return helpers.showResponse(true, Messages.FRIEND_LIST, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    NotifyOtherUser: async (data, user_id) => {
        let fcm_tokens = []
        let { req_user_ids, payload } = data;
        req_user_ids = typeof req_user_ids == 'string' ? JSON.parse(req_user_ids) : req_user_ids
        for (let i = 0; i < req_user_ids.length; i++) {
            let req_user_id = req_user_ids[i]
            let queryObject = { _id: ObjectId(req_user_id), status: { $ne: 2 } };
            let result = await getSingleData(Users, queryObject, '');
            if (result.status) {
                let userData = result.data
                if (userData.fcm_token != "") {
                    fcm_tokens.push(userData.fcm_token)
                }
            }
        }
        if (fcm_tokens.length > 0) {
            payload = typeof payload == 'string' ? JSON.parse(payload) : payload
            let response = await helpers.sendFcmNotificationMultiple(fcm_tokens, payload, true)
            if (response.success) {
                return helpers.showResponse(true, 'Notification sent', null, null, 200);
            }
            return helpers.showResponse(false, 'Error while sending notification', null, null, 200);
        }
        return helpers.showResponse(false, 'No tokens of Users', null, null, 200);
    },

    getDoctorBySpecs: async (data, user_id) => {
        let userQuery = { _id: ObjectId(user_id), role: "patient", status: { $ne: 2 } }
        let userResult = await getSingleData(Users, userQuery, '-password');
        if (userResult.status) {
            let userData = userResult.data
            if (userData.lat == "" || userData.lon == "") {
                return helpers.showResponse(false, Messages.NO_USER_LOC, null, null, 200);
            }
            let { specialization_id } = data;
            let queryObject = { role: 'provider', provider_role: 'doctor', specializations: ObjectId(specialization_id), status: { $ne: 2 } };
            let populate = [{
                path: 'hospital',
                select: 'name images address distance'
            }, {
                path: 'specializations',
                select: 'name'
            }]
            let result = await getDataArray(Users, queryObject, '-password -friends -notifications', null, null, populate);
            if (result.status) {
                let doctors = result.data
                for (let i = 0; i < doctors.length; i++) {
                    let distance = helpers.getDistanceFromLatLonInKm(userData.lat, userData.lon, doctors[i].hospital.address.lat, doctors[i].hospital.address.lon)
                    doctors[i].hospital.distance = parseFloat(distance.toFixed(2));
                }
                return helpers.showResponse(true, Messages.DOCTORS_LIST, doctors, null, 200);
            }
            return helpers.showResponse(false, Messages.NO_DOCTOR, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    getDoctorsOfHospital: async (data) => {
        let { hospital_id } = data;
        let queryObject = { role: 'provider', provider_role: 'doctor', hospital: ObjectId(hospital_id), status: { $ne: 2 } };
        let populate = [{
            path: 'hospital',
            select: 'name images address distance'
        }, {
            path: 'specializations',
            select: 'name'
        }]
        let result = await getDataArray(Users, queryObject, '-password -friends -notifications', null, null, populate);
        if (result.status) {
            return helpers.showResponse(true, Messages.DOCTORS_LIST, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.NO_DOCTOR_IN_HOSP, null, null, 200);
    },

    getOtherUserData: async (user_id) => {
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } };
        let populate = [{
            path: 'hospital',
            select: 'name images address'
        }, {
            path: 'specializations',
            select: 'name image'
        }, {
            path: 'reviews.user_id',
            select: 'full_name profile_pic'
        }]
        let result = await getSingleData(Users, queryObject, '-password -friends -notifications', populate);
        if (result.status) {
            return helpers.showResponse(true, Messages.USER_DATA, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    // slots management 
    getAvailableTimeSlots: async (data) => {
        let { doctor_id, selected_date } = data;
        let queryObject = { role: 'provider', provider_role: 'doctor', _id: ObjectId(doctor_id), status: { $ne: 2 } };
        let populate = [{
            path: 'hospital',
            select: 'name images address distance'
        }, {
            path: 'specializations',
            select: 'name'
        }]
        let result = await getSingleData(Users, queryObject, '-password -friends -notifications', populate);
        if (result.status) {
            let doctorData = result.data
            let start_time = doctorData.start_time
            let end_time = doctorData.end_time
            if (!start_time || !end_time) {
                return helpers.showResponse(false, Messages.NO_WORKING_HOURS, null, null, 200);
            }
            let availableSlots = []
            let start_ts = Date.parse(selected_date + " " + start_time) / 1000
            let end_ts = Date.parse(selected_date + " " + end_time) / 1000
            let mins = (end_ts - start_ts) / 60
            let slots = Math.round(mins / 30)
            for (let i = 0; i < slots; i++) {
                if (start_ts > (Math.floor(new Date().valueOf() / 1000))) {
                    let slotObj = {
                        start_time: start_ts,
                        end_time: i == (slots - 1) ? start_ts + (end_ts - start_ts) : start_ts + 1799,
                        is_booked: 0,
                        is_reserved_by_admin: 0,
                        human_start_time: moment(start_ts * 1000).format('hh:mm A'),
                        human_end_time: moment((i == (slots - 1) ? start_ts + (end_ts - start_ts) : start_ts + 1799) * 1000).format('hh:mm A')
                    }
                    // check this slot with appointments
                    slotObj = await userUtil.checkIsSlotBooked(slotObj, doctor_id)
                    availableSlots.push(slotObj)
                }
                start_ts = start_ts + 1800
            }
            if (availableSlots.length > 0) {
                return helpers.showResponse(true, Messages.AVAILABLE_TS, availableSlots, null, 200);
            }
            return helpers.showResponse(false, Messages.NO_DATA, null, null, 200);
        }
        return helpers.showResponse(false, Messages.NO_DATA, null, null, 200);
    },

    checkIsSlotBooked: async (slotObj, doctor_id) => {
        let queryObject = {
            $and:[{
                doctor_id: ObjectId(doctor_id)
            }, {
                $or: [{ status: 0 }, { status: 1 }]
            }, {
                $or: [{
                    $and: [{
                        appoint_start: { $lte: slotObj.start_time }
                    }, {
                        appoint_end: { $gt: slotObj.start_time }
                    }]
                }, {
                    $and: [{
                        appoint_start: { $lte: slotObj.end_time }
                    }, {
                        appoint_end: { $gt: slotObj.end_time }
                    }]
                }]
            }]
        }
        let appointmentsResponse = await getSingleData(Appointments, queryObject, '', [{path: 'user_id', select: 'full_name profile_pic country_code phone'}])
        if (appointmentsResponse.status) {
            slotObj.is_booked = 1;
            slotObj.appointment_data = appointmentsResponse.data
            return slotObj
        }
        // check slots reserved by admin
        let resQueryObject = {
            doctor_id: ObjectId(doctor_id),
            status: { $ne: 2 },
            $or: [{
                $and: [{
                    start_time: { $lte: slotObj.start_time }
                }, {
                    end_time: { $gt: slotObj.start_time }
                }]
            }, {
                $and: [{
                    start_time: { $lte: slotObj.end_time }
                }, {
                    end_time: { $gt: slotObj.end_time }
                }]
            }],
        }
        let reservedResponse = await getSingleData(ReservedSlots, resQueryObject, '')
        if (reservedResponse.status) {
            slotObj.is_reserved_by_admin = 1;
            slotObj.reservation_data = reservedResponse.data;
            return slotObj
        }
        return slotObj
    },

    reserveSlotByDoctor: async (data, user_id) => {
        let { start_time, end_time, reservation_id } = data
        if (reservation_id) {
            let result = await getSingleData(ReservedSlots, { _id: ObjectId(reservation_id) }, '')
            if (result.status) {
                let editObj = {
                    status: 2,
                    updated_on: moment().unix()
                }
                let response = await updateData(ReservedSlots, editObj, ObjectId(reservation_id))
                if (response.status) {
                    return helpers.showResponse(true, 'Slot Released Successfully', null, null, 200);
                }
                return helpers.showResponse(true, 'Invalid Slot Identifier', null, null, 200);
            }
            return helpers.showResponse(true, 'Invalid Slot Identifier', null, null, 200);
        } else {
            let resRef = new ReservedSlots({
                doctor_id: ObjectId(user_id),
                start_time,
                end_time,
                created_on: moment().unix()
            })
            let insertResponse = await postData(resRef)
            if (insertResponse.status) {
                return helpers.showResponse(true, 'Slot Reserved Successfully', null, null, 200);
            }
            return helpers.showResponse(false, 'Unable to reserve slot at the moment', null, null, 200);
        }
    },

    freezeAppointment: async (data, user_id) => {
        let { start_time, end_time, doctor_id, appointment_type, appointment_amount } = data;
        let userResponse = await getSingleData(Users, { _id: ObjectId(user_id), status: { $ne: 2 }}, '-password')
        if(!userResponse.status){
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        }
        let userData = userResponse.data
        if(userData.role != "patient"){
            return helpers.showResponse(false, 'Only patient is allowed to book an appointment', null, null, 200);
        }
        let doctorResponse = await getSingleData(Users, { _id: ObjectId(doctor_id), status: { $ne: 2 }}, '-password')
        if(!doctorResponse.status){
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        }
        let doctorData = doctorResponse.data
        let providers = []
        let teamResponse = await getSingleData(Teams, { doctor_id: ObjectId(doctor_id) }, '')
        if(teamResponse.status){
            providers = teamResponse.data.members
        }
        let appRef = new Appointments({
            user_id: ObjectId(user_id),
            doctor_id: ObjectId(doctor_id),
            appointment_type,
            appointment_amount,
            appoint_start: start_time,
            appoint_end: end_time,
            providers,
            created_on: moment().unix()
        })
        let response = await postData(appRef)
        if (response.status) {
            // send notification to doctor
            let notifData = {
                title: 'New Appointment Request',
                message: 'You have a new appointment request from ' + userData.full_name,
                click_action: "Appointment",
                type: 'appointment_request',
                data: { appointment_id: response.data._id }
            }
            helpers.sendFcmNotification(doctorData.fcm_token, notifData, true)
            await userUtil.addToNotifications({ from_user_id: ObjectId(user_id), type: 'appointment_request', notifData }, doctor_id)
            return helpers.showResponse(true, 'Appointment freezed Successfully', response.data._id, null, 200);
        }
        return helpers.showResponse(false, 'Unable to create appointment at the moment', null, null, 200);
    },

    respondToAppointmentRequest: async (data, user_id) => {
        let { appointment_id, decision } = data;
        let userResponse = await getSingleData(Users, { _id: ObjectId(user_id), status: { $ne: 2 }}, '')
        if(!userResponse.status){
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        }
        let userData = userResponse.data
        let appResponse = await getSingleData(Appointments, { _id: ObjectId(appointment_id), status: { $eq: 0 }}, '', [{path: 'doctor_id', select: 'fcm_token'}])
        if(!appResponse.status){
            return helpers.showResponse(false, Messages.INVALID_APP_ID, null, null, 200);
        }
        let editObj = {
            updated_on: moment().unix()
        }
        if(userData.role == "patient"){
            if(decision == 1 || decision == 3){
                editObj.status = decision
            } else {
                return helpers.showResponse(false, 'Wrong decision by patient', null, null, 200);
            }
        } else if(userData.role == 'provider' && userData.provider_role == 'doctor') {
            if(decision == 1){
                editObj.status = decision
            } else if(decision == 2){
                let { appoint_start, appoint_end } = data
                editObj.appoint_start = appoint_start
                editObj.appoint_end = appoint_end
                editObj.status = decision
            } else {
                return helpers.showResponse(false, 'Wrong decision by doctor', null, null, 200);
            }
        } else {
            return helpers.showResponse(false, 'You are not allowed to perform this operation', null, null, 200);
        }
        let response = await updateData(Appointments, editObj, ObjectId(appointment_id))
        if (response.status) {
            if(userData.role == "patient"){
                // send notification to doctor
                let notifData = {
                    title: decision == 1?'ReSchedule Appointment Accepted':'ReSchedule Appointment Rejected',
                    message: decision == 1?'Your appointment rechedule request to patient has been accepted':'Your appointment rechedule to patient has been declined by patient',
                    click_action: "Appointment",
                    type: decision == 1?'appointment_reschedule_accepted': 'appointment_reschedule_rejected',
                    data: { appointment_data: appResponse.data }
                }
                helpers.sendFcmNotification(appResponse.data.doctor_id.fcm_token, notifData, true)
                await userUtil.addToNotifications({ from_user_id: ObjectId(user_id), type: decision == 1?'appointment_reschedule_accepted': 'appointment_reschedule_rejected', notifData }, appResponse.data.doctor_id._id)
            } else if(userData.role == "provider" && userData.provider_role == 'doctor'){
                let notifData = {
                    title: decision == 1?'Appointment Request Accepted':'Appointment Request Rejected',
                    message: decision == 1?'Your appointment request has been accepted by doctor':'Your appointment request has been rescheduled to another time by doctor',
                    click_action: "Appointment",
                    type: decision == 1?'appointment_request_accepted': 'appointment_request_rejected',
                    data: { appointment_data: appResponse.data }
                }
                helpers.sendFcmNotification(userData.fcm_token, notifData, true)
                await userUtil.addToNotifications({ from_user_id: ObjectId(appResponse.data.doctor_id._id), type: decision == 1?'appointment_request_accepted': 'appointment_request_rejected', notifData }, user_id)
            }
            return helpers.showResponse(true, 'Appointment updated successfully', response.data._id, null, 200);
        }
        return helpers.showResponse(false, 'Unable to create appointment at the moment', null, null, 200);
    },

    addProviderToAppointment: async (data) => {
        let { appointment_id, provider_id } = data;
        let appResponse = await getSingleData(Appointments, { _id: ObjectId(appointment_id), status: { $eq: 1 }})
        if(!appResponse.status){
            return helpers.showResponse(false, 'Appointment is no longer available', null, null, 200);
        }
        let appData = appResponse.data
        let providers = appData.providers
        let pIndex = providers.findIndex((provider) => provider.user_id.toHexString() == provider_id)
        if(pIndex>=0){
            return helpers.showResponse(false, 'Provider is already in the appointment', null, null, 200);
        }
        providers.push({user_id: ObjectId(provider_id)})
        let editObj = {
            providers,
            updated_on: moment().unix()
        }
        let response = await updateData(Appointments, editObj, ObjectId(appointment_id))
        if (response.status) {
            return helpers.showResponse(true, 'Appointment updated Successfully', response.data, null, 200);
        }
        return helpers.showResponse(false, 'Unable to update appointment at the moment', null, null, 200);
    },

    rateProvider: async (data, user_id) => {
        try {
            let { provider_id, rating, review } = data;
            let userQueryObj = { _id: ObjectId(user_id), status: { $ne: 2 }, role: "patient" }
            let userResponse = await getSingleData(Users, userQueryObj, '')
            if (userResponse.status) {
                let providerQueryObj = { _id: ObjectId(provider_id), status: { $ne: 2 } }
                let providerResponse = await getSingleData(Users, providerQueryObj, '')
                if (providerResponse.status) {
                    let providerData = providerResponse.data
                    let reviews = providerData.reviews
                    let reviewObj = {
                        user_id: ObjectId(user_id),
                        rating,
                        review
                    }
                    reviews.push(reviewObj)
                    let rate_sum = 0
                    reviews.forEach((review) => {
                        rate_sum += review.rating
                    })
                    let avg_rating = parseFloat(rate_sum/(reviews.length)).toFixed(1)
                    let editObj = {
                        reviews,
                        rating: avg_rating,
                        updated_on: moment().unix()
                    }
                    let updateResponse = await updateData(Users, editObj, ObjectId(provider_id))
                    if (updateResponse.status) {
                        return helpers.showResponse(true, Messages.RATE_SUCCESS, null, null, 200);
                    }
                    return helpers.showResponse(false, Messages.SERVER_ERROR, null, null, 200);
                }
                return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
            }
            return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
        } catch (err) {
            console.log("errrr", err)
        }
    },

    getMyAppointments: async (user_id) => {
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } }
        let populate = [{
            path: 'specializations',
            select: 'name image'
        }, {
            path: 'hospital',
            select: 'name images address'
        }]
        let result = await getSingleData(Users, queryObject, '', populate);
        if (result.status) {
            let userData = result.data
            let role = userData.role
            let provider_role = userData.provider_role
            let appQueryObject = null
            if (role == "patient") {
                appQueryObject = { user_id: ObjectId(user_id)}
            } else if (role == "provider" && provider_role == "doctor") {
                appQueryObject = { $or: [{ doctor_id: ObjectId(user_id) }, { providers: { $elemMatch: { user_id: ObjectId(user_id) } } }]}
            } else {
                appQueryObject = { providers: { $elemMatch: { user_id: ObjectId(user_id) } }}
            }
            let appPopulate = [{
                path: 'user_id',
                select: 'full_name profile_pic'
            }, {
                path: 'doctor_id',
                select: 'full_name profile_pic education specializations hospital',
                populate: [{
                    path: 'hospital',
                    select: 'name images address'
                }, {
                    path: 'specializations',
                    select: 'name image'
                }]
            }, {
                path: 'providers.user_id',
                select: 'full_name profile_pic education specializations hospital',
                populate: [{
                    path: 'hospital',
                    select: 'name images address'
                }, {
                    path: 'specializations',
                    select: 'name image'
                }]
            }]
            let sort = { appoint_start: 1 }
            let appointmentsResponse = await getDataArray(Appointments, appQueryObject, '', null, sort, appPopulate);
            if (appointmentsResponse.status) {
                return helpers.showResponse(true, Messages.APPOINTMENT_LIST, appointmentsResponse.data, null, 200);
            }
            return helpers.showResponse(false, Messages.NO_DATA, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER_ID, null, null, 200);
    },

    getAppointmentDetail: async (appointment_id) => {
        let queryObject = { _id: ObjectId(appointment_id), status: { $ne: 2 } }
        let appPopulate = [{
            path: 'user_id',
            select: 'full_name profile_pic'
        }, {
            path: 'doctor_id',
            select: 'full_name profile_pic education specializations hospital',
            populate: [{
                path: 'hospital',
                select: 'name images address'
            }, {
                path: 'specializations',
                select: 'name image'
            }]
        }, {
            path: 'providers.user_id',
            select: 'full_name profile_pic education specializations hospital',
            populate: [{
                path: 'hospital',
                select: 'name images address'
            }, {
                path: 'specializations',
                select: 'name image'
            }]
        }]
        let result = await getSingleData(Appointments, queryObject, '', appPopulate);
        if (result.status) {
            return helpers.showResponse(true, Messages.APPOINTMENT_DATA, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_APP_ID, null, null, 200);
    },

    getAllProviderRoles: async () => {
        let queryObject = {}
        let result = await getDataArray(ProviderRoles, queryObject, '');
        if (result.status) {
            return helpers.showResponse(true, Messages.ROLES_LIST, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.NO_DATA, null, null, 200);
    },

    createTeam: async (data, user_id) => {
        let queryObject = { doctor_id: ObjectId(user_id) }
        let result = await getSingleData(Teams, queryObject, '');
        if(result.status) {
            return helpers.showResponse(false, Messages.ALREADY_TEAM, null, null, 200);
        }
        let { members } = data
        members = typeof members == 'string' ? JSON.parse(members) : members
        let teamRef = new Teams({
            doctor_id: ObjectId(user_id),
            members,
            created_on: moment().unix()
        })
        let response = await postData(teamRef);
        if (response.status) {
            return helpers.showResponse(true, Messages.TEAM_CREATED, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.TEAM_CREATE_ERROR, null, null, 200);
    },

    updateTeam: async (data) => {
        let { team_id, members } = data
        let queryObject = { _id: ObjectId(team_id) }
        let result = await getSingleData(Teams, queryObject, '');
        if(!result.status) {
            return helpers.showResponse(false, Messages.INVALID_TEAM, null, null, 200);
        }
        members = typeof members == 'string' ? JSON.parse(members) : members
        let editObj = {
            members,
            updated_on: moment().unix()
        }
        let response = await updateData(Teams, editObj, ObjectId(team_id));
        if (response.status) {
            return helpers.showResponse(true, Messages.TEAM_UPDATED, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.TEAM_UPDATE_ERROR, null, null, 200);
    },

    getMyTeam: async (user_id) => {
        let queryObject = { doctor_id: ObjectId(user_id) }
        let populate = [{ 
            path: 'doctor_id',
            select: 'email role provider_role start_time end_time specializations hospital bio country_code phone profile_pic full_name',
            populate: [{
                path: "specializations",
                select: 'name image'
            }, {
                path: "hospital",
                select: 'name images address'
            }]
        }, { 
            path: 'members.user_id',
            select: 'email role provider_role start_time end_time specializations hospital bio country_code phone profile_pic full_name',
            populate: [{
                path: "specializations",
                select: 'name image'
            }, {
                path: "hospital",
                select: 'name images address'
            }]
        }]
        let result = await getSingleData(Teams, queryObject, '', populate);
        if(!result.status) {
            return helpers.showResponse(false, Messages.INVALID_TEAM, null, null, 200);
        }
        return helpers.showResponse(true, Messages.TEAM_DATA, result.data, null, 200);
    },

    readAllNotifications: async (user_id) => {
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } }
        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            let notifications = result.data.notifications;
            notifications.map((noti) => {
                noti.is_read = 1
            })
            let userDataObj = {
                notifications,
                updated_on: moment().unix()
            }
            let response = await updateData(Users, userDataObj, ObjectId(user_id));
            if (response.status) {
                return helpers.showResponse(true, Messages.USER_UPDATED, response.data, null, 200);
            }
            return helpers.showResponse(false, Messages.USER_UPDATE_FAILED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    clearNotifications: async (user_id) => {
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } }
        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            let editObj = {
                notifications: [],
                updated_on: moment().unix()
            }
            let response = await updateData(Users, editObj, ObjectId(user_id));
            if (response.status) {
                return helpers.showResponse(true, Messages.NOTIFICATIONS_CLEAR_SUCCESS, null, null, 200);
            }
            return helpers.showResponse(false, Messages.NOTIFICATIONS_CLEAR_FAILURE, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_USER, null, null, 200);
    },

    //admin function
    updateUserByAdmin: async (data) => {
        let { user_id, full_name, country_code, phone, profile_pic, role, email } = data;
        let checkEmail = await getSingleData(Users, { _id: { $ne: ObjectId(user_id) }, status: { $ne: 2 }, email }, '')
        if (checkEmail.status) {
            return helpers.showResponse(false, Messages.EMAIL_ALREADY, null, null, 200);
        }
        let UserData = {
            full_name,
            email,
            country_code,
            phone,
            updated_on: moment().unix()
        }
        if (profile_pic != "") {
            UserData.profile_pic = profile_pic
        }
        if (role == "provider") {
            let { education, specializations, hospital, bio } = data;
            UserData.education = education
            UserData.specializations = ObjectId(specializations)
            UserData.hospital = ObjectId(hospital)
            UserData.bio = bio
        }
        let result = await updateData(Users, UserData, ObjectId(user_id));
        if (result.status) {
            return helpers.showResponse(true, Messages.USER_UPDATED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.USER_UPDATE_FAILED, null, null, 200);
    },

    updateStatus: async (data) => {
        let { user_id, status } = data;
        let UserData = {
            status: parseInt(status),
            updated_on: moment().unix()
        }
        let result = await updateData(Users, UserData, ObjectId(user_id));
        if (result.status) {
            return helpers.showResponse(true, Messages.USER_UPDATED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.USER_UPDATE_FAILED, null, null, 200);
    },

    changePasswordByAdmin: async (data) => {
        let { user_id, password } = data;
        let UserData = {
            password: md5(password),
            updated_on: moment().unix()
        }
        let result = await updateData(Users, UserData, ObjectId(user_id));
        if (result.status) {
            return helpers.showResponse(true, Messages.USER_UPDATED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.USER_UPDATE_FAILED, null, null, 200);
    },

    getAllUsers: async (data) => {
        let { role } = data
        let sort = { created_on: -1 }
        let queryObject = { role, status: { $ne: 2 } }
        let populate = [{
            path: 'specializations',
            select: 'name'
        }, {
            path: 'hospital',
            select: 'name images status address'
        }]
        let result = await getDataArray(Users, queryObject, '-password', null, sort, populate);
        if (result.status) {
            return helpers.showResponse(true, Messages.USERS_LIST, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.NO_USERS, null, null, 200);
    },

    getProviderDashboardCount: async () => {
        let counts = {}
        let rolesResponse = await getDataArray(ProviderRoles, {}, '');
        if (rolesResponse.status) {
            let roles = rolesResponse.data
            for (let i = 0; i < roles.length; i++) {
                let role = roles[i]
                let queryObject = { role: 'provider', provider_role: (role.provider_role).toLowerCase(), status: { $ne: 2 } }
                let result = await getCount(Users, queryObject);
                if (result.status) {
                    counts[role.provider_role] = result.message
                }
            }
            return helpers.showResponse(true, Messages.PROVIDER_DASH, counts, null, 200);
        }
        return helpers.showResponse(false, Messages.NO_DATA, null, null, 200);
    },

    getMainDashboardData: async () => {
        let counts = {}
        let appointments = []
        let hospitalResponse = await getCount(Hospitals, { status: { $ne: 2 } });
        if (hospitalResponse.status) {
            counts.hospitals = hospitalResponse.message
        }
        let providersResponse = await getCount(Users, { role: 'provider', status: { $ne: 2 } });
        if (providersResponse.status) {
            counts.providers = providersResponse.message
        }
        let patientsResponse = await getCount(Users, { role: 'patient', status: { $ne: 2 } });
        if (patientsResponse.status) {
            counts.patients = patientsResponse.message
        }
        // appointments
        let sort = { created_on: -1 }
        let populate = [{
            path: 'user_id',
            select: 'full_name profile_pic'
        }, {
            path: 'doctor_id',
            select: 'full_name profile_pic',
            populate: [{
                path: 'specializations',
                select: 'name image'
            }, {
                path: 'hospital',
                select: 'name images address'
            }]
        }, {
            path: 'providers.user_id',
            select: 'full_name profile_pic provider_role',
            populate: [{
                path: 'specializations',
                select: 'name image'
            }, {
                path: 'hospital',
                select: 'name images address'
            }]
        }]
        let appResponse = await getDataArray(Appointments, { status: { $ne: 2 } }, '', null, sort, populate);
        if (appResponse.status) {
            counts.appointments = appResponse.data.length
            appointments = appResponse.data
        } else {
            counts.appointments = 0
        }
        return helpers.showResponse(true, Messages.MAIN_DASH, { counts, appointments }, null, 200);
    },

    getUsersByProviderRole: async (data) => {
        let { provider_role } = data;
        let populate = [{
            path: 'hospital',
            select: 'name images address'
        }, {
            path: 'specializations',
            select: 'name image'
        }]
        let sort = { created_on: -1 }
        let queryObject = { role: 'provider', provider_role: (provider_role).toLowerCase(), status: { $ne: 2 } }
        let result = await getDataArray(Users, queryObject, '-friends -notifications -password', null, sort, populate);
        if (result.status) {
            return helpers.showResponse(true, Messages.USERS_LIST, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.NO_DATA, null, null, 200);
    },

    deleteUser: async (user_id) => {
        let userObj = { status: 2, updated_on: moment().unix() }
        let result = await updateData(Users, userObj, ObjectId(user_id));
        if (result.status) {
            return helpers.showResponse(true, Messages.USER_DELETED, null, null, 200);
        }
        return helpers.showResponse(false, Messages.USER_DELETE_FAILED, null, null, 200);
    }
}
module.exports = {
    ...userUtil
}