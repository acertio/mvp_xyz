const express = require('express');
const authServerController = require('../controllers/authServer');

const router = express.Router();

// GET /as
router.get('/', authServerController.getPosts);

// POST /as/post
router.post(
    '/post', 
    authServerController.createPost
);

router.get('/post/:postId', authServerController.getPost);

// Redirect user to AuthServer 
router.get('/interact', 
    authServerController.ensureToken, 
    authServerController.getInteractUrl,
    );
// Create Token
router.post('/token', authServerController.createToken);

module.exports = router;