import { useEffect } from 'react';

export default () => {
  let isMounted = true;
  useEffect(() => () => { isMounted = false; }, []);

  return isMounted;
};
