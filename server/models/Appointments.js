var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AppointmentsSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    appointment_type: {
        type: Number,
        default: 0    // 0 -> offline, 1 -> online
    },
    appointment_amount: {
        type: Number,
        default: 0 
    },
    appoint_start: {
        type: Number,
        default: 0 
    },
    appoint_end: {
        type: Number,
        default: 0 
    },
    providers: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    }],
    status: {
        type: Number,
        default: 0 // 0 -> Pending, 1 -> Accepted, 2 -> Rejected and Suggested Time, 3 -> Cancelled by User
    },
    payment_status: {
        type: Number,
        default: 0 // 0 -> Pending, 1 -> Success, 2 -> Failed, 3 -> Refund Initiated, 4-> Refund Completed
    },
    created_on: {
        type: Number,
        default: 0
    },
    updated_on: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('Appointments', AppointmentsSchema, 'appointments');