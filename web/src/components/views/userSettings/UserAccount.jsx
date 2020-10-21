import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import Navbar from '../../navbar/navbar';
import ProfileSection from './ProfileSection';
import './UserAccount.scss';

const UserAccount = () => {
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

  const breadcrumbs = [
    {
      name: 'User Settings',
      href: '/profile',
    },
    {
      name: 'Profile',
      href: '/profile',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="breadCrumbs web-box p-0">
        <div className="breadCrumbs-list">
          <MBreadcrumb items={breadcrumbs} />
        </div>
      </div>

      <div className="main-content py-4">
        <div className="simple-tabs">
          <div className="simple-tabs-container vertical">
            <ul ref={tabs} className="simple-tabs-menu vertical no-border">
              <li className="simple-tabs-menu-tab pills">
                <Link
                  role="button"
                  id="profile-btn"
                  onClick={menuBtnHandler}
                  className="simple-tabs-menu-tab-btn active"
                  to="/profile"
                >
                  Profile
                </Link>
              </li>

            </ul>
            <section id="profile-menu" className="simple-tabs-content left-border">
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
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(UserAccount);
