import React, { createContext, useMemo } from 'react';
import * as PropTypes from 'prop-types';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { RecordedPropTypes } from './routeModel';

export const RouterContext = createContext([]);

export const RouterSimple = (props) => {
  const {
    routes,
  } = props;

  return (
    <BrowserRouter>
      <Switch>
        {routes.map((route) => {
          const isPrivate = route?.meta?.authRequired;

          return isPrivate ? (
            <PrivateRoute
              key={`route-${route.name}-path-${route.path}`}
              path={route.path}
              exact={route.exact}
              component={route.component}
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
    </BrowserRouter>
  );
};

const Router = (props) => {
  const { routes } = props;

  const simpleRoutes = useMemo(
    () => routes.map((route) => ({ ...route, component: null })),
    [routes],
  );

  return (
    <RouterContext.Provider value={simpleRoutes}>
      <RouterSimple routes={routes} />
    </RouterContext.Provider>
  );
};

RouterSimple.defaultProps = {
  routes: [],
};

Router.defaultProps = {
  routes: [],
};

RouterSimple.propTypes = {
  routes: PropTypes.arrayOf(RecordedPropTypes),
};

Router.propTypes = {
  routes: PropTypes.arrayOf(RecordedPropTypes),
};

export default Router;
