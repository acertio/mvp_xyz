const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingTransactionSchema = new Schema({
    owner : {
        type: String,
        //required: true
    },
    callback_id : {
        type: String,
        //required: true
    },
    client_nonce : {
        type: String,
        //required: true
    },
    server_nonce: {
        type: String,
        //required: true
    }
}, { timestamps: true });

module.exports = mongoose.model(
    'PendingTransaction', 
    pendingTransactionSchema
);