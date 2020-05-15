const txTransaction = require('../models/txTransaction');
const utils = require('../utils/utils');
const authServer = require('../controllers/authServer');

const sha3_512_encode = function (toHash) {
  return base64url.fromBase64(Buffer.from(sha3_512(toHash), 'hex').toString('base64'));
};

// Get all Transactions 
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
          nonce: "VJLO6A4CAYLBXHTR0KRO"
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
};

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
  i = "http://localhost:3000/callback"; // This is the Url that I want to modify 
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


// Response to the Transaction 
exports.createResponse = async (req, res, next) => {
  // Add Response 
  const interaction_url_id = utils.generateRandomString(10);
  const server_nonce = utils.generateRandomString(20);
  const response = {
  interaction_url : "http://localhost:8080/as/interact/" + interaction_url_id,
    server_nonce : server_nonce,
    handle : {
      value : "80UPRY5NM33OMUKMKSKU",
      type : "bearer"
    },
    access_token: {
      value: utils.generateRandomString(40),
      type: "bearer"
    }
  }
  res.json({
    response: response
  })
};
