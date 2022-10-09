var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TeamsSchema = new Schema({
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    members: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
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
module.exports = mongoose.model('Teams', TeamsSchema, 'teams');