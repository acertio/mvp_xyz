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

`curl -H "Authorization: Bearer <token to copy>" http://localhost:8080/data`
