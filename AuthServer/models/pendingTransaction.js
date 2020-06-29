const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PendingTransactionSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    entries: [
        /*{
            request: {
                display : {
                    type: Object
                },
                interact : {
                    type: Object
                },
                user : {
                    type: Object
                },
                handles: {
                    type: Object
                },
                keys: {
                    type: Object
                },
                claims: {
                    type: Object
                },
                resource: {
                    type: Array
                }
            },
            response: {
                server_nonce: {
                    type: String
                },
                interaction_url: {
                    type: String
                },
                handle: {
                    type: Object 
                }
            }
        },
        {
            txContinue: {
                handle : {
                    type: String,
                    //required: true
                },
                interact_ref : {
                    type: String,
                    //required: true
                }
            },
            access_token: String
        }*/
    ],
    client_nonce: String,
    server_nonce: String
});

module.exports = mongoose.model(
    'PendingTransaction', 
    PendingTransactionSchema
);