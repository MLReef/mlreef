import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import Navbar from '../../navbar/navbar';
import ProfileSection from './ProfileSection';
import './UserAccount.scss';

const UserAccount = (props) => {
  const { user: { userInfo: { name } } } = props;
  const tabs = useRef(null);
  const routes = [
    {
      path: '/profile',
      exact: true,
      main: () => <ProfileSection />,
    },
    {
      path: '/profile/account',
      exact: true,
      main: () => <div>Account</div>,
    },
  ];

  function menuBtnHandler(e) {
    tabs.current.childNodes
      .forEach((btnNode) => {
        btnNode.classList.remove('active');
      });
    e.target.classList.add('active');
  }

  return (
    <>
      <Navbar />
      <div className="breadCrumbs web-box p-0">
        <div className="breadCrumbs-list">
          <div className="breadCrumbs-link">
            <ul style={{ listStyle: 'none' }} className="d-flex mb-0 pl-0">
              <li>
                <a href={`/${name}`}>
                  {name}
                  {' '}
                  >
                </a>
              </li>
              <li>Settings ></li>
              <li>Profile</li>
            </ul>
          </div>
        </div>
      </div>
      <div style={{ margin: '0 15%', height: 'auto' }} className="d-flex web-box pl-0">
        <div ref={tabs} className="insights-menu">
          <Link role="button" id="profile-btn" onClick={menuBtnHandler} className="mbtn active" to="/profile">
            Profile
          </Link>
        </div>
        <Switch>
          {routes.map((route, index) => (
            <Route
              key={index.toString()}
              path={route.path}
              exact={route.exact}
              component={route.main}
            />
          ))}
        </Switch>
      </div>
    </>
  );
};

UserAccount.propTypes = {
  user: PropTypes.shape({
    userInfo: PropTypes.shape({
      name: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(UserAccount);
