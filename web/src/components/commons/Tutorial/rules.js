import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const replacePlaceholers = (info) => ({ regex, placeholders }) => {
  const reducePlaceholders = (re, ph) => re.replace(`:${ph}`, info[ph]);

  return (placeholders || []).reduce(reducePlaceholders, regex);
};

const useValidators = (validators, callback, info = {}) => {
  const location = useLocation();

  useEffect(
    () => {
      const deactivatings = [];
      // console.log(location.pathname);
      validators.forEach((validator) => {
        if (validator.type === 'urlChecker') {
          if (validator.condition) {
            if (location.pathname === validator.condition) callback();
          }

          if (validator.regex) {
            const replacedRegex = replacePlaceholers(info)(validator);
            // console.log('replacedRegex', replacedRegex);
            const re = new RegExp(replacedRegex);
            if (re.test(location.pathname)) callback();
          }
        }

        if (validator.type === 'clickListener') {
          const button = document.querySelector(validator.selector);

          if (button) {
            button.addEventListener('click', callback);

            deactivatings.push(() => button.removeEventListener('click', callback));
          }
        }

        return () => deactivatings.forEach((fn) => fn());
      });
    },
    [location, validators, callback, info],
  );
};

export default {
  useValidators,
};
