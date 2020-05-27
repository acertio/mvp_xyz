const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const txTransactionSchema = new Schema({
    display : {
        type: Object,
        //required: true
    },
    interact : {
        type: Object,
        //required: true
    },
    user : {
        type: Object,
        //required: true
    },
    handles: {
        type: Object,
        //required: true
    },
    keys: {
        type: Object,
        //required: true
    },
    claimsRequest: {
        type: Object,
        //required: true
    },
    resourceRequest: {
        type: Object,
        //required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Transaction', txTransactionSchema);