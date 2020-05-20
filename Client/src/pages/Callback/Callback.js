import React, { Component } from 'react';

import '../../components/Post/Post.css';

class CallbackPage extends Component {
  state = {
    access_token: null
  }

  componentDidMount () {
    this.tokenHandler();
  }
  tokenHandler = () => {
    let url = 'http://localhost:8080/as/response';
    let method = 'POST'
    fetch(url, {
      method: method,
    }).then(response => {
      return response.json()
      // Use the data
    }).then(resultData => {
      console.log('Token :', resultData.response.access_token);
      this.setState({
        access_token : resultData.response.access_token.value,
      })
    })
  }

  render () {
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
  }
}

export default CallbackPage;
