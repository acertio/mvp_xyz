const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const txResponseSchema = new Schema({
    interaction_url_id : {
        type: String,
        //required: true
    },
    interact_handle : {
        type: String,
        //required: true
    },
    server_nonce: {
        type: String,
        //required: true
    },
    interaction_url: {
        type: String,
        //required: true
    },
    handle: {
        type: Object 
        //required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Response', txResponseSchema);