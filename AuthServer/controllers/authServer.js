//const jwt = require('jsonwebtoken'); 
const path = require('path');
const Post = require('../models/transaction');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
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

exports.createPost = (req, res, next) => {
  const post = new Post({
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

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
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

exports.getInteractUrl = (req, res, next) => {
  res.sendFile(path.join(__dirname,'/interactPage.html'));
};

exports.createResponse = (req, res, next) => {
  // Add Response 
  const response = {
    interaction_url : "http://localhost:8080/as/interact",
    server_nonce : "MBDOFXG4Y5CVJCX821LH",
    handle : {
      value : "80UPRY5NM33OMUKMKSKU",
      type : "bearer"
    },
    access_token: {
      value: "OS9M2PMHKUR64TB8N6BW7OZB8CDFONP219RP1LT0",
      type: "bearer"
    }
  }
  res.json({
    response: response
  })
};
