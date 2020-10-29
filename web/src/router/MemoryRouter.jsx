import React from 'react';
import { Router } from 'react-router-dom';
import PropTypes from 'prop-types';
import { createMemoryHistory as createHistory } from 'history';
import { SwitchBase, RouterContext, useSimpleRoutes } from './Router';

/**
 * Emulate a Router in a browser for testing.
 *
 * Similar to react-router-dom's MemoryRouter.
 * This component is needed because BrowserRouter doesn't accept history prop.
 *
 * @param {Object} props
 * @param {Array[String]} props.initialEntries routes used to create history.
 * @param {Array[Route]} routes list of routes that inlcudes the component.
 */
const MemoryRouter = (props) => {
  const {
    routes,
  } = props;

  const history = createHistory(props);

  const simpleRoutes = useSimpleRoutes(routes);

  return (
    <RouterContext.Provider value={simpleRoutes}>
      <Router history={history}>
        <SwitchBase routes={routes} />
      </Router>
    </RouterContext.Provider>
  );
};

MemoryRouter.defaultProps = {
  routes: [],
};

MemoryRouter.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.shape),
};

export default MemoryRouter;
