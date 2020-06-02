
# Running

XYZ implementation in NodeJs.

To run, start with the client:

`npm install`
`npm start`

Then start with the AS:

`npm install`
`npm start`

The client is accessible at <http://localhost:3000>

The AS is accessible at <http://localhost:8080/as>

Acces Token allows you to get protected data. Use GET request with Authorization to see it. Or, 

`curl -H "Authorization: Bearer <token to copy>" http://localhost:8080/as/data`

# Redirect with Callback

Redirect based clients need to send a new `nonce`parameter every time, and could potentially send a new callback URI. 

You can verify that by :

- Changing the value of the uri in the client side, in the **finishEditHandler** method 
	> src/pages/Transaction/Transaction.js  

The client needs to parse the `hash` parameter and compare its value to a hash calculated by its originally chosen `nonce` value, the server's returned `server_nonce`value from the original transaction request, and the value of the `interact`reference parameter from the callback request, hashed using the client's chosen method from the initial transaction request (which defaults to `SHA3`512 bit hash). If these hash values don't match the client returns an error to the user and stops the transaction.

You can verify that by :

- Changing the excepted value of the hash in the client side, after the **render** method 
	> src/pages/Callback/Callback.js  

The AS looks up the transaction from the transaction handle and fetches the interaction reference associated with that transaction. The AS compares the presented reference to the stored interaction reference it appended to the client's callback with `interact`. Also, the AS needs to compare the nonce value given in the transaction Response and the value sent by the client during the transaction continue request. If they match, the AS continues processing as normal, likely issuing a token. 

You can verify that by :

- Changing the value of **interact_ref** or the **handle** in **createToken** function 
	> controllers/authserver.js



