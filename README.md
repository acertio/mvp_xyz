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

### Connection 

 1. Follow this tutorial in order to create an Atlas cluster : [Get Started with Atlas](https://docs.atlas.mongodb.com/getting-started/)
 
 2. Edit the `.env` file in the server side and set the `MONGODB_SERVER` value to connect to Your Atlas Cluster by replacing `YOUR_USERNAME`as well as `YOUR_PASSWORD` with your own values.  

### Result 
The expected result is shown in this [video](https://drive.google.com/file/d/18uV9PRGBDUZ3bChmQ4oHiSj5du8a6yXM/view?usp=sharing).

### Note 
GNAP spec is still a work in progress, and this implementation may not stay up to date as changes are made to the spec.