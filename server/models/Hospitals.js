var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HospitalsSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    images: {
        type: Array,
        default: []
    },
    address: {
        lat: {
            type: String,
        },
        lon: {
            type: String,
        },
        location: {
            type: String,
        }
    },
    distance: {
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
module.exports = mongoose.model('Hospitals', HospitalsSchema, 'hospitals');