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

  finishEditHandler = () => {
    this.setState({
      editLoading: true
    });
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
              nonce: ""
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
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Creating or editing a post failed!');
      }
      return res.json();
      })
      .then(resData => {
        console.log('resData', resData);
        const txtransaction = {
          _id: resData.txtransaction._id,
          display: {
            name: resData.txtransaction.display.name,
            uri: resData.txtransaction.display.uri
          },
          interact: {
            redirect: resData.txtransaction.interact.redirect,
            callback: {
                uri: resData.txtransaction.interact.callback.uri,
                nonce: resData.txtransaction.interact.callback.nonce
            }
          },	
          resourceRequest: {
            action : resData.txtransaction.resourceRequest.action,
            locations : resData.txtransaction.resourceRequest.locations,
            data : resData.txtransaction.resourceRequest.data
          },
          claimsRequest: {
            subject: resData.txtransaction.claimsRequest.subject,
            email: resData.txtransaction.claimsRequest.email
          },
          user: {
            handle: resData.txtransaction.user.handle,
            assertion: resData.txtransaction.user.assertion
          },
          keys: {
            proof : resData.txtransaction.keys.proof,
            jwk : {
                keys: [ 
                    {
                        kty:resData.txtransaction.keys.jwk.keys.kty,
                        e:resData.txtransaction.keys.jwk.keys.e,
                        kid:resData.txtransaction.keys.jwk.keys.kid,
                        alg:resData.txtransaction.keys.jwk.keys.alg,
                        n:resData.txtransaction.keys.jwk.keys.n
                    }	 
                ]
            }
          },
          createdAt: resData.txtransaction.createdAt
        };
        this.setState(prevState => {
          let updatedPosts = [...prevState.posts];
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              p => p._id === prevState.editPost._id,
            );
            //console.log('postIndex', postIndex)
            updatedPosts[postIndex] = txtransaction;
          } else if (prevState.posts.length < 5) {
            updatedPosts = prevState.posts.concat(txtransaction);
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

  responseHandler = () => {
    let url = 'http://localhost:8080/as/response';
    let method = 'POST'
    fetch(url, {
      method: method,
    }).then(response => {
      return response.json()
      // Use the data
    }).then(resultData => {
      console.log('Response :', resultData.response);
    })
  }

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
          <Button mode="raised" design="accent" onClick={ () => {
            this.finishEditHandler(); 
            this.responseHandler()
          }}>
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
