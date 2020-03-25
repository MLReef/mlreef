import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import mlReefIcon01 from '../../images/MLReef_Logo_navbar.png';
import MDropdown from 'components/ui/MDropdown';
import { logout } from 'actions/userActions';
import './navbar.css';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = { redirect: null };
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  handleSignOut() {
    const { actions } = this.props;

    actions.logout()
      .then(() => {
        this.setState(() => ({
          redirect: true,
        }));
      });
  }

  redirectAfterSignOut() {
    const { user: { auth } } = this.props;

    if (auth) {
      if (this.state.redirect === true) {
        this.setState(() => ({
          redirect: false,
        }));
        return <Redirect to="/" />
      }
    }
    return null;
  }

  handleProject(e) {
    const { projectDialog } = this.state;
    if (!e) {
      return;
    }
    switch (e.target.id) {
      case 'your-projects':
        this.setState({ yourProjects: true });
        break;

      default:
        if (!projectDialog) {
          document.addEventListener('click', this.handleOutsideClick, false);
        } else {
          document.removeEventListener('click', this.handleOutsideClick, false);
        }
        this.setState((prevState) => ({
          projectDialog: !prevState.projectDialog,
        }));
        break;
    }
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
            component={
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
            }
          />

          <MDropdown
            align="right"
            className="ml-auto my-auto"
            buttonClasses="btn btn-dark d-flex p-2"
            label={(
              <div className="profile-pic-circle"/>
            )}
            component={(
              <div className="sign-box">
                <div>
                  Signed in as
                  {' '}
                  <b>{user.username}</b>
                  <i> {user.email}</i>
                </div>
                <hr />
                <p
                  onClick={this.handleSignOut}
                  onKeyDown={this.handleSignOut}
                >Sign Out</p>
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
