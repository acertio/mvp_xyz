import React, { Component } from 'react';

import '../../components/Post/Post.css';

class CallbackPage extends Component {
  render () {
    return (
      <article className="post">
        <header className="post__header">
          <h3 className="post__meta">
            Posted on {this.props.date}
          </h3>
          <h3 className="post__title">Access Token : </h3>
          <h3 className="post__title" >Transaction Handle :</h3>
        </header>
      </article>
    )
  }

}

export default CallbackPage;
