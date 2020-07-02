const express = require('express');
const authServerController = require('../controllers/authServer');

const router = express.Router();

// GET all the Transactions /as
router.get('/', authServerController.getTransactions);

// POST /as/transaction
router.post('/transaction', authServerController.createTransaction);

// Redirect user to AuthServer 
router.get('/interact/:id', authServerController.getInteractUrl);

// Protected resources 
router.get('/data', 
    authServerController.authenticateToken,
    authServerController.getProtectedData
)

// Transaction Continue 
//router.post('/transaction/continue', authServerController.transactionContinue);

// Get Transaction Continue 
//router.get('/txContinuePosts', authServerController.getTransactionContinue);

module.exports = router;