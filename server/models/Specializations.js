var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SpecializationsSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
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
module.exports = mongoose.model('Specializations', SpecializationsSchema, 'specializations');