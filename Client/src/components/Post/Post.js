import React, { Component } from 'react';

import './Post.css';

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interaction_url : null,
      redirection : false
    };
  }
  responseHandler = (props) => {
    let url = 'http://localhost:8080/as/response';
    let method = 'POST'
    fetch(url, {
      method: method,
    }).then(response => {
      return response.json()
      // Use the data
    }).then(resultData => {
      console.log('Response :', resultData.response);
      this.setState({
        interaction_url: resultData.response.interaction_url,
        redirection : true
      })
      this.interactHandler();
      console.log('Token :', this.state.access_token)
      /*if (this.state.redirection) {
        return(
          <CallbackPage access_token= {this.state.access_token} />
        )
      }*/
    })
  }

  interactHandler = () => {
    let url = this.state.interaction_url;
    let method = 'GET'
    fetch(url, {
      method: method,
      /*headers: {
        Authorization: 'Bearer ' + this.state.token
      },*/
      // Transform Data 
    }).then(response => {
      //console.log('response', response)
      return response.text()
      // Use the data
    }).then(function (html) {
      var parser = new DOMParser();
      //console.log('parser',parser)
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
              onClick={this.responseHandler}
            >Go to the AuthServe
            </button> 
            <dd className="post__url">
              <a href={this.state.interaction_url}>{this.state.interaction_url}</a>
            </dd>
          </h3>
        </header>
      </article>
    )
  }
}

export default Post;
