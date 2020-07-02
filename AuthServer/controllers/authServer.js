require('dotenv').config();
const PendingTransactionModel = require('../models/pendingTransaction');
const utils = require('../utils/utils');
const base64url = require('base64url');
const { sha3_512 }  = require('js-sha3');
const jwt = require('jsonwebtoken');
if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
const sha3_512_encode = function (toHash) {
  return base64url.fromBase64(Buffer.from(sha3_512(toHash), 'hex').toString('base64'));
};

// Create a Transaction 
exports.createTransaction = (req, res, next) => {
  const txtransaction = new PendingTransactionModel({
    entries: [{
      request : {
        display: {
          name: req.body.display.name,
          uri: req.body.display.uri
        },
        interact: {
          redirect: req.body.interact.redirect,
          callback: {
            uri: req.body.interact.callback.uri,
            nonce: req.body.interact.callback.nonce
          }
        },
        resources : [
          {
            action : req.body.resources[0].action,
            locations : req.body.resources[0].locations,
            data : req.body.resources[0].data
          }
        ],
        claims: {
          subject: req.body.claims.subject,
          email: req.body.claims.email
        },
        user: {
          assertion: req.body.user.assertion,
          type: req.body.user.type
        },
        keys: {
          proof : req.body.keys.proof,
          jwk : req.body.keys.jwk
        }
      },
      txContinue: {
        handle: req.body.handle,
        interact_ref: req.body.interact_ref
      }
    }]
  }); 
  txtransaction
    .save()
    .then(() => {
      // Elements for the transaction Response 
      const interaction_url_id = utils.generateRandomString(20); // Save in DB
      const server_nonce = utils.generateRandomString(20); // Save in DB 
      const response = ({
        interaction_url : "http://localhost:8080/as/interact/"  + interaction_url_id,
        server_nonce : server_nonce,
        handle : {
          value : utils.generateRandomString(64),
          type : "bearer"
        }
      });
      PendingTransactionModel.find({}, {
        _id: 1
      })
      .then(result => {
        PendingTransactionModel.updateOne(
          {
            _id: result[result.length - 1]._id
          }, 
          {
            entries:[{
              request: txtransaction.entries[0].request,
              response: response
            }],
            client_nonce: txtransaction.entries[0].request.interact.callback.nonce,
            server_nonce: response.server_nonce,
          },
          function(err, res) {
            if (err) throw err;
          }
        );
      })
      // Add a Response to the transaction  
      res.status(201).json({
        interaction_url: response.interaction_url,
        server_nonce: response.server_nonce,
        handle: {
          value: response.handle.value,
          type: response.handle.type
        }
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

}

// Get all the Transactions 
exports.getTransactions = (req, res, next) => {
  PendingTransactionModel.find()
    .then(tx => {
      res
        .status(200)
        .json({ 
          Transactions: tx
        });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

// Function to get the CallbackUrl + hash + handle  
exports.getInteractUrl = (req, res, next) => {
  const interact_handle = utils.generateRandomString(30);
  localStorage.setItem('interact_handle', interact_handle)
  // Get client_nonce + uri from the DataBase 
  PendingTransactionModel.find({}, {
    _id : 0,
    entries : 1
  })
    .then(result => {
      client_nonce = result[result.length - 1].entries[0].request.interact.callback.nonce
      uri = result[result.length - 1].entries[0].request.interact.callback.uri
      server_nonce = result[result.length - 1].entries[0].response.server_nonce
      const hash = sha3_512_encode(
        [client_nonce, server_nonce, interact_handle].join('\n')
      )
      const callback = uri; // This is the Url that I want to modify, we need to get it from DB 
      const i =
      callback + '?hash=' + hash + '&interact=' + interact_handle;
      res.writeHeader(200, {"Content-Type": "text/html"});  
      res.write(
        '<head>' + 
          '<title>XYZ Auth Server </title>' + 
            '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">' + 
        '</head>' + 
        '<body>' + 
          '<div>' + 
            '<h2>XYZ Redirect Client</h2>' + 
            '<p><span>http://localhost:3000</span></p>' + 
            '<a id="CallbackUrl" href=' + i + '>' + 
              '<button type="button" class="btn btn-success">Approve</button>' + 
            '</a>' + 
            '<button type="button" class="btn btn-secondary">Deny</button>' +
          '</div>' +
            '<script type="text/javascript"' + 
            '</script>' + 
        '</body>' 
      );
      res.end();
      //res.sendFile(path.join(__dirname+'/interactPage.html'));
    })
};

exports.transactionContinue = (req, res, next) => {
  // Get the server handle from DB 
  PendingTransactionModel.find({}, {
    _id : 1,
    entries: 1,
  })
    .then(result => {
      PendingTransactionModel.updateOne(
        {
          _id: result[result.length - 1]._id
        }, 
        {
          $addToSet : {
            entries: [{
              txContinue: {
                handle: req.body.handle,
                interact_ref: req.body.interact_ref
              }
            }]
          },
        },
        function(err, res) {
          if (err) throw err;
        }
      )
      .then(() => {
      // Issuing the Token
      // Get the interact_handle given by the AS
      const interact_handle = localStorage.getItem('interact_handle');
      console.log('interact_handle', interact_handle)
      // Create Token 
      const user = { name: "UserName"}
      const token = {
        access_token: {
          value: jwt.sign(user, process.env.ACCESS_TOKEN_SECRET),
          type: "bearer"
        }
      }
      handle_server = result[result.length - 1].entries[0].response.handle.value
      console.log('handle_server', handle_server)
      // Get the client handle and the interact_ref from DB 
      PendingTransactionModel.find({}, {
        _id : 0,
        entries: 1
      })
        .then((data) => {
          interact_ref = data[data.length - 1].entries[1].txContinue.interact_ref
          handle_client = data[data.length - 1].entries[1].txContinue.handle
          //handle_client = "hamidmassaoudyesichangedthatvalue"
          console.log('interact_ref', interact_ref)
          console.log('handle_client', handle_client)
          if (interact_ref == interact_handle && handle_client == handle_server) {
            console.log(true)
            res.status(201).json({
              token: token
            });
          } else {
              console.log(false)
              res.sendStatus(404);
            }
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
          next(err);
        })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
      next(err);
    })
  })
  .catch(err => {
    res.json({
      message: err
    })
  })
}

exports.getTransactionContinue = (req, res, next) => {
  txContinuation.find()
    .then(txContinue => {
      res
        .status(200)
        .json({ 
          message: 'txContinue Posts', 
          txContinuePosts: txContinue
        });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

// Get protected resource 
exports.getProtectedData = (req, res, next) => {
  res.json({
    message: 'This is Protected Data'
  });
}

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

