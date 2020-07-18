import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import MDropdown from 'components/ui/MDropdown';
import { logout } from 'actions/userActions';
import MGlobalMarker from 'components/ui/MGlobalMarker/MGlobalMarker';
import mlReefIcon01 from '../../images/MLReef_Logo_navbar.png';
import helpWhite from '../../images/help_white.png';
import './navbar.scss';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  handleSignOut() {
    const { actions } = this.props;
    actions.logout();
  }

  render() {
    const { user } = this.props;
    const avatarUrl = user.userInfo && user.userInfo.avatar_url;

    return (
      <>
        <div className="navbar">
          <div className="w-100 px-3 d-flex">
            <div className="my-auto">
              <Link to="/">
                <img className="logo" src={mlReefIcon01} alt="" />
              </Link>
            </div>

            <MDropdown
              className="ml-3 my-auto"
              buttonClasses="btn btn-dark px-1"
              label="Projects"
              component={(
                <div className="project-box">
                  {user.auth ? (
                    <div className="user-projects">
                      <p><Link to="/#personal">Your Projects</Link></p>
                      <p><Link to="/#starred">Starred Projects</Link></p>
                      <p><Link to="/#explore">Explore Projects</Link></p>
                    </div>

                  ) : (
                    <div className="user-projects">
                      <p>
                        <Link to="/explore">Explore projects</Link>
                      </p>
                    </div>
                  )}
                  <div className="project-search">
                    <input
                      type="text"
                      placeholder="Search your projects"
                    />
                    <div className="mt-3">
                      <b>Frequently visited</b>
                    </div>
                  </div>
                </div>
              )}
            />

            <MDropdown
              className="ml-3 my-auto"
              buttonClasses="btn btn-dark px-1"
              label="Groups"
              component={(
                <div className="project-box">
                  {user.auth ? (
                    <div className="user-projects">
                      <p>Your Groups</p>
                      <p>Starred Groups</p>
                      <p>Explore Groups</p>
                      <p><Link to="/new-group">New Group</Link></p>
                    </div>

                  ) : (
                    <div className="user-projects">
                      <p>Explore Groups</p>
                    </div>
                  )}
                  <div className="project-search">
                    <input
                      type="text"
                      placeholder="Search your groups"
                    />
                    <div className="mt-3">
                      <b>Frequently visited</b>
                    </div>
                  </div>
                </div>
              )}
            />

            {user.auth && (
              <>
                <MDropdown
                  align="right"
                  className="m-dropdown ml-auto my-auto"
                  buttonClasses="btn btn-dark d-flex p-2"
                  label={(
                    <img src={helpWhite} alt="" style={{ width: '1.8rem' }} />
                  )}
                  component={(
                    <div className="help-box">
                      <div>
                        <a target="_blank" rel="noopener noreferrer" href="https://doc.mlreef.com">Documentation</a>
                      </div>
                      <div>
                        <a target="_blank" rel="noopener noreferrer" href="https://mlreefcommunity.slack.com">Slack Community</a>
                      </div>
                    </div>
                  )}
                />

                <MDropdown
                  align="right"
                  className="ml-0 my-auto"
                  buttonClasses="btn btn-dark d-flex p-2"
                  label={(
                    <div
                      style={{ backgroundImage: `url(${avatarUrl})` }}
                      className="avatar-circle bg-image bg-cover"
                    />
                  )}
                  component={(
                    <div className="sign-box">
                      <div>
                        {'Signed in as '}
                        <b id="cy-username">{user.username}</b>
                        <i>
                          {' '}
                          {user.email}
                        </i>
                      </div>
                      <p>
                        <Link to="/profile">Settings</Link>
                      </p>
                      <hr />
                      <p
                        onClick={this.handleSignOut}
                        onKeyDown={this.handleSignOut}
                      >
                        Sign Out
                      </p>
                    </div>
                  )}
                />
              </>
            )}

            {!user.auth && (
              <div className="d-none d-lg-flex ml-auto my-auto">
                <Link to="/login" className="btn btn-sm btn-dark mr-3 px-3">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-sm btn-outline-secondary keep-border">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
        {user.globalColorMarker && (
          <MGlobalMarker
            isLoading={user.isLoading}
            globalColorMarker={user.globalColorMarker}
          />
        )}
      </>
    );
  }
}

Navbar.propTypes = {
  actions: PropTypes
    .shape({
      logout: PropTypes.func.isRequired,
    })
    .isRequired,
  user: PropTypes
    .shape({
      auth: PropTypes.bool.isRequired,
      username: PropTypes.string,
      isLoading: PropTypes.bool.isRequired,
      globalColorMarker: PropTypes.string,
      email: PropTypes.string,
      userInfo: PropTypes.shape({
        avatar_url: PropTypes.string,
      }),
    })
    .isRequired,
};


function mapStateToProps(state) {
  return {
    projectsList: state.projects,
    user: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      logout: bindActionCreators(logout, dispatch),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
