const utils = require('../utils/utils');
const authServer = require('../controllers/authServer');

const sha3_512_encode = function (toHash) {
    return base64url.fromBase64(Buffer.from(sha3_512(toHash), 'hex').toString('base64'));
};

const interact_handle = utils.generateRandomString(30);
const client_nonce = authServer.createTransaction.post.interact.callback.nonce;
const server_nonce = authServer.createResponse.response.server_nonce;
const hash = sha3_512_encode(
  [client_nonce, server_nonce, interact_handle].join('\n')
)
const callback =  authServer.createTransaction.post.interact.callback.uri;
const callbackUri =
  callback + '?hash=' + hash + '&interact=' + interact_handle;*/


var CallbackUrl = document.getElementById("CallbackUrl");
//getCallbackUrl.setAttribute('href', callbackUri)
console.log('CallbackUrl', CallbackUrl)
