import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import propTypes from 'prop-types';
import {
  useGetOwned,
  useGetHasRole,
  useGetHasAccountType,
} from 'customHooks/permissions';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import hooks from 'customHooks/useSelectedProject';

/**
 * PrivateRoute.
 *
 * If no auth: redirect to login.
 * If a user doesn't fullfil permission will be redirected to error-page
 * Else: render route's component.
 *
 * @param {React.Component} component rendered by route.
 * @param {String} path
 * @param {Object[type, id]} resource (optional) resource to be checked.
 * @param {Boolean} owneronly if ownership is required.
 * @param {Number[int]} role min role required.
 * @param {Number[int]} accountType min account tier required.
 * @param {Boolean} debug print logs with internal values.
 */
const PrivateRoute = (routeProps) => {
  const {
    component: Component,
    redirect,
    resource,
    owneronly,
    role,
    accountType,
    debug,
    computedMatch: { params: { namespace, slug } },
    path,
    ...rest
  } = routeProps;

  const [selectedProject] = hooks.useSelectedProject(namespace, slug);

  // tries to get auth from redux state if not goes old way
  const user = useSelector((state) => state.user);
  const auth = !!user.auth;

  // means is owner or ownership not required
  const owned = useGetOwned(resource);

  // means has role enough high or role is not required
  const hasRole = useGetHasRole(role, resource);

  // means account tier is enough or account level is not required
  const hasAccountType = useGetHasAccountType(accountType);

  const permissions = useMemo(
    () => (!owneronly || owned) && (!role || hasRole || owned),
    [owneronly, owned, role, hasRole],
  );

  const allowed = useMemo(
    () => auth && permissions,
    [auth, permissions],
  );

  const redirectUrl = useMemo(
    () => {
      if (!auth) {
        return '/login';
      }
      if (!permissions) return '/error-page';
      return null;
    },
    [auth, permissions],
  );

  // eslint-disable-next-line
  debug && console.table({ auth, owneronly, role, owned, hasRole, hasAccountType, permissions, allowed });

  if (namespace && slug && !selectedProject.gid) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <Route
      {...rest}
      path={path}
      render={(props) => {
        if (path === '' || path === '/') {
          return (
            <Redirect to="/dashboard/public/data_project" />
          );
        }

        if (allowed) {
          return (
            <Component {...props} />
          );
        }

        return (
          <Redirect to={redirectUrl} />
        );
      }}
    />
  );
};

PrivateRoute.defaultProps = {
  resource: {
    type: 'project',
    id: 0,
  },
  owneronly: false,
  role: 0,
  accountType: 0,
  exact: false,
  debug: false,
};

PrivateRoute.propTypes = {
  resource: propTypes.shape({
    type: propTypes.string,
    id: propTypes.number,
  }),
  owneronly: propTypes.bool,
  role: propTypes.number,
  accountType: propTypes.number,
  path: propTypes.string.isRequired,
  exact: propTypes.bool,
  debug: propTypes.bool,
};

export default PrivateRoute;
