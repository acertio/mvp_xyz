const express = require('express');
const authServerController = require('../controllers/authServer');

const router = express.Router();

// GET /as
router.get('/', authServerController.getTransactions);

// POST /as/post
router.post(
    '/transaction', 
    authServerController.createTransaction
);

router.get('/transaction/:transactionId', authServerController.getTransaction);

// Redirect user to AuthServer 
router.get('/interact/:id', authServerController.getInteractUrl);
// Get Response Posts 
router.get('/responsePosts', authServerController.getResponse);

// Create Token 
router.post('/token', authServerController.createToken
);
// Protected resources 
router.get('/data', 
    authServerController.authenticateToken,
    authServerController.getProtectedData
)

// Transaction Continue 
router.post('/txContinue', authServerController.transactionContinue);
router.get('/txContinuePosts', authServerController.getTransactionContinue);
module.exports = router;