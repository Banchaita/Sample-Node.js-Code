var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UsersSchema = new Schema({
    role: {
        type: String,
        default: 'patient' //provider
    },
    provider_role: {
        type: String,
        default: '' 
    },
    start_time: {
        type: String,
        default: '' 
    },
    end_time: {
        type: String,
        default: '' 
    },
    full_name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    profile_pic: {
        type: String,
        default: ''
    },
    country_code: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    lat: { 
        type: String, 
        default: '' 
    }, 
    lon: { 
        type: String, 
        default: '' 
    }, 
    bio: {
        type: String,
        default: ''
    },
    education: {
        type: String,
        default: ''
    },
    specializations: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specializations'
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospitals'
    },
    friends: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        request_type: '',
        request_status: 0,
        friend_since: 0
    }],
    notifications: [{
        _id: { type: mongoose.Schema.Types.ObjectId},
        from_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        notification_type: '',
        is_read: 0,
        text: '',
        notification_data: {},
        created_on: 0
    }],
    auth_token: {
        type: String,
        default: ''
    },
    otp: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 1
    },
    fcm_token: {
        type: String,
        default: ''
    },
    login_source: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [{
        user_id: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        rating: {
            type: Number 
        },
        review: {
            type: String
        }
    }],
    created_on: {
        type: Number,
        default: 0
    },
    updated_on: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('Users', UsersSchema, 'users');