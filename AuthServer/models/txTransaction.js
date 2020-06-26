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
    claims: {
        type: Object,
        //required: true
    },
    resource: {
        type: Array
    },

}, { timestamps: true });

module.exports = mongoose.model('Transaction', txTransactionSchema);
