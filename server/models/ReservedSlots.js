var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ReservedSlotsSchema = new Schema({
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    start_time: {
        type: Number,
        default: 0 
    },
    end_time: {
        type: Number,
        default: 0 
    },
    status: {
        type: Number,
        default: 1
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
module.exports = mongoose.model('ReservedSlots', ReservedSlotsSchema, 'reserved_slots');