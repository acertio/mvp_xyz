require('dotenv').config();
const txTransaction = require('../models/txTransaction');
const txContinuation = require('../models/txContinuation.js');
const utils = require('../utils/utils');
const base64url = require('base64url');
const { sha3_512 }  = require('js-sha3');
const jwt = require('jsonwebtoken');

const sha3_512_encode = function (toHash) {
  return base64url.fromBase64(Buffer.from(sha3_512(toHash), 'hex').toString('base64'));
};

const nonces = {
  client_nonce: utils.generateRandomString(20),
  server_nonce: utils.generateRandomString(20)
};

const interaction = {
  interact_handle: utils.generateRandomString(30),
  interaction_url_id: utils.generateRandomString(20)
};

// Get all the Transactions 
exports.getTransactions = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  txTransaction.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return txTransaction.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
      res
        .status(200)
        .json({ 
          message: 'Fetched posts successfully.', 
          posts: posts, 
          totalItems: totalItems 
        });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

// Create a Transaction 
exports.createTransaction = (req, res, next) => {
  const post = new txTransaction({
    display: {
      name: "XYZ Redirect Client",
      uri: ""
    },
    interact: {
      redirect: true,
      callback: {
          uri: "http://localhost:3000/Callback",
          nonce: nonces.client_nonce
      }
    },
    resourceRequest: {
      action : [],
      locations : [],
      data : []
    },
    claimsRequest: {
      subject: "02F861EA250FE40BB393AAF978C6E2A4",
      email: "user@example.com"
    },
    user: {
      handle: "",
      assertion: ""
    },
    keys: {
      proof : "OAUTHPOP",
      jwk : {
          keys: [ 
              {
                  kty:"RSA",
                  e:"AQAB",
                  kid:"xyz-client",
                  alg:"RS256",
                  n:"zwCT_3bx-glbbHrheYpYpRWiY9I-nEaMRpZnRrIjCs6b_emyTkBkDDEjSysi38OC73hj1-WgxcPdKNGZyIoH3QZen1MKyyhQpLJG1-oLNLqm7pXXtdYzSdC9O3-oiyy8ykO4YUyNZrRRfPcihdQCbO_OC8Qugmg9rgNDOSqppdaNeas1ov9PxYvxqrz1-8Ha7gkD00YECXHaB05uMaUadHq-O_WIvYXicg6I5j6S44VNU65VBwu-AlynTxQdMAWP3bYxVVy6p3-7eTJokvjYTFqgDVDZ8lUXbr5yCTnRhnhJgvf3VjD_malNe8-tOqK5OSDlHTy6gD9NqdGCm-Pm3Q"
              } 
          ]
      },
    }
  });
  post
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: result,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
// Get a transaction by Id 
exports.getTransaction = (req, res, next) => {
  const transactionId = req.params.transactionId;
  txTransaction.findById(transactionId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post fetched.', post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Function to get the CallbackUrl + hash + handle  
exports.getInteractUrl = (req, res, next) => {
  const interact_handle = interaction.interact_handle;
  const client_nonce = nonces.client_nonce; // We need to get it from the dataBase 
  const server_nonce = nonces.server_nonce; // We need to get it 
  const hash = sha3_512_encode(
    [client_nonce, server_nonce, interact_handle].join('\n')
  )
  const callback = "http://localhost:3000/callback"; // This is the Url that I want to modify, we need to get it from DB 
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
          '<h5>http://localhost:3000</h5>' + 
          '<button type="button" class="btn btn-success">' + 
              '<a id="CallbackUrl" href=' + i + '>Approve</a>' + 
          '</button>' + 
          '<button type="button" class="btn btn-secondary">Deny</button>' +
      '</div>' +
        /*'<script type="text/javascript"' + 
          'src="interactPage.js">' + 
        '</script>' +*/
    '</body>' 
  ); 
  res.end();  
  //res.sendFile(path.join(__dirname+'/interactPage.html'));
};

exports.createHandleHash = (req, res, next) => {
  const interact_handle = interaction.interact_handle;
  const client_nonce = nonces.client_nonce; // We need to get it from the dataBase 
  const server_nonce = nonces.server_nonce; // We need to get it 
  const hash = sha3_512_encode(
    [client_nonce, server_nonce, interact_handle].join('\n')
  )
  res.json({
    hash: hash
  })
}
// Response to the Transaction 
exports.createResponse = (req, res, next) => {
  // Add Response 
  const interaction_url_id = interaction.interaction_url_id;
  const interact_handle = interaction.interact_handle;
  const server_nonce = nonces.server_nonce; // Save this in DB 
  const client_nonce = nonces.client_nonce;  // Save this in DB 
  const response = {
    interaction_url : "http://localhost:8080/as/interact/"  + interaction_url_id,
    server_nonce : server_nonce,
    client_nonce : client_nonce,
    interact_handle : interact_handle,
    interaction_url_id : interaction_url_id,
    handle : {
      value : "80UPRY5NM33OMUKMKSKU",
      type : "bearer"
    },
  }
  res.json({
    response: response
  })
};

exports.createToken = (req, res, next) => {
  const interaction_url_id = interaction.interaction_url_id;
  //const interaction_url_id = "HHDKNFJFzemngmaemkanregk";

  // Token 
  const user = { name: "UserName"}
  const token = {
    access_token: {
      value: jwt.sign(user, process.env.ACCESS_TOKEN_SECRET),
      type: "bearer"
    }
  }
  // Get interact_ref from DB 
  txContinuation.find({}, {
    _id : 0,
    interact_ref: 1
  })
    .then((data) => {
      interact_ref = data[0].interact_ref
      console.log('interact_ref', interact_ref)
      console.log('interaction_url_id', interaction_url_id)
      if (interaction_url_id == interact_ref) {
        console.log(true)
        res.json({
          token: token
        });
      } else {
        console.log(false)
        res.sendStatus(404);
      }
    });
};

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

exports.transactionContinue = (req, res, next) => {
  const txContinue = new txContinuation({
    handle: req.body.handle,
    interact_ref: req.body.interact_ref
  });

  txContinue.save()
    .then(data => {
      res.json(data);
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


