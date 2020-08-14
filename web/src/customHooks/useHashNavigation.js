import { useEffect, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

/**
 * Allows to manage using the route hash.
 *
 * @param {Function} setCallback a setState function that receives "label".
 * @param {String} depth level in the hash, e.g. (2) in #zero/one/this-example/tree.
 *
 * @return {Function} modified setter function.
 */
const useHashNavigation = (setCallback, depth = 0) => {
  const location = useLocation();
  const history = useHistory();

  useEffect(
    () => {
      const items = location.hash.replace(/^#/, '').split('/');
      if (items.length > 0 && items[0].length > 0) {
        setCallback(decodeURIComponent(items[depth]));
      }
    },
    [location.hash, setCallback, depth],
  );

  const onSelect = useCallback(
    (label) => {
      const items = location.hash.replace(/^#/, '').split('/');
      items[depth] = label;
      history.push(`#${items.join('/')}`);
    },
    [location.hash, history, depth],
  );

  return onSelect;
};

export default useHashNavigation;
