import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import MDropdown from 'components/ui/MDropdown';
import MWrapper from 'components/ui/MWrapper';
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
    const { user, globalMarker } = this.props;
    const avatarUrl = user.userInfo && user.userInfo.avatar_url;

    return (
      <>
        <div className="navbar">
          <div className="w-100 px-3 d-flex">
            <div className="my-auto">
              <Link to={user.auth ? '/' : '/explore'}>
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
                      <p className="px-3">
                        <Link to="/#personal">Your Projects</Link>
                      </p>
                      <p className="px-3">
                        <Link to="/#starred">Starred Projects</Link>
                      </p>
                      <p className="px-3">
                        <Link to="/#explore">Explore Projects</Link>
                      </p>
                    </div>

                  ) : (
                    <div className="user-projects">
                      <p className="px-3">
                        <Link to="/explore">Explore projects</Link>
                      </p>
                    </div>
                  )}
                  <MWrapper norender>
                    <div className="project-search">
                      <input
                        type="text"
                        placeholder="Search your projects"
                      />
                      <div className="mt-3">
                        <b>Frequently visited</b>
                      </div>
                    </div>
                  </MWrapper>
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
                      <p className="px-3 d-none">
                        Your Groups
                      </p>
                      <p className="px-3 d-none">
                        Starred Groups
                      </p>
                      <p className="px-3">
                        <Link to="/groups">Explore Groups</Link>
                      </p>
                      <p className="px-3">
                        <Link to="/groups/new">New Group</Link>
                      </p>
                    </div>

                  ) : (
                    <div className="user-projects">
                      <p>Explore Groups</p>
                    </div>
                  )}
                  <MWrapper norender>
                    <div className="project-search">
                      <input
                        type="text"
                        placeholder="Search your groups"
                      />
                      <div className="mt-3">
                        <b>Frequently visited</b>
                      </div>
                    </div>
                  </MWrapper>
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
                <Link to="/login?redirect=goback" className="btn btn-sm btn-dark mr-3 px-3">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-sm btn-outline-secondary keep-border">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
        {globalMarker.color && (
          <MGlobalMarker
            isLoading={globalMarker.isLoading}
            globalColorMarker={globalMarker.color}
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
      email: PropTypes.string,
      userInfo: PropTypes.shape({
        avatar_url: PropTypes.string,
      }),
    })
    .isRequired,
  globalMarker: PropTypes.shape({
    color: PropTypes.string,
    isLoading: PropTypes.bool,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    projectsList: state.projects,
    user: state.user,
    globalMarker: state.globalMarker,
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
