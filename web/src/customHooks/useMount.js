import { useEffect, useRef } from 'react';

export default () => {
  const unmounted = useRef(false);
  useEffect(() => () => {
    unmounted.current = true; 
  }, []);

  return unmounted.current;
};
