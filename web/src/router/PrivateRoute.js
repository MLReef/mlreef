import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import propTypes from 'prop-types';
import {
  useGetOwned,
  useGetHasRole,
  useGetHasAccountType,
} from 'customHooks/permissions';

import { NO_AUTH_REDIRECT } from 'apiConfig';

// if external we need to redirect with window.location
const isExternal = /^https?/.test(NO_AUTH_REDIRECT);

/**
 * PrivateRoute.
 *
 * If no auth: redirect to login.
 * If no enough account tier: redirect to upgrade account page.
 * Else: render component.
 *
 * @param {React.Component} component rendered by route.
 * @param {String} path
 * @param {Object[type, id]} resource (optional) resource to be checked.
 * @param {Boolean} owneronly if ownership is required.
 * @param {Number[int]} role min role required.
 * @param {Number[int]} accountType min account tier required.
 */
const PrivateRoute = (routeProps) => {
  const {
    component: Component,
    path,
    resource,
    owneronly,
    role,
    accountType,
    ...rest
  } = routeProps;

  // tries to get auth from redux state if not goes old way
  const user = useSelector((state) => state.user);
  const auth = !!user.auth;

  // means is owner or ownership not required
  const owned = useGetOwned(owneronly, resource);

  // means has role enough high or role is not required
  const hasRole = useGetHasRole(role, resource);

  // means account tier is enough or account level is not required
  const hasAccountType = useGetHasAccountType(accountType);

  const permissions = useMemo(
    () => (owned || hasRole) && hasAccountType,
    [owned, hasRole, hasAccountType],
  );

  const allowed = useMemo(
    () => auth && permissions,
    [auth, permissions],
  );

  const redirectUrl = useMemo(
    () => {
      if (!auth) {
        if (isExternal) {
          window.location.assign(NO_AUTH_REDIRECT);
          return '/login';
        }
        return NO_AUTH_REDIRECT;
      }
      if (!permissions) return '/account/upgrade';
      return null;
    },
    [auth, permissions],
  );

  return (
    // eslint-disable-next-line
    <Route {...rest} exact render={(props) => (allowed
      /* eslint-disable-next-line */
      ? <Component {...props} />
      : isExternal ? null : <Redirect to={redirectUrl} />)}
    />
  );
};

PrivateRoute.defaultProps = {
  resource: {
    type: 'project',
    id: 0,
  },
  owner: false,
  role: 0,
  accountType: 0,
};

PrivateRoute.propTypes = {
  resource: propTypes.shape({
    type: propTypes.string,
    id: propTypes.number,
  }),
  owner: propTypes.bool,
  role: propTypes.number,
  accountType: propTypes.number,
};

export default PrivateRoute;
