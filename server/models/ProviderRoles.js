var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ProviderRolesSchema = new Schema({
    provider_role: {
        type: String,
        default: ''
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
module.exports = mongoose.model('ProviderRoles', ProviderRolesSchema, 'provider_roles');