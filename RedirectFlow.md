 ### XYZ/GNAP

 ### Process
 ```
   +--------+                                  +-------+
   | Client |                                  |  AS   |
   |        |--(1)--- txRequest -------------->|       |
   |        |                                  |       |
   |        |<--- txResponse ---(2)------------|       |           +------+
   |        |                                  |       |           | User |
   |        |--(3)--- interaction_url ---------| - - - |---------->|      |
   |        |                                  |       |<---(4)--->|      |
   |        |                                  |       |   http    |      |  
   |        |				       |       | Redirect  |      |
   |        |                                  |       |           |      |
   |        |                                  |       |<---(5)--->|      |
   |        |                                  |       |   auth    |      |
   |        |<--- http Redirect ---(6)---------| - - - |-----------|      |
   |        |                                  |       |           |      |
   |        |--(7)--- txContinuation --------->|       |           +------+
   |        |                                  |       |
   |        |<--------- Token ------------(8)--|       |
   |        |                                  |       |
   +--------+                                  +-------+   
```
 
#### Step 1 : [Transaction Request](https://oauth.xyz/transactionrequest/)
The client begins the transaction by creating a transaction Request. It sends an http POST request to the transaction endpoint of the Authorization Server. The request is a JSON document that contains several parts :
```
display: {
	name:  "XYZ Redirect Client",
	uri:  ""
},
interact: {
	redirect:  true,
	callback: {
		uri:  "http://localhost:3000/Callback",
		nonce:  "QNOcfePWZFLa5duTDtLR"
	}
},
resourceRequest: {
	action : [],
	locations : [],
	data : []
},
claimsRequest: {
	subject:  "02F861EA250FE40BB393AAF978C6E2A4",
	email:  "user@example.com"
},
user: {
	handle:  "",
	assertion:  ""
},
keys: {
	proof :  "OAUTHPOP",
	jwk : {
		keys: {
			kty:"RSA",
			e:"AQAB",
			kid:"xyz-client",
			alg:"RS256",
			n:"zwCT_3bx-glbbHrheYpYpRWiY9I-nEaMRpZnRrIjCs6b_emyTkBkDDEjSysi38OC73hj1-WgxcPdKNGZyIoH3QZen1MKyyhQpLJG1-oLNLqm7pXXtdYzSdC9O3-oiyy8ykO4YUyNZrRRfPcihdQCbO_OC8Qugmg9rgNDOSqppdaNeas1ov9PxYvxqrz1-8Ha7gkD00YECXHaB05uMaUadHq-O_WIvYXicg6I5j6S44VNU65VBwu-AlynTxQdMAWP3bYxVVy6p3-7eTJokvjYTFqgDVDZ8lUXbr5yCTnRhnhJgvf3VjD_malNe8-tOqK5OSDlHTy6gD9NqdGCm-Pm3Q"
		}
	}
}
```
The client needs to remember its own state, for this reason, we have chosen to use the localStorage property, so that the stored data is saved across browser sessions. Indeed, we have chosen to save :

 - Transaction Request
 - Transaction Response 

You can see that in the **postTransaction** function in the Client side: 

> src/pages/Transaction/Transaction.js  
 
#### Step 2 : [Transaction Response](https://oauth.xyz/transactionresponse/)
The AS creates a unique interaction URL and returns it to the client. Note that the client sends the request and gets the response **directly** : 
```
handle:  { 
	type: "bearer",
	value: "DemhyjDKyz9bfpN33czZzvngWTIb2gTLqADGVS5YHa7DOnHlYYGpS1BmmhipBNvt"
},
interaction_url: "http://localhost:8080/as/interact/p8Ts6CKzlP7TBHhH8ib3",
server_nonce: "UJcpho6RRT25lK6ysj4m"
```
#### Step 3 : [Transaction Interaction](https://oauth.xyz/interaction/) 
The client sends the user to an interactive page at the AS, the URL is the one sent in the transaction response. 
```
http://localhost:8080/as/interact/p8Ts6CKzlP7TBHhH8ib3
```

Once at the AS, the latter returns the user to the Client by redirecting the RO's browser to the Client's callback URL presented at the start of the transaction, with the addition of two query parameters :
 1. **hash**
 2. **interact_ref**

```
http://localhost:3000/Callback?hash=BFad5Crc9WA-zSWUZGLyLcpLA6POtz6PDsyfayAxsQkQWre82mdsJ9vfsWRpmQdPHZuLo8gJ5Zi8s4CraYn7Fg&interact=EIOKGP6fFxaJQEGDamZxNMmbxfSTGG
```
To calculate the “**hash**” value for the interaction response, we need to concatenate these three values to each other in this order using a single newline character as a separator between the fields : 

 1. "***nonce***" value sent by the Client in the interaction section of the initial transaction request
```
QNOcfePWZFLa5duTDtLR
```
 2. "***server_nonce***" value returned in the transaction response
```
 UJcpho6RRT25lK6ysj4m
 ```
 3. "***interact_handle***" unguessable interaction handle 
```
EIOKGP6fFxaJQEGDamZxNMmbxfSTGG
```
The client needs to parse the `hash` parameter and compare its value to a hash calculated by its originally chosen `nonce` value, the server's returned `server_nonce`value from the original transaction request, and the value of the `interact_handle`reference parameter from the callback request. To get the first two values, we use the  localStorage property, and for the last one, we opted to use the queryString module. 

If these hash values don't match the client returns an error to the user and stops the transaction. 

You can verify that by :

- Changing the excepted value of the hash in the client side, after the **componentDidMount** method 
	> src/pages/Callback/Callback.js  

The Client then sends an http POST request to the AS, that includes :
-   ***handle***
-   ***interact_ref***
```
handle: "DemhyjDKyz9bfpN33czZzvngWTIb2gTLqADGVS5YHa7DOnHlYYGpS1BmmhipBNvt",
interact_ref: "EIOKGP6fFxaJQEGDamZxNMmbxfSTGG"
```
You can see that in the **txContinuehandler** function in the Client side: 

> src/pages/Callback/Callback.js  
 
The AS looks up the transaction from the transaction handle and fetches the interaction reference associated with that transaction. The AS compares the presented reference to the stored interaction reference it appended to the client's callback with `interact_handle`. Also, the AS needs to compare the handle value given in the transaction Response and the value sent by the client during the transaction continue request. If they match, the AS continues processing as normal, likely issuing a token. 

You can verify that by :

- Changing the value of **interact_ref** or the **handle** in the server side after the **createToken** function 
	> controllers/authserver.js
