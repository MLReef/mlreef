import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import MDropdown from 'components/ui/MDropdown';
import { logout } from 'store/actions/userActions';
import { toggleTutorial } from 'store/actions/tutorialActions';
import MGlobalMarker from 'components/ui/MGlobalMarker/MGlobalMarker';
import mlReefIcon01 from '../../images/MLReef_Logo_navbar.png';
import helpWhite from '../../images/help_white.png';
import AILibraryW from '../../images/navbar-options/AI_Lib_w.png';
import AILibraryB from '../../images/navbar-options/AI_Lib_b.png';
import MLProjectsW from '../../images/navbar-options/ML-Projects_w.png';
import MLProjectsB from '../../images/navbar-options/ML-Projects_b.png';
import HomeB from '../../images/navbar-options/Home_b.png';
import HomeW from '../../images/navbar-options/Home_w.png';
import { AIPaths, MLPaths } from 'dataTypes';

import './navbar.scss';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.toggleTutorial = this.toggleTutorial.bind(this);
    this.state = {
      isMLProjects: false,
      isAILibrary: false,
      isHome: false
    };
  }

  activeMLProjects = () => {
    this.setState({
      isMLProjects: true,
      isAILibrary: false,
      isHome: false
    });
  };

  activeAILibrary = () => {
    this.setState({
      isMLProjects: false,
      isAILibrary: true,
      isHome: false
    });
  };

  activeHome = () => {
    this.setState({
      isMLProjects: false,
      isAILibrary: false,
      isHome: true
    });
  };

  getMLProjectsImage = () => this.state.isMLProjects ? MLProjectsB : MLProjectsW
  getAILibraryImage = () => this.state.isAILibrary ? AILibraryB : AILibraryW
  getHomeImage = () => this.state.isHome ? HomeB : HomeW

  handleSignOut() {
    const { actions } = this.props;
    actions.logout();
  }

  toggleTutorial() {
    const { actions } = this.props;
    actions.toggleTutorial();
  }

  componentDidMount(){
    const currentPath = window.location.pathname;
    if(MLPaths.includes(currentPath)){
      return this.activeMLProjects();
    } else if (AIPaths.includes(currentPath)){
      return this.activeAILibrary();
    } else if (currentPath.includes('welcome')){
      return this.activeHome();
    }
  }

  render() {
    const { user, globalMarker } = this.props;

    const MLProjectSrc = this.getMLProjectsImage();
    const AILibrarySrc = this.getAILibraryImage();
    const HomeSrc = this.getHomeImage();

    console.log({HomeSrc});

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
              <Link to={user.auth ? '/welcome' : '/welcome'} aria-label="Go to home" label="Go to home">
                <img className="logo" src={mlReefIcon01} alt="MLReef brand" />
              </Link>
            </div>

            <div className="ml-3 my-auto d-lg-block" onClick={this.activeHome}>
              <NavLink
                className="label"
                activeClassName="active"
                to={user.auth ? '/welcome' : '/welcome'}

              >
                <img src={HomeSrc} alt="MLReef Home" />
                <label >Home</label>
              </NavLink>
            </div>
            <div className="ml-3 my-auto d-lg-block" onClick={this.activeMLProjects}>
              <NavLink
                className="label"
                to={{ pathname: user.auth ? ('/dashboard/public/data_project'): '/welcome'}}
                activeClassName="active"
                isActive={(_, location)=>{
                  return MLPaths.includes(location.pathname);
                }}

              >
                <img src={MLProjectSrc} alt="MLReef ML Projects" />
                <label>ML Projects</label>
              </NavLink>
            </div>
            <div className="ml-3 my-auto d-lg-block" onClick={this.activeAILibrary}>
              <NavLink
                className="label"
                to={{pathname: user.auth ? '/dashboard/public/algorithm' : '/welcome'}}
                activeClassName="active"
                isActive={(_, location)=>{
                  return AIPaths.includes(location.pathname)
                }}

              >
                <img src={AILibrarySrc} alt="MLReef AI Library" />
                <label>AI Library</label>
              </NavLink>
            </div>
            {user.auth && (
              <>
                <MDropdown
                  align="right"
                  className="ml-auto my-auto"
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
