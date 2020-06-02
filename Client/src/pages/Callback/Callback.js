import React, { Component } from 'react';

import base64url from 'base64url';
import { sha3_512 } from 'js-sha3';
import '../../components/Post/Post.css';

class CallbackPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      access_token: null,
      client_nonce: null, 
      server_nonce: null,
      interact_Callback: null,
      handle: null,
      hash: null
    }
    this.hashHandler();
    this.responseHandler();
    this.transactionHandler();
  }

  sha3_512_encode = (toHash) => {
    return base64url.fromBase64(Buffer.from(sha3_512(toHash), 'hex').toString('base64'));
  };

  componentDidMount () {
    this.tokenHandler();
  }

  responseHandler = () => {
    let url = 'http://localhost:8080/as/responsePosts';
    let method = 'GET'
    fetch(url, {
      method: method,
    }).then(response => {
      return response.json()
      // Use the data
    }).then(resultData => {
      this.setState({
        server_nonce : resultData.txResponsePosts[resultData.txResponsePosts.length - 1].server_nonce,
        interact_Callback : resultData.txResponsePosts[resultData.txResponsePosts.length - 1].interact_handle,
        handle : resultData.txResponsePosts[resultData.txResponsePosts.length - 1].handle.value
      })
      this.txContinuehandler();
    })
  }

  transactionHandler = () => {
    let url = 'http://localhost:8080/as/';
    let method = 'GET'
    fetch(url, {
      method: method,
    }).then(response => {
      return response.json()
      // Use the data
    }).then(resultData => {
      this.setState({
        client_nonce: resultData.posts[resultData.posts.length - 1].interact.callback.nonce,
      })
    })
  }

  tokenHandler = () => {
    let url = 'http://localhost:8080/as/token';
    let method = 'POST'
    fetch(url, {
      method: method,
    }).then(token => {
      return token.json()
      // Use the data
    }).then(resultData => {
      this.setState({
        access_token: resultData.token.access_token.value
      })
      console.log('access_token', this.state.access_token)
    })
  }

  hashHandler = () => {
    let url = 'http://localhost:8080/as/hash';
    let method = 'POST'
    fetch(url, {
      method: method
    }).then(hash => {
      return hash.json()
    }).then(resultData => {
      this.setState({
        hash: resultData.hash
      })
    })
  }

  txContinuehandler = () => {
    let url = 'http://localhost:8080/as/txContinue';
    let method = 'POST'
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        handle: this.state.handle,
        interact_ref: this.state.interact_Callback
      })
    }).then(data => {
      return data.json()
    }).then(resultData => {
      console.log(resultData);
    })
  }
  
  render () {
    const expected_hash = this.sha3_512_encode(
      [this.state.client_nonce, this.state.server_nonce, this.state.interact_Callback].join('\n')
    )
    //const expected_hash = "aff9b0886e41efcea643033195422b38258e1ae700b3544a33c59d27ec5a9d80dab1017f2f88ba93491d5ac4ad681f27a80811cf2c889c23e1e643ededb830a2"
    if (expected_hash === this.state.hash) {
      return (
        <article className="post">
          <header className="post__header">
            <h3 className="post__meta">
              Posted on {this.props.date}
            </h3>
            <h3 className="post__title">
              Access Token : 
              <dd>
                <span>
                {this.state.access_token}
                </span>
                </dd>
            </h3>
            <h3 className="post__title" >Transaction Handle :</h3>
          </header>
        </article>
      )
    } else {
      return (
        <header>
          <h3>404 page not found</h3>
          <h3>Hashes are not the same</h3>
        </header>
      );
    }
  } 
}

export default CallbackPage;
