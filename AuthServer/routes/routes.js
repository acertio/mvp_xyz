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
// Create Response 
router.post('/response', authServerController.createResponse);

// Protected resources 
router.get('/data', 
    authServerController.authenticateToken,
    authServerController.getProtectedData
)

module.exports = router;