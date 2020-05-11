import React, { Component } from 'react';

import './Post.css';
import { Redirect } from 'react-router-dom';

class Post extends Component {
  state = {
    token : null
  };

  tokenHandler = () => {
    let url = 'http://localhost:8080/as/token';
    let method = 'POST'
    fetch(url, {
      method: method,
    }).then(response => {
      return response.json()
      // Use the data
    }).then(resultData => {
      //console.log(resultData.token);
      this.setState({
        token: resultData.token
    })
      this.interactHandler();
    })
  }
  interactHandler = () => {
    let url = 'http://localhost:8080/as/interact';
    let method = 'GET'
    fetch(url, {
      method: method,
      headers: {
        Authorization: 'Bearer ' + this.state.token
      },
      // Transform Data 
    }).then(response => {
      console.log('response', response)
      return response.text()
      // Use the data
    }).then(function (html) {
      var parser = new DOMParser();
      console.log('parser',parser)
      var doc = parser.parseFromString(html, "text/html");
      console.log(doc)
    })
  }

  render () {
    return (
      <article className="post">
        <header className="post__header">
          <h3 className="post__meta">
            Posted on {this.props.date}
          </h3>
          <h3 className="post__title">Transaction Handle : </h3>
          <h3 className="post__title" >Interaction URL :
            <button className="post__button"
              onClick={this.tokenHandler}
            >Go to the AuthServer</button> 
          </h3>
        </header>
      </article>
    )
  }

}

export default Post;
