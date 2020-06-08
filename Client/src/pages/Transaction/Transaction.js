import React, { Component, Fragment } from 'react';

import Post from '../../components/Post/Post';
import Button from '../../components/Button/Button';
import './Transaction.css';

class Transaction extends Component {

  generateRandomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  finishEditHandler = () => {
    let url = 'http://localhost:8080/as/transaction';
    let method = 'POST'
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        display: {
          name: "XYZ Redirect Client",
          uri: ""
        },
        interact: {
          redirect: true,
          callback: {
              uri: "http://localhost:3000/Callback",
              nonce: this.generateRandomString(20)
          }
        },
        resourceRequest: {
          action : [],
          locations : [],
          data : []
        },
        claimsRequest: {
          subject: "02F861EA250FE40BB393AAF978C6E2A4",
          email: "user@example.com"
        },
        user: {
          handle: "",
          assertion: ""
        },
        keys: {
          proof : "OAUTHPOP",
          jwk : {
              keys: 
                  {
                      kty:"RSA",
                      e:"AQAB",
                      kid:"xyz-client",
                      alg:"RS256",
                      n:"zwCT_3bx-glbbHrheYpYpRWiY9I-nEaMRpZnRrIjCs6b_emyTkBkDDEjSysi38OC73hj1-WgxcPdKNGZyIoH3QZen1MKyyhQpLJG1-oLNLqm7pXXtdYzSdC9O3-oiyy8ykO4YUyNZrRRfPcihdQCbO_OC8Qugmg9rgNDOSqppdaNeas1ov9PxYvxqrz1-8Ha7gkD00YECXHaB05uMaUadHq-O_WIvYXicg6I5j6S44VNU65VBwu-AlynTxQdMAWP3bYxVVy6p3-7eTJokvjYTFqgDVDZ8lUXbr5yCTnRhnhJgvf3VjD_malNe8-tOqK5OSDlHTy6gD9NqdGCm-Pm3Q"
                  } 
          }
        }
      })
    })      
    .then(res => {
      return res.json();
    })

  };

  responseHandler = async () => {
    let url = 'http://localhost:8080/as/response';
    let method = 'POST'
    await fetch(url, {
      method: method,
    })
    .then(response => {
      return response.json()
    })

  };

  render() {
    return (
      <Fragment>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={ async () => {
            this.finishEditHandler(); 
            await this.responseHandler();
          }}>
            New Transaction
          </Button>
        </section>
        <section>
          <div>
            {
              <Post />
            }
          </div>
        </section>
      </Fragment>
    )
  }
}

export default Transaction;
