import { useCallback, useContext } from 'react';
import { useHistory as useReactHistory } from 'react-router-dom';
import { resolveRoute } from './functions';
import { RouterContext } from './Router';

const useHistory = () => {
  const history = useReactHistory();
  const routes = useContext(RouterContext);

  const push = useCallback(
    (route) => {
      const to = typeof route === 'string' ? route
        : resolveRoute(routes, route);

      return history.push(to);
    },
    [routes, history],
  );

  return { ...history, push };
};

export default useHistory;
