import React, { Component } from 'react';

import './Post.css';

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interaction_url : null,
    };
  }

  async componentDidMount () {
    await this.interactionURLHandler(); 
  }

  interactionURLHandler = async () => {
    let url = 'http://localhost:8080/as/responsePosts';
    let method = 'GET'
    await fetch(url, {
      method: method,
    }).then(response => {
      console.log('response', response)
      return response.json()
      // Use the data
    }).then(resultData => {
      this.setState({
        interaction_url : resultData.txResponsePosts[resultData.txResponsePosts.length - 1].interaction_url
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
          <h3 className="post__title">Transaction Handle : </h3>
          <h3 className="post__title" >Interaction URL :
            <span className="post__url">
              <a href={this.state.interaction_url}>{this.state.interaction_url}</a>
            </span>
          </h3>
        </header>
      </article>
    )
  }
}

export default Post;
