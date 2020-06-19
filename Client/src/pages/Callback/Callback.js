import React, { Component } from 'react';

import base64url from 'base64url';
import { sha3_512 } from 'js-sha3';
import queryString from 'query-string';
import '../../components/Post/Post.css';

class CallbackPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      access_token: null,
      client_nonce: null, 
      server_nonce: null,
      interact_handle: null,
      handle: null,
      hash: null,
      expected_hash: null
    }
  }

  sha3_512_encode = (toHash) => {
    return base64url.fromBase64(Buffer.from(sha3_512(toHash), 'hex').toString('base64'));
  };

  UNSAFE_componentWillMount() {
    const values = queryString.parse(this.props.location.search)
    const txResponse = JSON.parse(localStorage.getItem('txResponse'))
    const txTransaction = JSON.parse(localStorage.getItem('txTransaction'))
    if (localStorage.getItem('txTransaction') && localStorage.getItem('txResponse')) {
      this.setState({
        client_nonce: txTransaction.interact.callback.nonce,
        server_nonce: txResponse.server_nonce,
        handle: txResponse.handle.value,
        interact_handle: values.interact,
        hash: values.hash
      })
    }
    //this.tokenHandler();
  }

  componentDidMount = async () => {
    const expected_hash = this.sha3_512_encode(
      [this.state.client_nonce, this.state.server_nonce, this.state.interact_handle].join('\n')
    );
    //const expected_hash = "aff9b0886e41efcea643033195422b38258e1ae700b3544a33c59d27ec5a9d80dab1017f2f88ba93491d5ac4ad681f27a80811cf2c889c23e1e643ededb830a2"
    if (expected_hash === this.state.hash) {
      await this.txContinuehandler();
      this.tokenHandler();
    }
    this.setState({
      expected_hash: expected_hash
    })

  }

  txContinuehandler = async () => {
    let url = 'http://localhost:8080/as/txContinue';
    let method = 'POST'
    await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        handle: this.state.handle,
        interact_ref: this.state.interact_handle
      })
    }).then(data => {
      return data.json()
    })
  }

  tokenHandler = async () => {
    let url = 'http://localhost:8080/as/token';
    let method = 'POST'
    await fetch(url, {
      method: method,
    }).then(token => {
      return token.json()
      // Use the data
    }).then(resultData => {
      this.setState({
        access_token: resultData.token.access_token.value
      })
    })
  }
  
  render () {
    if (this.state.expected_hash === this.state.hash) {
      return (
        <article className="post">
          <header className="post__header">
            <h3 className="post__meta">
              Posted on {new Date().toLocaleDateString('fr-DE')}
            </h3>
            <h3 className="post__title">
              Access Token : 
              <dd>
                <span>
                  {this.state.access_token}
                </span>
              </dd>
            </h3>
            <h3 className="post__title" >Transaction Handle :
              <dd>
                <span>
                  {this.state.handle}
                </span>
              </dd>
            </h3>
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
