## Projet 

This project is a demonstration of the new protocol currently called [XYZ](https://oauth.xyz), or [GNAP (Grant Negotiation and Authorization Protocol)](https://datatracker.ietf.org/wg/txauth/about/). It is a protocol which is based on a transactional model and which is different from **OAuth 2**. Indeed, as explained on the documentation of this new protocol : 
>The client of the API declares who it is and what it wants, the AS figures out what information it needs to fulfill that (which might include interacting with a user), and ultimately a token is produced. All along the way, components have the opportunity to bind keys to different parts of the transaction so that attackers can't take over. This intent-based system takes in experience and feedback from other similar projects and protocols, but in a way that pulls together many different aspects.

## Running

Implementation in NodeJs.

*This implementation has both the client and AS portions. It's written in NodeJs with a React front end. The **server** is an Express app with MongoDB Atlas and the **client** frontend is a React app.*

To run, start with the client:

`npm install`

`npm start`

Then start with the AS:

`npm install`

`npm start`

The client is accessible at <http://localhost:3000>

The AS is accessible at : <http://localhost:8080/as>

Acces Token allows you to get protected data. Use GET request with Authorization to see it. Or, 

`curl -H "Authorization: Bearer <token to copy>" http://localhost:8080/as/data`

### Setup DataBase Connecion 

 1. Follow this tutorial in order to create an Atlas cluster : [Get Started with Atlas](https://docs.atlas.mongodb.com/getting-started/)
 
 2. Edit the `.env` file in the server side and set the `MONGODB_SERVER` value to connect to Your Atlas Cluster by replacing `YOUR_USERNAME`as well as `YOUR_PASSWORD` with your own values.  

### Result 
The expected result is shown in this [video](https://drive.google.com/file/d/1n5Me1yPZ3VFX_O8DMETXLb9wC_LbFYFG/view?usp=sharing).

## Process
[Transactional Authorization Process](https://tools.ietf.org/html/draft-richer-transactional-authz-08#page-3)
```sequence
   1.  The RC creates a transaction request and sends it to the AS
   2.  The AS processes the transaction request and determines if the RO needs to interact
   3.  If interaction is required, the AS interacts with the RO, possibly by directing the RC to send the RO there
   4.  The RC continues the transaction at the AS
   5.  The AS processes the transaction again, determining that a token can be issued
   6.  The AS issues a token to the RC
   7.  The RC uses the token with the RS
```
### Client 
#### Transaction Request
The client begins the transaction by creating a transaction Request. It sends an http POST request to the transaction endpoint of the Authorization Server. The request is a JSON document that contains several parts :

- ***resources*** : This section indicates what the Client is willing to do with the resource server
	- ***actions** : type of actions the Client will take at the resource server*
	- ***locations** : URIs the RC will call at the RS*
	-   ***datatypes** : type of data available to the client at the resource server*
-  ***claims*** : This section allows the RC to request identity and authentication information about the user. All fields are boolean values.
	-   ***subject***
	-   ***email***
-   ***key*** : this section lists the keys that the RC can present proof of ownership.
	-   ***proof** : the form of evidence the Client will use when presenting the key to the AS.*
	-   ***jwks** : value of the public key*
		-   ***alg** : used to validate the signature*
		-   ***kid** : identify the key in the signed object*
-   ***display*** : descriptive details of the Client software
	-   ***name** : name of the RC software*  
	-   ***uri** : User-facing web page of the RC software*
	-   ***logo_uri** : Display image to represent the RC software*
-   ***interact*** : details of how the Client can interact with the user
	-   ***redirect** : If this is set to true, the RC is capable of redirecting the RO to an arbitrary interaction URL*   
	-   ***callback***
		-   ***uri** : the uri to send the user to after interaction.*
	    -   ***nonce** : unique value to be used in the calculation of the “hash” query parameter on the callback URL*
-   ***user*** : Information about the person interacting with the Client
	-   ***assertion***
	-   ***type***
-   ***capabilities*** : This section lists the extensions and special features supported by the RC

Each of these sections is optional and can be also sent as a ***handle*** instead, which is a single string instead of JSON object. When sent as a handle, the AS looks up the handle value to determine the values associated with that handle.

#### Transaction Continue request
When the AS returns the user to the Client’s callback URL presented at the start of the transaction, the Client must calculate the expected value of the “**hash**” parameter and compare that value with “**hash**” parameter on the incoming request. Also, the Client sends an http POST request to the AS, that includes :
-   ***handle***
-   ***interact_ref***

### Authorization Server
The AS sends a transaction Response to the client telling him what to do next. The AS may respond with multiple possible interaction methods to be chosen by the client.

#### Interaction URI return
If the client indicates a Callback URL in its interact request, the AS creates a unique interaction URL and returns it to the client.
-   ***interaction_url*** : The interaction URL that the RC will direct the RO to.
-   ***server_nonce*** : A unique value used in the calculation of the “hash” value returned in the CallBack response
-   ***handle***
	-   ***value***
	-   ***type***

***handle*** MUST be unique, MUST be associated with a single transaction, and MUST be one time use.

When interaction has concluded, the AS returns the user to the RC by redirecting the RO's browser to the RC's callback URL presented at the start of the transaction, with the addition of two query parameters :

 1. **hash**
 2. **interact_ref**
 
*Exemple :* 
```
http://localhost:3000/Callback?hash=BFad5Crc9WA-zSWUZGLyLcpLA6POtz6PDsyfayAxsQkQWre82mdsJ9vfsWRpmQdPHZuLo8gJ5Zi8s4CraYn7Fg&interact=EIOKGP6fFxaJQEGDamZxNMmbxfSTGG
```
To calculate the “**hash**” value for the interaction response, we need to concatenate these three values to each other in this order using a single newline character as a separator between the fields : 

 1. "***nonce***" value sent by the Client in the interaction section of the initial transaction request
 2. "***server_nonce***" value returned in the transaction response
 3. "***interact_ref***" returned in the callback response.

### Checking

Redirect based clients need to send a new `nonce` parameter every time, and could potentially send a new callback URI. 

You can verify that by :

- Changing the value of the uri in the client side, in the **postTransaction** method 
	> src/pages/Transaction/Transaction.js  

The client needs to parse the `hash` parameter and compare its value to a hash calculated by its originally chosen `nonce` value, the server's returned `server_nonce`value from the original transaction request, and the value of the `interact`reference parameter from the callback request, hashed using the client's chosen method from the initial transaction request (which defaults to `SHA3`512 bit hash). If these hash values don't match the client returns an error to the user and stops the transaction.

You can verify that by :

- Changing the excepted value of the hash in the client side, in the **componentDidMount** method 
	> src/pages/Callback/Callback.js  

The AS looks up the transaction from the transaction handle and fetches the interaction reference associated with that transaction. The AS compares the presented reference to the stored interaction reference it appended to the client's callback with `interact`. Also, the AS needs to compare the nonce value given in the transaction Response and the value sent by the client during the transaction continue request. If they match, the AS continues processing as normal, likely issuing a token. 

You can verify that by :

- Changing the value of **interact_ref** or the **handle** in **createToken** function 
	> controllers/authserver.js

### Note 
GNAP spec is still a work in progress, and this implementation may not stay up to date as changes are made to the spec.