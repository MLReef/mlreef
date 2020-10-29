import React, { createContext, useMemo } from 'react';
import * as PropTypes from 'prop-types';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
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
  } = props;

  return (
    <BrowserRouter>
      <SwitchBase routes={routes} />
    </BrowserRouter>
  );
};

// This allows to extend route's functionality, such as named routes, but also
// can manage future features.
const Router = (props) => {
  const { routes } = props;

  const simpleRoutes = useSimpleRoutes(routes);

  return (
    <RouterContext.Provider value={simpleRoutes}>
      <RouterSimple routes={routes} />
    </RouterContext.Provider>
  );
};

SwitchBase.defaultProps = {
  routes: [],
};

RouterSimple.defaultProps = {
  routes: [],
};

Router.defaultProps = {
  routes: [],
};

SwitchBase.propTypes = {
  routes: PropTypes.arrayOf(RecordedPropTypes),
};

RouterSimple.propTypes = {
  routes: PropTypes.arrayOf(RecordedPropTypes),
};

Router.propTypes = {
  routes: PropTypes.arrayOf(RecordedPropTypes),
};

export default Router;
