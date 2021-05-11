import { useEffect, useRef } from 'react';

const useEffectNoFirstRender = (effectsCallback, deps) => {
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    effectsCallback();
  }, deps);
};

export default useEffectNoFirstRender;
