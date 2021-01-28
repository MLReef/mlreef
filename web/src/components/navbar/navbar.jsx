import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import MDropdown from 'components/ui/MDropdown';
import MWrapper from 'components/ui/MWrapper';
import { logout } from 'store/actions/userActions';
import { toggleTutorial } from 'store/actions/tutorialActions';
import MGlobalMarker from 'components/ui/MGlobalMarker/MGlobalMarker';
import mlReefIcon01 from '../../images/MLReef_Logo_navbar.png';
import helpWhite from '../../images/help_white.png';
import './navbar.scss';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.toggleTutorial = this.toggleTutorial.bind(this);
  }

  handleSignOut() {
    const { actions } = this.props;
    actions.logout();
  }

  toggleTutorial() {
    const { actions } = this.props;
    actions.toggleTutorial();
  }

  render() {
    const { user, globalMarker, tutorialActive } = this.props;
    const avatarUrl = user.userInfo && user.userInfo.avatar_url;

    return (
      <>
        <div className="navbar">
          <div className="w-100 px-3 d-flex">
            <div className="my-auto">
              <Link to={user.auth ? '/' : '/explore'} aria-label="Go to home" label="Go to home">
                <img className="logo" src={mlReefIcon01} alt="MLReef brand" />
              </Link>
            </div>

            <MDropdown
              className="ml-3 my-auto d-none d-lg-block"
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

            {user.auth && (
            <MDropdown
              className="ml-3 my-auto d-none d-lg-block"
              buttonClasses="btn btn-dark px-1"
              label="Groups"
              component={(
                <div className="project-box">
                  <div className="user-projects">
                    <p className="px-3">
                      <Link to="/groups">Explore Groups</Link>
                    </p>
                    <p className="px-3">
                      <Link to="/groups/new">New Group</Link>
                    </p>
                  </div>
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
            )}

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
                        <a target="_blank" rel="noopener noreferrer" href="https://doc.mlreef.com">
                          Documentation
                        </a>
                      </div>
                      <div>
                        <a target="_blank" rel="noopener noreferrer" href="https://mlreefcommunity.slack.com">
                          Slack Community
                        </a>
                      </div>
                      <div>
                        <button onClick={this.toggleTutorial} type="button" className="btn btn-hidden">
                          {`${tutorialActive ? 'Hide' : 'Show'} Tutorial`}
                        </button>
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
      toggleTutorial: PropTypes.func.isRequired,
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
  tutorialActive: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    projectsList: state.projects,
    user: state.user,
    globalMarker: state.globalMarker,
    tutorialActive: state.tutorial.active,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      logout: bindActionCreators(logout, dispatch),
      toggleTutorial: bindActionCreators(toggleTutorial, dispatch),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
