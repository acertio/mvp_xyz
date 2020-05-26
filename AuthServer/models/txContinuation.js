const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const txContinuationSchema = new Schema({
    handle : {
        type: String,
        //required: true
    },
    interact_ref : {
        type: String,
        //required: true
    }
}, { timestamps: true });

module.exports = mongoose.model(
    'txContinuation', 
    txContinuationSchema
);