var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AdminSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true 
    },
    password : {
        type : String,
        required : true
    },
    profile_pic : {
        type : String,
        default : ''
    },
    otp : {
        type : String,
        default : ''
    },
    status : {
        type : Number,
        default : 1
    },
    type: {
        type: String,
        default: 'privileged'
    },
    created_at : {
        type : Number,
        default:0
    },
    updated_at : {
        type : Number,
        default:0
    }
});
module.exports = mongoose.model('Admin', AdminSchema, 'admin');