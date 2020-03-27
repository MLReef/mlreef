import React, { Component, createRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import MDropdown from 'components/ui/MDropdown';
import { logout } from 'actions/userActions';
import mlReefIcon01 from '../../images/MLReef_Logo_navbar.png';
import helpWhite from '../../images/help_white.png';
import './navbar.css';

class Navbar extends Component {
  btnPicUser = createRef();

  constructor(props) {
    super(props);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  componentDidMount() {
    this.btnPicUser.current.setAttribute('style', 'margin-left: 0px !important');
  }

  handleHelp = () => {
    const { helpDialog } = this.state;
    if (!helpDialog) {
      document.addEventListener('click', this.handleOutsideClick, false);
    } else {
      document.removeEventListener('click', this.handleOutsideClick, false);
    }

    this.setState((prevState) => ({
      helpDialog: !prevState.helpDialog,
    }));
  }

  handleProject(e) {
    const { projectDialog } = this.state;
    if (!e) {
      return;
    }

    if (!projectDialog) {
      document.addEventListener('click', this.handleOutsideClick, false);
    } else {
      document.removeEventListener('click', this.handleOutsideClick, false);
    }
    this.setState((prevState) => ({
      projectDialog: !prevState.projectDialog,
    }));
  }


  handleSignOut() {
    const { actions } = this.props;
    actions.logout();
  }

  render() {
    const { user } = this.props;

    return (
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
                <div className="user-projects">
                  <p><Link to="/my-projects#personal">Your Projects</Link></p>
                  <p><Link to="/my-projects#starred">Starred Projects</Link></p>
                  <p><Link to="/my-projects#explore">Explore Projects</Link></p>
                </div>
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
            align="right"
            className="m-dropdown ml-auto my-auto"
            buttonClasses="btn btn-dark d-flex p-2"
            label={(
              <img src={helpWhite} alt="" style={{ width: '1.8rem' }} />
            )}
            component={(
              <div className="help-box">
                <div>
                  <a target="_blank" rel="noopener noreferrer" href="https://gitlab.com/mlreef/frontend/-/blob/develop/doc/README.md">Documentation</a>
                </div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" href="https://mlreefcommunity.slack.com">Slack Community</a>
                </div>
              </div>
            )}
          />
          <MDropdown
            reference={this.btnPicUser}
            align="right"
            className="ml-auto my-auto"
            buttonClasses="btn btn-dark d-flex p-2"
            label={(
              <div className="profile-pic-circle" />
            )}
            component={(
              <div className="sign-box">
                <div>
                  Signed in as
                  {' '}
                  <b>{user.username}</b>
                  <i>
                    {' '}
                    {user.email}
                  </i>
                </div>
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
        </div>
      </div>
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
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
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
