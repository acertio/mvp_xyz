import React, { Component, Fragment } from 'react';

import Loader from '../Loader/Loader';
import './Post.css';

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interact_url_list: [],
      postsLoading: true
    };
  }

  componentDidMount () {
    this.interactionURLHandler(); 
  }

  componentDidUpdate() {
    this.interactionURLHandler();
  }

  interactionURLHandler = () => {
    let url = 'http://localhost:8080/as/responsePosts';
    let method = 'GET'
    fetch(url, {
      method: method,
    }).then(response => {
      return response.json()
      // Use the data
    }).then(resultData => {
      this.setState({
        interact_url_list: resultData.txResponsePosts.map(url => {
          return {
            ...url
          };
        }),
        postsLoading: false
      })
    }).catch(err => {
      console.log(err)
    })
  }

  render () {
    return (
      <Fragment>
      <section>
        {this.state.postsLoading && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Loader />
          </div>
        )}
        {this.state.interact_url_list.length <= 0 && !this.state.postsLoading ? (
          <p style={{ textAlign: 'center' }}>No transaction is found.</p>
        ) : null}
        {!this.state.postsLoading && (
          <div>
            {this.state.interact_url_list.map((url, index) => (
            <article className="post" key={index} id={url._id}>
              <header className="post__header">
                <h3 className="post__meta">
                  Posted on {new Date(url.createdAt).toLocaleDateString('fr-DE')}
                </h3>
                <h3 className="post__title">Transaction Handle :</h3>
                <h3 className="post__title">Interaction URL :
                  <span className="post__url">
                    <a href={url.interaction_url} id={url._id}>{url.interaction_url}</a>
                  </span>
                </h3>
              </header>
            </article>
            ))}
          </div>
        )}
      </section>
      </Fragment>
    );
  }
}

export default Post;
