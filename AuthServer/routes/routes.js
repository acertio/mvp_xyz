const express = require('express');
const authServerController = require('../controllers/authServer');

const router = express.Router();

// GET all the Transactions /as
router.get('/', authServerController.getTransactions);

// POST /as/transaction
router.post('/transaction', authServerController.createTransaction);

// GET a transaction by Id 
router.get('/transaction/:transactionId', authServerController.getTransaction);

// Redirect user to AuthServer 
router.get('/interact/:id', authServerController.getInteractUrl);

// GET the Response 
router.get('/responsePosts', authServerController.getResponse);

// Protected resources 
router.get('/data', 
    authServerController.authenticateToken,
    authServerController.getProtectedData
)

// Transaction Continue 
router.post('/txContinue', authServerController.transactionContinue);

// Get Transaction Continue 
router.get('/txContinuePosts', authServerController.getTransactionContinue);

module.exports = router;