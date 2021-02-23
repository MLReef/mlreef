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

    const docuLink = (
      <a target="_blank" rel="noopener noreferrer" href="https://doc.mlreef.com">
        Documentation
      </a>
    );

    const slackLink = (
      <a target="_blank" rel="noopener noreferrer" href="https://mlreefcommunity.slack.com">
        Slack Community
      </a>
    );

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
                  <div className="user-projects">
                    {user.auth && (
                    <>
                      <Link to="/#personal">Your Projects</Link>
                      <Link to="/#starred">Starred Projects</Link>
                    </>
                    )}
                    <Link to="/#explore">Explore Projects</Link>
                  </div>
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
                    <Link to="/groups">Explore Groups</Link>
                    <Link to="/groups/new">New Group</Link>
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
                      <a target="_blank" rel="noopener noreferrer" href="https://doc.mlreef.com">
                        Documentation
                      </a>
                      <a target="_blank" rel="noopener noreferrer" href="https://mlreefcommunity.slack.com">
                        Slack Community
                      </a>
                      <button onClick={this.toggleTutorial} type="button" className="btn" style={{ borderRadius: 0 }}>
                        {`${tutorialActive ? 'Hide' : 'Show'} Tutorial`}
                      </button>
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
                      {docuLink}
                      {slackLink}
                      <a target="_blank" rel="noopener noreferrer" href="https://about.mlreef.com">
                        About MLReef
                      </a>
                    </div>
                  )}
                />
                <div className="ml-1 my-auto">
                  <Link to="/login?redirect=goback" className="btn btn-sm btn-dark mr-2 px-3">
                    <i className="fas fa-sign-in-alt d-lg-none" />
                    <span className="d-none d-lg-flex">Sign in</span>
                  </Link>
                  <Link to="/register" className="btn btn-sm btn-outline-secondary px-0 keep-border">
                    <i className="fas fa-user-plus d-lg-none px-2" />
                    <span className="d-none d-lg-flex px-3">Register</span>
                  </Link>
                </div>
              </>
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
