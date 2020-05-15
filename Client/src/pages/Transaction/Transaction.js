import React, { Component, Fragment } from 'react';

import Post from '../../components/Post/Post';
import Button from '../../components/Button/Button';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import './Transaction.css';

class Transaction extends Component {
  state = {
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    this.loadPosts();

  }
  
  loadPosts = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }
    fetch('http://localhost:8080/as/?page=' + page, {
      /*headers: {
        Authorization: 'Bearer ' + this.props.token
      }*/
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch posts.');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          posts: resData.posts.map(post => {
            return {
              ...post
            };
          }),
          totalPosts: resData.totalItems,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    let url = 'http://localhost:8080/as/transaction';
    let method = 'POST'
    fetch(url, {
      method: method,
      /*headers: {
        Authorization: 'Bearer ' + this.props.token
      }*/
    })      
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Creating or editing a post failed!');
      }
      return res.json();
      })
      .then(resData => {
        console.log('resData', resData);
        const post = {
          _id: resData.post._id,
          display: {
            name: resData.post.display.name,
            uri: resData.post.display.uri
          },
          interact: {
            redirect: resData.post.interact.redirect,
            callback: {
                uri: resData.post.interact.callback.uri,
                nonce: resData.post.interact.callback.nonce
            }
          },	
          resourceRequest: {
            action : resData.post.resourceRequest.action,
            locations : resData.post.resourceRequest.locations,
            data : resData.post.resourceRequest.data
          },
          claimsRequest: {
            subject: resData.post.claimsRequest.subject,
            email: resData.post.claimsRequest.email
          },
          user: {
            handle: resData.post.user.handle,
            assertion: resData.post.user.assertion
          },
          keys: {
            proof : resData.post.keys.proof,
            jwk : {
                keys: [ 
                    {
                        kty:resData.post.keys.jwk.keys.kty,
                        e:resData.post.keys.jwk.keys.e,
                        kid:resData.post.keys.jwk.keys.kid,
                        alg:resData.post.keys.jwk.keys.alg,
                        n:resData.post.keys.jwk.keys.n
                    }	 
                ]
            }
          },
          createdAt: resData.post.createdAt
        };
        //console.log('post :', post)
        this.setState(prevState => {
          let updatedPosts = [...prevState.posts];
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              p => p._id === prevState.editPost._id,
            );
            //console.log('postIndex', postIndex)
            updatedPosts[postIndex] = post;
          } else if (prevState.posts.length < 5) {
            updatedPosts = prevState.posts.concat(post);
          }
          return {
            posts: updatedPosts,
            editPost: null,
            editLoading: false,
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.finishEditHandler}>
            New Transaction
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No transaction is found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  date={new Date(post.createdAt).toLocaleDateString('fr-DE')}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Transaction;
