import { useState } from 'react';

export default (callback) => {
  const [isLoading, setIsloading] = useState(false);

  const executeAction = (...args) => {
    setIsloading(true);

    callback(args).finally(() => setIsloading(false));
  };

  return [isLoading, executeAction];
};
