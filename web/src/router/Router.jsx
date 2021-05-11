import React, { createContext, useMemo } from 'react';
import * as PropTypes from 'prop-types';
import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { RecordedPropTypes } from './routeModel';

export const RouterContext = createContext([]);

export const useSimpleRoutes = (routes) => useMemo(
  () => routes.map((route) => ({ ...route, component: null })),
  [routes],
);

// Can be used with Router or BrowserRouter, specially for MemoryRouter.
export const SwitchBase = (props) => {
  const {
    routes,
  } = props;

  return (
    <Switch>
      {routes.map((route) => {
        if (route.path === '/' || route.path?.length === 0) {
          return (
            <Redirect to="/dashboard/public/data_project" />
          );
        }
        const isPrivate = route?.meta?.authRequired;

        return isPrivate ? (
          <PrivateRoute
            key={`route-${route.name}-path-${route.path}`}
            path={route.path}
            exact={route.exact}
            component={route.component}
            debug={route.debug}
            owneronly={route.meta?.owneronly}
            role={route.meta?.role}
          />
        ) : (
          <Route
            key={`route-${route.name}`}
            path={route.path}
            exact={route.exact}
            component={route.component}
          />
        );
      })}
    </Switch>
  );
};

// Simplest and fully functional version
export const RouterSimple = (props) => {
  const {
    routes,
    children,
  } = props;

  return (
    <BrowserRouter>
      <SwitchBase routes={routes} />
      {children}
    </BrowserRouter>
  );
};

// This allows to extend route's functionality, such as named routes, but also
// can manage future features.
const Router = (props) => {
  const { routes, children } = props;

  const simpleRoutes = useSimpleRoutes(routes);

  return (
    <RouterContext.Provider value={simpleRoutes}>
      {/* eslint-disable-next-line */}
      <RouterSimple routes={routes} children={children} />
    </RouterContext.Provider>
  );
};

SwitchBase.defaultProps = {
  routes: [],
};

RouterSimple.defaultProps = {
  routes: [],
  children: null,
};

Router.defaultProps = {
  routes: [],
  children: null,
};

SwitchBase.propTypes = {
  routes: PropTypes.arrayOf(RecordedPropTypes),
};

RouterSimple.propTypes = {
  routes: PropTypes.arrayOf(RecordedPropTypes),
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
};

Router.propTypes = {
  routes: PropTypes.arrayOf(RecordedPropTypes),
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
};

export default Router;
